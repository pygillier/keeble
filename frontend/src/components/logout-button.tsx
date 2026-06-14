"use client";

import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm font-medium text-white/80 transition-colors hover:text-white"
    >
      Log out
    </button>
  );
}
