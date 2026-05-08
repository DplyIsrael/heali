import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessagingShell } from "@/components/messaging/messaging-shell";

export default async function PatientMessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <MessagingShell
      currentUserId={user.id}
      title="הודעות"
      emptyTitle="אין שיחות עדיין"
      emptyDescription="כשתפתח שיחה עם מטפל היא תופיע כאן"
    />
  );
}
