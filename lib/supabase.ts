import { createClient } from "@supabase/supabase-js";

/**
 * Returns a Supabase client, throwing a clear error only at request time
 * (not at build time) if environment variables are missing.
 * This keeps Vercel builds passing even before env vars are configured in
 * the dashboard — the error surfaces when the API route is actually called.
 */
export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. " +
        "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
        "to your Vercel project settings (or .env.local for local dev)."
    );
  }

  // Disable Next.js fetch cache so every API call gets live data from Supabase
  return createClient(url, key, {
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}
