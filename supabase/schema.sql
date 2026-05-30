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

-- ─────────────────────────────────────────────────────────────────────────────
-- Curriculum submissions (AI-Ready approval track)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS submissions (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_code     text        NOT NULL,
  faculty_name     text        NOT NULL,
  status           text        NOT NULL DEFAULT 'draft'
                               CHECK (status IN ('draft','pending','changes','approved')),
  ref_id           text,                        -- e.g. AI2026-0001
  version          integer     DEFAULT 0,       -- number of times submitted
  approver_comment text,                        -- feedback from approver
  submitted_at     timestamptz,
  approved_at      timestamptz,
  last_saved       timestamptz DEFAULT now(),
  created_at       timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS submissions_faculty_code_idx ON submissions (faculty_code);
CREATE INDEX IF NOT EXISTS submissions_status_idx ON submissions (status);
