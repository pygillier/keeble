import { getSessionUser } from "@/lib/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
            <Avatar title={user.display_name} className="after:border-white/35">
              <AvatarFallback className="bg-white/15 text-xs font-semibold text-white">
                {user.display_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <LogoutButton />
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
