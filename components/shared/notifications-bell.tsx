"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { NotificationsPanel } from "./notifications-panel";

interface NotificationsBellProps {
  userId: string;
  /** Render bell as white-on-dark vs default black-on-light */
  variant?: "light" | "dark";
}

/**
 * Self-contained bell + badge + panel. Owns the unread count locally and
 * subscribes to Supabase Realtime so new notifications light up the badge
 * without a refresh. The panel itself handles list rendering and the
 * mark-as-read flow on open.
 */
export function NotificationsBell({ userId, variant = "light" }: NotificationsBellProps) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    let cancelled = false;

    // Initial unread count
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null)
      .then(({ count }) => {
        if (!cancelled) setUnreadCount(count ?? 0);
      });

    // Realtime: any INSERT for this user bumps the count.
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          if (!cancelled) setUnreadCount((c) => c + 1);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleClose = () => {
    setOpen(false);
    // Panel marks all as read on open, so by the time it closes the count
    // is already 0 in DB. Sync the local count so the badge disappears.
    setUnreadCount(0);
  };

  const bellColor =
    variant === "light"
      ? "text-white hover:text-accent"
      : "text-black hover:text-primary";

  return (
    <>
      <button
        type="button"
        aria-label="התראות"
        onClick={() => setOpen(true)}
        className={`relative transition-colors ${bellColor}`}
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      <NotificationsPanel open={open} onClose={handleClose} userId={userId} />
    </>
  );
}
