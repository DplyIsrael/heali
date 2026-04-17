"use client";

import { useState } from "react";
import { Search, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: boolean;
}

const MOCK_CONVERSATIONS: Conversation[] = [];

export default function PatientMessagesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const filtered = MOCK_CONVERSATIONS.filter((c) =>
    !search || c.name.includes(search)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-6 md:py-10">
        <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-6">הודעות</h1>

        <div className="flex gap-4 h-[600px] rounded-[12px] border border-border bg-white overflow-hidden">
          {/* Conversations list — right in RTL */}
          <div className="w-full md:w-[350px] border-l border-border flex flex-col shrink-0">
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute top-1/2 right-3 -translate-y-1/2 size-4 text-muted" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="חיפוש הודעה..."
                  className="pe-9 h-[40px] text-[14px]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[14px] text-muted">אין הודעות עדיין</p>
                </div>
              ) : (
                filtered.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-border/50 text-right transition-colors ${
                      selectedId === conv.id ? "bg-muted/10" : "hover:bg-muted/5"
                    }`}
                  >
                    <div className="size-[44px] rounded-full bg-muted/20 flex items-center justify-center text-[14px] font-medium text-muted shrink-0">
                      {conv.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-[15px] ${conv.unread ? "font-semibold" : "font-normal"} text-black`}>{conv.name}</span>
                        <span className="text-[12px] text-muted">{conv.time}</span>
                      </div>
                      <p className="text-[13px] text-muted truncate">{conv.lastMessage}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat area — left in RTL */}
          <div className="hidden md:flex flex-1 flex-col">
            {selectedId ? (
              <>
                <div className="flex-1 p-4 overflow-y-auto">
                  <p className="text-center text-muted text-[14px]">תחילת השיחה</p>
                </div>
                <div className="p-3 border-t border-border flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="כתוב הודעה..."
                    className="flex-1 h-[44px]"
                  />
                  <button className="size-[44px] rounded-[8px] bg-accent flex items-center justify-center shrink-0">
                    <Send className="size-5 text-black" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState title="בחר שיחה" description="בחר שיחה מהרשימה כדי לצפות בהודעות" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
