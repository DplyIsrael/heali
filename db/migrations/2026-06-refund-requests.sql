-- Refund request queue: patient can request a cash refund of an active credit,
-- admin approves or rejects it from /admin/refund-requests. On approval the
-- linked credit is flipped to status='refunded' (its existing enum value) and
-- the actual money transfer happens out-of-band via bank wire.
--
-- Idempotent.

DO $$ BEGIN
  CREATE TYPE refund_request_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.refund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  -- Each request points at the credit being cashed out. SET NULL on delete
  -- so the audit history survives if a credit row is later purged.
  source_credit_id uuid REFERENCES public.credits(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL,
  reason text,
  status refund_request_status NOT NULL DEFAULT 'pending',
  admin_notes text,
  resolved_by_admin_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone
);

-- Admin queue query: pending requests, newest first.
CREATE INDEX IF NOT EXISTS refund_requests_status_created_idx
  ON public.refund_requests (status, created_at DESC);

-- Patient's own list.
CREATE INDEX IF NOT EXISTS refund_requests_patient_idx
  ON public.refund_requests (patient_id);

-- One pending request per credit at a time — prevents double-submission.
CREATE UNIQUE INDEX IF NOT EXISTS refund_requests_one_pending_per_credit_idx
  ON public.refund_requests (source_credit_id)
  WHERE status = 'pending' AND source_credit_id IS NOT NULL;
