"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { getOrCreateConversation } from "@/lib/messaging/actions";

interface StartConversationButtonProps {
  /** users.id of the practitioner */
  practitionerUserId: string;
  /** Where to send the user once the conversation exists */
  redirectTo?: string;
  className?: string;
  label?: string;
}

/**
 * Pressable button that opens (or creates) a conversation with a
 * practitioner and routes to the messages page. Lives on patient-side
 * profile views.
 */
export function StartConversationButton({
  practitionerUserId,
  redirectTo = "/patient-messages",
  className = "flex items-center justify-center gap-2 w-full h-[44px] rounded-[8px] bg-[#f4f7f7] text-[16px] text-black",
  label = "שליחת הודעה",
}: StartConversationButtonProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const handleClick = async () => {
    setIsStarting(true);
    const result = await getOrCreateConversation(practitionerUserId);
    setIsStarting(false);
    if (result.success) {
      router.push(redirectTo);
    } else {
      toast.error(result.error ?? "שגיאה");
    }
  };

  return (
    <button type="button" onClick={handleClick} disabled={isStarting} className={className}>
      {isStarting ? <Spinner size="sm" /> : <MessageSquare className="size-4" />}
      {label}
    </button>
  );
}
