import { getSessionUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="flex shrink-0 items-center justify-between bg-forest px-4 py-3">
        <span className="font-display text-xl text-white">Keeble</span>
        <div className="flex items-center gap-3">
          {user && (
            <div
              className="flex size-8 items-center justify-center rounded-full border border-white/35 bg-white/15 text-xs font-semibold text-white"
              title={user.display_name}
            >
              {user.display_name.charAt(0).toUpperCase()}
            </div>
          )}
          <LogoutButton />
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
