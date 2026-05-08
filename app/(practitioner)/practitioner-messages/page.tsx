import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessagingShell } from "@/components/messaging/messaging-shell";

export default async function PractitionerMessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <MessagingShell
      currentUserId={user.id}
      title="הודעות"
      emptyTitle="אין שיחות עדיין"
      emptyDescription="כשמטופל ישלח לך הודעה היא תופיע כאן"
    />
  );
}
