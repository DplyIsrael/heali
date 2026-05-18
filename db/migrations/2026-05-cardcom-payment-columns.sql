-- CardCom integration: per-booking payment session + token + transaction
-- references. Idempotent.
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_low_profile_id text,
  ADD COLUMN IF NOT EXISTS payment_token text,
  ADD COLUMN IF NOT EXISTS payment_transaction_id text,
  ADD COLUMN IF NOT EXISTS payment_failure_reason text;
