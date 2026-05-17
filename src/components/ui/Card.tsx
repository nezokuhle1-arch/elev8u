import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 bg-white p-6 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
