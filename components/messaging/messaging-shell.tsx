"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useRef, useState } from "react";
import { Search, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { createClient } from "@/lib/supabase/client";
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  markConversationRead,
  type ConversationListItem,
  type MessageItem,
} from "@/lib/messaging/actions";

interface MessagingShellProps {
  /** Authenticated user id — used to attribute messages and filter realtime. */
  currentUserId: string;
  /** Page title (e.g. "הודעות"). */
  title?: string;
  /** Optional empty state used when no conversations exist yet. */
  emptyTitle?: string;
  emptyDescription?: string;
}

function formatClock(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" });
}

export function MessagingShell({
  currentUserId,
  title = "הודעות",
  emptyTitle = "אין שיחות עדיין",
  emptyDescription = "שיחות שתתחיל יופיעו כאן",
}: MessagingShellProps) {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [isLoadingConvos, setIsLoadingConvos] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial conversation load
  useEffect(() => {
    void fetchConversations().then((list) => {
      setConversations(list);
      setIsLoadingConvos(false);
    });
  }, []);

  // Realtime: any message INSERT might affect us. Refresh convo list and,
  // if the new message belongs to the open thread, append it locally.
  useEffect(() => {
    if (!currentUserId) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`messaging:${currentUserId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const msg = payload.new as {
            id: string;
            conversation_id: string;
            sender_id: string;
            body: string;
            read_at: string | null;
            created_at: string;
          };
          // RLS already filters to messages we can see. Append if it's the
          // open thread.
          setSelectedId((cur) => {
            if (cur === msg.conversation_id) {
              setMessages((m) => [
                ...m,
                {
                  id: msg.id,
                  conversationId: msg.conversation_id,
                  senderId: msg.sender_id,
                  body: msg.body,
                  readAt: msg.read_at,
                  createdAt: msg.created_at,
                },
              ]);
            }
            return cur;
          });
          // Refresh the conversation list so previews + ordering update.
          const fresh = await fetchConversations();
          setConversations(fresh);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  // Load messages + mark read whenever the selection changes
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    setIsLoadingMsgs(true);
    void fetchMessages(selectedId).then((list) => {
      setMessages(list);
      setIsLoadingMsgs(false);
    });
    void markConversationRead(selectedId).then(() => {
      // Locally clear the unread badge for this convo
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedId ? { ...c, unreadCount: 0 } : c))
      );
    });
  }, [selectedId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const filtered = conversations.filter(
    (c) => !search || c.otherUserName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = async () => {
    if (!selectedId || !draft.trim()) return;
    setIsSending(true);
    const result = await sendMessage(selectedId, draft);
    setIsSending(false);
    if (result.success && result.data) {
      // Append optimistically — Realtime will also fire but de-dup by id.
      setMessages((prev) => (prev.find((m) => m.id === result.data!.id) ? prev : [...prev, result.data!]));
      setDraft("");
    } else {
      // Keep the draft so the user doesn't lose their text, and surface the error.
      toast.error(result.error ?? "שליחת ההודעה נכשלה, נסה שוב");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-6 md:py-10">
        <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-6">{title}</h1>

        <div className="flex h-[600px] rounded-[12px] border border-border bg-white overflow-hidden">
          {/* Conversations list — right side in RTL */}
          <div className="w-full md:w-[350px] border-l border-border flex flex-col shrink-0">
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute top-1/2 right-3 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="חיפוש לפי שם..."
                  className="pe-9 h-[40px] text-[14px]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoadingConvos ? (
                <div className="flex items-center justify-center h-32"><Spinner /></div>
              ) : filtered.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[14px] text-muted-foreground">
                    {conversations.length === 0 ? emptyTitle : "לא נמצאו תוצאות"}
                  </p>
                </div>
              ) : (
                filtered.map((conv) => (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setSelectedId(conv.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-border/50 text-right transition-colors ${
                      selectedId === conv.id ? "bg-muted/10" : "hover:bg-muted/5"
                    }`}
                  >
                    <div className="size-[44px] rounded-full bg-muted/20 flex items-center justify-center text-[14px] font-medium text-muted-foreground shrink-0 overflow-hidden">
                      {conv.otherUserAvatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={conv.otherUserAvatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        conv.otherUserName.slice(0, 2)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[15px] truncate ${
                            conv.unreadCount > 0 ? "font-semibold" : "font-normal"
                          } text-black`}
                        >
                          {conv.otherUserName || "—"}
                        </span>
                        <span className="text-[12px] text-muted-foreground shrink-0 ms-2">
                          {formatClock(conv.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-[13px] text-muted-foreground truncate flex-1">{conv.lastMessage || "—"}</p>
                        {conv.unreadCount > 0 && (
                          <span className="ms-2 inline-flex size-5 items-center justify-center rounded-full bg-accent text-black text-[11px] font-medium">
                            {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Thread — left side in RTL */}
          <div className="hidden md:flex flex-1 flex-col">
            {selectedId ? (
              <>
                <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2">
                  {isLoadingMsgs ? (
                    <div className="flex justify-center pt-8"><Spinner /></div>
                  ) : messages.length === 0 ? (
                    <p className="text-center text-muted-foreground text-[14px]">תחילת השיחה</p>
                  ) : (
                    messages.map((m) => {
                      const isMine = m.senderId === currentUserId;
                      return (
                        <div
                          key={m.id}
                          className={`flex ${isMine ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-[12px] px-3 py-2 text-[14px] whitespace-pre-wrap break-words ${
                              isMine
                                ? "bg-primary text-white"
                                : "bg-muted/15 text-foreground"
                            }`}
                          >
                            {m.body}
                            <div className={`mt-1 text-[10px] ${isMine ? "text-white/70" : "text-muted-foreground"}`}>
                              {formatClock(m.createdAt)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-3 border-t border-border flex gap-2">
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                    placeholder="כתוב הודעה..."
                    className="flex-1 h-[44px]"
                    disabled={isSending}
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={isSending || !draft.trim()}
                    className="size-[44px] rounded-[8px] bg-accent flex items-center justify-center shrink-0 disabled:opacity-50"
                  >
                    {isSending ? <Spinner size="sm" /> : <Send className="size-5 text-black" />}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState title="בחר שיחה" description={emptyDescription} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
