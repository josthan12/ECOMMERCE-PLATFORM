import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral" | "accent";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
  info: "bg-info/10 text-info",
  neutral: "bg-surface-muted text-text-muted",
  accent: "bg-accent-light text-primary",
};

export default function Badge({
  variant = "neutral",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-sans font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}