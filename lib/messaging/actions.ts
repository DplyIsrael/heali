"use server";

import { createClient } from "@/lib/supabase/server";

export interface ConversationListItem {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatarUrl: string;
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

interface ActionResult<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * List every conversation the current user participates in. Includes the
 * other party's display info, the most recent message preview, and the
 * count of unread incoming messages.
 */
export async function fetchConversations(): Promise<ConversationListItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: convos } = await supabase
    .from("conversations")
    .select("id, patient_id, practitioner_user_id, last_message_at")
    .or(`patient_id.eq.${user.id},practitioner_user_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (!convos || convos.length === 0) return [];

  const otherIds = Array.from(
    new Set(
      convos.map((c: { patient_id: string; practitioner_user_id: string }) =>
        c.patient_id === user.id ? c.practitioner_user_id : c.patient_id
      )
    )
  );

  const { data: otherUsers } = await supabase
    .from("users")
    .select("id, full_name, profile_photo_url")
    .in("id", otherIds);

  const userMap: Record<string, { full_name: string; profile_photo_url: string | null }> = {};
  for (const u of otherUsers ?? []) {
    const row = u as { id: string; full_name: string; profile_photo_url: string | null };
    userMap[row.id] = { full_name: row.full_name, profile_photo_url: row.profile_photo_url };
  }

  // Fetch last message body + unread counts in two batched queries to avoid
  // an N+1 over conversations.
  const convoIds = convos.map((c: { id: string }) => c.id);
  const { data: lastMsgRows } = await supabase
    .from("messages")
    .select("conversation_id, body, created_at")
    .in("conversation_id", convoIds)
    .order("created_at", { ascending: false });
  const lastByConvo: Record<string, { body: string; createdAt: string }> = {};
  for (const m of lastMsgRows ?? []) {
    const row = m as { conversation_id: string; body: string; created_at: string };
    if (!lastByConvo[row.conversation_id]) {
      lastByConvo[row.conversation_id] = { body: row.body, createdAt: row.created_at };
    }
  }

  const { data: unreadRows } = await supabase
    .from("messages")
    .select("conversation_id")
    .in("conversation_id", convoIds)
    .neq("sender_id", user.id)
    .is("read_at", null);
  const unreadByConvo: Record<string, number> = {};
  for (const m of unreadRows ?? []) {
    const cid = (m as { conversation_id: string }).conversation_id;
    unreadByConvo[cid] = (unreadByConvo[cid] ?? 0) + 1;
  }

  return convos.map((c: { id: string; patient_id: string; practitioner_user_id: string; last_message_at: string | null }) => {
    const otherId = c.patient_id === user.id ? c.practitioner_user_id : c.patient_id;
    const other = userMap[otherId];
    const last = lastByConvo[c.id];
    return {
      id: c.id,
      otherUserId: otherId,
      otherUserName: other?.full_name ?? "",
      otherUserAvatarUrl: other?.profile_photo_url ?? "",
      lastMessage: last?.body ?? "",
      lastMessageAt: last?.createdAt ?? c.last_message_at,
      unreadCount: unreadByConvo[c.id] ?? 0,
    };
  });
}

export async function fetchMessages(conversationId: string): Promise<MessageItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, body, read_at, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return (data ?? []).map((m) => ({
    id: m.id,
    conversationId: m.conversation_id,
    senderId: m.sender_id,
    body: m.body,
    readAt: m.read_at,
    createdAt: m.created_at,
  }));
}

export async function sendMessage(
  conversationId: string,
  body: string
): Promise<ActionResult<MessageItem>> {
  const trimmed = body.trim();
  if (!trimmed) return { success: false, error: "הודעה ריקה" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body: trimmed,
    })
    .select("id, conversation_id, sender_id, body, read_at, created_at")
    .single();
  if (error || !data) return { success: false, error: "שגיאה בשליחת הודעה" };

  // Bump conversation order. RLS allows the sender to update.
  await supabase
    .from("conversations")
    .update({ last_message_at: data.created_at })
    .eq("id", conversationId);

  return {
    success: true,
    data: {
      id: data.id,
      conversationId: data.conversation_id,
      senderId: data.sender_id,
      body: data.body,
      readAt: data.read_at,
      createdAt: data.created_at,
    },
  };
}

/**
 * Get-or-create a conversation between the current user and another party.
 * Caller passes the *other* user's id; current user becomes whichever side
 * matches their role (patient vs practitioner).
 */
export async function getOrCreateConversation(
  otherUserId: string
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };
  if (otherUserId === user.id) return { success: false, error: "לא ניתן לשלוח הודעה לעצמך" };

  // Resolve roles: figure out which one is the patient vs the practitioner
  // so the (patient_id, practitioner_user_id) pair is consistent.
  const { data: rows } = await supabase
    .from("users")
    .select("id, role")
    .in("id", [user.id, otherUserId]);
  const roleMap: Record<string, string> = {};
  for (const r of rows ?? []) {
    const row = r as { id: string; role: string };
    roleMap[row.id] = row.role;
  }

  let patientId: string;
  let practitionerUserId: string;
  if (roleMap[user.id] === "patient" && roleMap[otherUserId] === "practitioner") {
    patientId = user.id;
    practitionerUserId = otherUserId;
  } else if (roleMap[user.id] === "practitioner" && roleMap[otherUserId] === "patient") {
    patientId = otherUserId;
    practitionerUserId = user.id;
  } else {
    return { success: false, error: "ניתן לשוחח רק בין מטופל ומטפל" };
  }

  // Try existing first
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("patient_id", patientId)
    .eq("practitioner_user_id", practitionerUserId)
    .maybeSingle();
  if (existing) return { success: true, data: { id: existing.id } };

  const { data, error } = await supabase
    .from("conversations")
    .insert({ patient_id: patientId, practitioner_user_id: practitionerUserId })
    .select("id")
    .single();
  if (error || !data) return { success: false, error: "שגיאה ביצירת שיחה" };
  return { success: true, data: { id: data.id } };
}

/**
 * Flip read_at on every unread incoming message in this conversation.
 * RLS only lets the recipient (i.e. sender_id <> auth.uid) do this.
 */
export async function markConversationRead(conversationId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .is("read_at", null);
  if (error) return { success: false, error: "שגיאה בסימון כנקרא" };
  return { success: true };
}
