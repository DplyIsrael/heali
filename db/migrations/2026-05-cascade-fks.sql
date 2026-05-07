-- Add ON DELETE CASCADE / SET NULL to FKs that previously had no
-- delete behavior, so deleting a user/booking doesn't trigger a
-- 23503 foreign-key constraint error.
--
-- Idempotent: each FK is dropped (if it exists by name) and re-added.

DO $$
DECLARE
  fk_name text;
BEGIN
  -- bookings.patient_id → users.id (CASCADE)
  SELECT conname INTO fk_name FROM pg_constraint
   WHERE conrelid = 'public.bookings'::regclass AND contype = 'f'
     AND conkey = (SELECT array_agg(attnum) FROM pg_attribute
                   WHERE attrelid = 'public.bookings'::regclass AND attname = 'patient_id');
  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.bookings DROP CONSTRAINT %I', fk_name);
  END IF;
  ALTER TABLE public.bookings
    ADD CONSTRAINT bookings_patient_id_users_id_fk
    FOREIGN KEY (patient_id) REFERENCES public.users(id) ON DELETE CASCADE;

  -- bookings.practitioner_id → practitioner_profiles.id (CASCADE)
  SELECT conname INTO fk_name FROM pg_constraint
   WHERE conrelid = 'public.bookings'::regclass AND contype = 'f'
     AND conkey = (SELECT array_agg(attnum) FROM pg_attribute
                   WHERE attrelid = 'public.bookings'::regclass AND attname = 'practitioner_id');
  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.bookings DROP CONSTRAINT %I', fk_name);
  END IF;
  ALTER TABLE public.bookings
    ADD CONSTRAINT bookings_practitioner_id_practitioner_profiles_id_fk
    FOREIGN KEY (practitioner_id) REFERENCES public.practitioner_profiles(id) ON DELETE CASCADE;

  -- articles.author_id → users.id (CASCADE)
  SELECT conname INTO fk_name FROM pg_constraint
   WHERE conrelid = 'public.articles'::regclass AND contype = 'f'
     AND conkey = (SELECT array_agg(attnum) FROM pg_attribute
                   WHERE attrelid = 'public.articles'::regclass AND attname = 'author_id');
  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.articles DROP CONSTRAINT %I', fk_name);
  END IF;
  ALTER TABLE public.articles
    ADD CONSTRAINT articles_author_id_users_id_fk
    FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;

  -- articles.practitioner_id → practitioner_profiles.id (CASCADE)
  SELECT conname INTO fk_name FROM pg_constraint
   WHERE conrelid = 'public.articles'::regclass AND contype = 'f'
     AND conkey = (SELECT array_agg(attnum) FROM pg_attribute
                   WHERE attrelid = 'public.articles'::regclass AND attname = 'practitioner_id');
  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.articles DROP CONSTRAINT %I', fk_name);
  END IF;
  ALTER TABLE public.articles
    ADD CONSTRAINT articles_practitioner_id_practitioner_profiles_id_fk
    FOREIGN KEY (practitioner_id) REFERENCES public.practitioner_profiles(id) ON DELETE CASCADE;

  -- reviews.booking_id → bookings.id (CASCADE)
  SELECT conname INTO fk_name FROM pg_constraint
   WHERE conrelid = 'public.reviews'::regclass AND contype = 'f'
     AND conkey = (SELECT array_agg(attnum) FROM pg_attribute
                   WHERE attrelid = 'public.reviews'::regclass AND attname = 'booking_id');
  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.reviews DROP CONSTRAINT %I', fk_name);
  END IF;
  ALTER TABLE public.reviews
    ADD CONSTRAINT reviews_booking_id_bookings_id_fk
    FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;

  -- credits.source_booking_id → bookings.id (SET NULL — keep credit row,
  -- just unlink it from a deleted booking so the audit trail survives)
  SELECT conname INTO fk_name FROM pg_constraint
   WHERE conrelid = 'public.credits'::regclass AND contype = 'f'
     AND conkey = (SELECT array_agg(attnum) FROM pg_attribute
                   WHERE attrelid = 'public.credits'::regclass AND attname = 'source_booking_id');
  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.credits DROP CONSTRAINT %I', fk_name);
  END IF;
  ALTER TABLE public.credits
    ADD CONSTRAINT credits_source_booking_id_bookings_id_fk
    FOREIGN KEY (source_booking_id) REFERENCES public.bookings(id) ON DELETE SET NULL;
END $$;
