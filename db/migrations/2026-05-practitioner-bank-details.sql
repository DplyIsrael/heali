-- Bank account fields on practitioner_profiles for payout routing.
-- Idempotent.
ALTER TABLE public.practitioner_profiles
  ADD COLUMN IF NOT EXISTS bank_name text,
  ADD COLUMN IF NOT EXISTS bank_account_number text,
  ADD COLUMN IF NOT EXISTS bank_branch_number text,
  ADD COLUMN IF NOT EXISTS bank_number text;
