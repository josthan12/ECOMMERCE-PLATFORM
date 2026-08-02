import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";


type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}



const sizeStyles: Record<ButtonSize, string> = {
  sm: "text-sm px-3 py-1.5 min-h-[36px]",
  md: "text-base px-4 py-2.5 min-h-[44px]",
  lg: "text-lg px-6 py-3 min-h-[48px]",
};

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "accent" | "inverse";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-text-inverse hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-transparent text-primary border border-primary hover:bg-surface-muted",
  ghost: "bg-transparent text-primary hover:bg-surface-muted",
  danger: "bg-error text-text-inverse hover:opacity-90",
  accent: "bg-accent text-accent-foreground hover:bg-primary-hover hover:text-text-inverse",
  inverse: "bg-text-inverse text-primary hover:bg-surface-muted",
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-sans font-medium",
        "transition-all duration-150 ease-out",
        "hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}
