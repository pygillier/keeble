"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, SearchIcon, TagsIcon, UserIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDictionary } from "@/i18n/locale-context";
import type { Dictionary } from "@/i18n/dictionaries";

const NAV_ITEMS: { href: string; label: keyof Dictionary["nav"]; icon: typeof HomeIcon }[] = [
  { href: "/", label: "home", icon: HomeIcon },
  { href: "/search", label: "search", icon: SearchIcon },
  { href: "/tags", label: "tags", icon: TagsIcon },
  { href: "/profile", label: "profile", icon: UserIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const dict = useDictionary();

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
              {dict.nav[label]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
