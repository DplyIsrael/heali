-- Add 'tokenized' and 'failed' to the payment_status enum so CardCom flow
-- can express the intermediate + failure states. Idempotent.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel='tokenized' AND enumtypid='payment_status'::regtype) THEN
    ALTER TYPE payment_status ADD VALUE 'tokenized';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel='failed' AND enumtypid='payment_status'::regtype) THEN
    ALTER TYPE payment_status ADD VALUE 'failed';
  END IF;
END $$;
