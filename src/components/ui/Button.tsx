import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50",
        variant === "primary" &&
          "bg-(--color-primary) text-white hover:opacity-90",
        variant === "secondary" && "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
        variant === "outline" &&
          "border border-zinc-300 bg-transparent text-zinc-900 hover:bg-zinc-50",
        className
      )}
      {...props}
    />
  );
}
