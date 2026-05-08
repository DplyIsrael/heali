-- Prevent duplicate availability slots and duplicate blocked dates per
-- practitioner. Idempotent.
--
-- If existing data violates the constraint we abort early so it can be
-- cleaned up by hand.
--
-- Constraint names are kept under postgres's 63-char identifier limit so
-- the IF NOT EXISTS check matches what the ALTER actually creates.

DO $$
DECLARE
  dupes int;
BEGIN
  -- 1. practitioner_availability(practitioner_id, weekday, start_time)
  SELECT COUNT(*) INTO dupes FROM (
    SELECT 1 FROM public.practitioner_availability
    GROUP BY practitioner_id, weekday, start_time
    HAVING COUNT(*) > 1
  ) d;
  IF dupes > 0 THEN
    RAISE EXCEPTION 'practitioner_availability has % duplicate (practitioner_id, weekday, start_time) groups', dupes;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.practitioner_availability'::regclass
      AND conname = 'practitioner_availability_unique_slot'
  ) THEN
    ALTER TABLE public.practitioner_availability
      ADD CONSTRAINT practitioner_availability_unique_slot
      UNIQUE (practitioner_id, weekday, start_time);
  END IF;

  -- 2. availability_blocks(practitioner_id, blocked_date)
  SELECT COUNT(*) INTO dupes FROM (
    SELECT 1 FROM public.availability_blocks
    GROUP BY practitioner_id, blocked_date
    HAVING COUNT(*) > 1
  ) d;
  IF dupes > 0 THEN
    RAISE EXCEPTION 'availability_blocks has % duplicate (practitioner_id, blocked_date) groups', dupes;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.availability_blocks'::regclass
      AND conname = 'availability_blocks_unique_block'
  ) THEN
    ALTER TABLE public.availability_blocks
      ADD CONSTRAINT availability_blocks_unique_block
      UNIQUE (practitioner_id, blocked_date);
  END IF;
END $$;
