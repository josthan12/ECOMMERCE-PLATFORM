import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

// No default padding — each usage (product card, dashboard summary card,
// admin table wrapper) applies its own, since needs differ per context.
export default function Card({
  hoverable = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface rounded-lg border border-border-light shadow-card",
        hoverable &&
          "transition-all duration-250 ease-out hover:-translate-y-1.5 hover:shadow-dropdown hover:border-accent",
        className
      )}
      {...props}
    />
  );
}