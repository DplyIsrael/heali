-- Enable Row-Level Security + Realtime on the notifications table so
-- the in-app bell can fetch a user's own notifications and receive
-- live INSERT events without a server roundtrip.
--
-- Idempotent — safe to re-run.

-- 1. Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. Policies: users can only see/update their own notifications.
--    Inserts continue to flow through the admin client (service role
--    bypasses RLS) so we don't need an INSERT policy here.
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. Add the table to the supabase_realtime publication so postgres_changes
--    on the realtime channel emits events for it. The IF NOT EXISTS guard
--    on the publication itself protects against fresh databases; the
--    ALTER PUBLICATION is wrapped to be idempotent.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
