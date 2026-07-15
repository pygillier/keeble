"use client";

import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/i18n/locale-context";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const dict = useDictionary();

  async function handleLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className={cn(
        "text-sm font-medium text-white/80 transition-colors hover:text-white",
        className
      )}
    >
      {dict.common.logOut}
    </button>
  );
}
