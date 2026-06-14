"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, SearchIcon, TagsIcon, UserIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
  { href: "/tags", label: "Tags", icon: TagsIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 items-center justify-around border-t border-border bg-card py-2">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex min-w-14 flex-col items-center gap-1 py-1"
          >
            <Icon className={cn("size-5", active ? "text-forest" : "text-stone")} />
            <span
              className={cn(
                "text-[10px] font-medium",
                active ? "text-forest" : "text-stone"
              )}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
