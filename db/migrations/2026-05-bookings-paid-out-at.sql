-- Admin-side payout tracking. Set when admin batch-marks a booking's
-- share as wire-transferred to the practitioner.
-- Idempotent.
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS paid_out_at timestamptz;

CREATE INDEX IF NOT EXISTS bookings_unpaid_payouts_idx
  ON public.bookings (practitioner_id)
  WHERE paid_out_at IS NULL AND status = 'completed';
