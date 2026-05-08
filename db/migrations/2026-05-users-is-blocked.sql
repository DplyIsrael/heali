-- Add is_blocked flag to users so admins can block/unblock a patient.
-- Idempotent.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_blocked boolean NOT NULL DEFAULT false;
