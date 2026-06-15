import { cn } from "@/lib/utils";
import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20",
        className
      )}
      {...props}
    />
  );
}
