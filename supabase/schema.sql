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

-- ─────────────────────────────────────────────────────────────────────────────
-- Login sessions
-- Logs every successful login for audit purposes.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS login_sessions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  role         text        NOT NULL CHECK (role IN ('faculty', 'approver')),
  faculty_code text,                        -- set when role = 'faculty'
  faculty_name text,                        -- denormalised for easy reading
  username     text,                        -- set when role = 'approver'
  remember_me  boolean     DEFAULT false,
  ip_address   text,
  user_agent   text,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS login_sessions_role_idx       ON login_sessions (role);
CREATE INDEX IF NOT EXISTS login_sessions_created_at_idx ON login_sessions (created_at DESC);
