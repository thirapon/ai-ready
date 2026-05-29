-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)

CREATE TABLE IF NOT EXISTS leads (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  email      text        NOT NULL,
  message    text,
  created_at timestamptz DEFAULT now()
);

-- Optional: index on email for deduplication queries
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads (email);
