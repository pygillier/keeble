import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FamilyMembers } from "@/components/family-members";
import { LogoutButton } from "@/components/logout-button";
import { getSessionUser } from "@/lib/auth";
import { getMembers } from "@/lib/data";

export default async function ProfilePage() {
  const user = await getSessionUser();
  const members = user?.role === "editor" ? await getMembers() : [];

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <h1 className="font-display text-lg text-slate">Profile</h1>
      {user && (
        <div className="flex items-center gap-3 rounded-md border border-border bg-card p-4">
          <Avatar size="lg">
            <AvatarFallback className="bg-mist text-base font-semibold text-forest">
              {user.display_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-semibold text-slate">
              {user.display_name}
            </div>
            <div className="text-xs text-stone">{user.email}</div>
            <div className="mt-1 text-xs text-stone capitalize">
              {user.role}
            </div>
          </div>
        </div>
      )}
      {user?.role === "editor" && (
        <FamilyMembers initialMembers={members} currentUserId={user.id} />
      )}
      <LogoutButton className="self-start text-rust hover:text-rust/80" />
    </div>
  );
}
