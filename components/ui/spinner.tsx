import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "default" | "lg";
}

const sizeMap = {
  sm: "size-4 border-2",
  default: "size-6 border-2",
  lg: "size-10 border-3",
};

export function Spinner({ className, size = "default" }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-primary/30 border-t-primary",
        sizeMap[size],
        className
      )}
      role="status"
      aria-label="טוען"
    >
      <span className="sr-only">טוען...</span>
    </div>
  );
}
