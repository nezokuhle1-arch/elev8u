"use client";

import { cn } from "@/lib/utils";
import { Calendar, Home, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Home", href: "/client/home", icon: Home },
  { label: "Search", href: "/client/concierge", icon: Search },
  { label: "Bookings", href: "/client/bookings", icon: Calendar },
  { label: "Profile", href: "/client/profile", icon: User },
] as const;

export function ClientBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-[480px] items-center justify-around px-2 py-2">
        {tabs.map(({ label, href, icon: Icon }) => {
          const basePath = href.split("#")[0];
          const isActive =
            label === "Search"
              ? pathname === "/client/concierge"
              : pathname === basePath ||
                (label !== "Home" && pathname.startsWith(`${basePath}/`));

          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium",
                isActive ? "text-[#305CDE]" : "text-gray-400"
              )}
            >
              <Icon className="h-[20px] w-[20px]" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
