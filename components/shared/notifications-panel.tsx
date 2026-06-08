"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Notification {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `לפני ${mins} דקות`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שעות`;
  const days = Math.floor(hours / 24);
  return `לפני ${days} ימים`;
}

function getNotificationText(n: Notification): { title: string; description: string; href?: string } {
  const payload = n.payload ?? {};
  switch (n.type) {
    case "new_practitioner":
      return { title: "מטפל חדש", description: `${payload.practitionerName ?? "מטפל"} נרשם/ה למערכת`, href: "/admin/practitioners" };
    case "new_review":
      return { title: "דירוג חדש", description: `דירוג ${payload.rating ?? ""} כוכבים מ-${payload.reviewerName ?? "מטופל"}` };
    case "booking_confirmed":
      return { title: "טיפול אושר", description: "הטיפול שלך אושר על ידי המטפל", href: "/my-treatments" };
    case "booking_declined":
      return { title: "טיפול נדחה", description: "הטיפול שלך נדחה", href: "/my-treatments" };
    case "new_booking":
      return { title: "טיפול חדש", description: `${payload.patientName ?? "מטופל"} הזמין/ה טיפול`, href: "/dashboard" };
    case "new_specialty_pending":
      return {
        title: "התמחות חדשה ממתינה לאישור",
        description: `${payload.practitionerName ?? "מטפל"} הוסיף/ה תחום התמחות חדש: ${payload.specialtyName ?? ""}`,
        href: "/admin/specialties",
      };
    default:
      return { title: "התראה", description: n.type };
  }
}

export function NotificationsPanel({ open, onClose, userId }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!open || !userId) return;

    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("notifications")
        .select("id, type, payload, read_at, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      setNotifications((data ?? []).map((n) => ({
        id: n.id,
        type: n.type,
        payload: (n.payload as Record<string, unknown>) ?? {},
        readAt: n.read_at,
        createdAt: n.created_at,
      })));
      setIsLoading(false);

      // Mark all as read
      if (data && data.length > 0) {
        const unreadIds = data.filter((n) => !n.read_at).map((n) => n.id);
        if (unreadIds.length > 0) {
          await supabase
            .from("notifications")
            .update({ read_at: new Date().toISOString() })
            .in("id", unreadIds);
        }
      }
    }
    load();
  }, [open, userId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full max-w-[400px] bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="size-5 text-black" />
            <h2 className="text-[20px] font-bold text-black">התראות</h2>
          </div>
          <button onClick={onClose}>
            <X className="size-5 text-muted" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="text-center text-muted py-10">טוען...</p>
          ) : notifications.length === 0 ? (
            <p className="text-center text-muted py-10">אין התראות</p>
          ) : (
            notifications.map((n) => {
              const { title, description, href } = getNotificationText(n);
              const isRead = !!n.readAt;
              const rowClass = `block px-5 py-4 border-b border-border transition-colors ${
                isRead ? "opacity-50" : ""
              } ${href ? "hover:bg-[#f4f7f7] cursor-pointer" : ""}`;
              const body = (
                <>
                  <p className="text-[16px] font-semibold text-black">{title}</p>
                  <p className="text-[14px] text-[#666] mt-0.5">{description}</p>
                  <p className="text-[12px] text-[#b8b8b8] mt-1">{timeAgo(n.createdAt)}</p>
                </>
              );
              return href ? (
                <Link key={n.id} href={href} onClick={onClose} className={rowClass}>
                  {body}
                </Link>
              ) : (
                <div key={n.id} className={rowClass}>
                  {body}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
