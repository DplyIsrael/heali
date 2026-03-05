import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status =
  | "approved"
  | "pending"
  | "pending_approval"
  | "rejected"
  | "submitted"
  | "draft"
  | "confirmed"
  | "completed"
  | "canceled"
  | "declined"
  | "requested";

const statusConfig: Record<Status, { label: string; className: string }> = {
  approved: { label: "מאושר", className: "bg-accent/20 text-green-800 border-accent" },
  confirmed: { label: "מאושר", className: "bg-accent/20 text-green-800 border-accent" },
  completed: { label: "הושלם", className: "bg-accent/20 text-green-800 border-accent" },
  pending: { label: "ממתין", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  pending_approval: { label: "ממתין לאישור", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  submitted: { label: "הוגש", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  requested: { label: "נשלח", className: "bg-blue-100 text-blue-800 border-blue-300" },
  draft: { label: "טיוטה", className: "bg-muted text-muted-foreground border-border" },
  rejected: { label: "נדחה", className: "bg-destructive/10 text-destructive border-destructive/30" },
  canceled: { label: "בוטל", className: "bg-destructive/10 text-destructive border-destructive/30" },
  declined: { label: "נדחה", className: "bg-destructive/10 text-destructive border-destructive/30" },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
