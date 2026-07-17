import { getSupabaseClient } from "@/lib/supabase";

type MappingColumn = "layer1_mapping" | "layer2_mapping";
type StatusColumn = "layer1_status" | "layer2_status";

interface UpsertRowParams {
  submissionId: string;
  mappingColumn: MappingColumn;
  statusColumn: StatusColumn;
  row?: { id: string } & Record<string, unknown>;
  deleteId?: string;
  statusAction?: "draft" | "submit";
}

type MergeResult =
  | { mapping: Record<string, unknown>[] }
  | { notFound: true }
  | { error: string };

const MAX_ATTEMPTS = 12;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Upserts or deletes a single row inside a submission's layer1_mapping /
 * layer2_mapping JSONB array without clobbering rows other users have
 * already saved — critical because several faculty members typically share
 * one department login, so they're all editing the same submission row from
 * different devices at the same time.
 *
 * Concurrency safety comes from Postgres's built-in `xmin` system column
 * (the transaction id that last wrote the row), which PostgREST happens to
 * expose through a normal `select`/`eq` filter. Each attempt reads the
 * current mapping + xmin, merges in this one row/deletion, then writes back
 * conditioned on `xmin` being unchanged. If another request updated the row
 * in between, the write matches 0 rows and this retries against fresh data
 * — a standard optimistic-concurrency loop, with no schema migration
 * required (we don't have credentials to run one against the live DB).
 */
export async function upsertMappingRow({
  submissionId,
  mappingColumn,
  statusColumn,
  row,
  deleteId,
  statusAction,
}: UpsertRowParams): Promise<MergeResult> {
  const client = getSupabaseClient();

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const { data: current, error: readErr } = await client
      .from("submissions")
      .select(`${mappingColumn}, xmin`)
      .eq("id", submissionId)
      .maybeSingle();

    if (readErr) return { error: readErr.message };
    if (!current) return { notFound: true };

    const currentRow = current as Record<string, unknown>;
    const currentMapping: Record<string, unknown>[] = Array.isArray(currentRow[mappingColumn])
      ? (currentRow[mappingColumn] as Record<string, unknown>[])
      : [];

    let nextMapping = currentMapping;
    if (deleteId) {
      nextMapping = currentMapping.filter((r) => r.id !== deleteId);
    } else if (row) {
      const idx = currentMapping.findIndex((r) => r.id === row.id);
      nextMapping = idx >= 0
        ? currentMapping.map((r, i) => (i === idx ? row : r))
        : [...currentMapping, row];
    }

    const updatePayload: Record<string, unknown> = { [mappingColumn]: nextMapping };
    if (statusAction === "submit") updatePayload[statusColumn] = "submitted";
    else if (row || deleteId) updatePayload[statusColumn] = "in_progress";

    const { data: written, error: writeErr } = await client
      .from("submissions")
      .update(updatePayload)
      .eq("id", submissionId)
      .eq("xmin", currentRow.xmin as string)
      .select(mappingColumn)
      .maybeSingle();

    if (writeErr) return { error: writeErr.message };
    if (written) {
      return { mapping: (written as Record<string, unknown>)[mappingColumn] as Record<string, unknown>[] };
    }
    // xmin mismatch — someone else wrote in between. Retry against fresh
    // data, backing off a bit more each attempt so a burst of writers
    // (e.g. a whole department saving around the same moment) spreads out
    // instead of repeatedly colliding on every retry.
    await sleep(20 + attempt * 15 + Math.random() * 60);
  }

  return { error: "Too many concurrent updates — please try again." };
}
