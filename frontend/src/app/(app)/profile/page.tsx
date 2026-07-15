import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FamilyMembers } from "@/components/family-members";
import { LanguageSelect } from "@/components/language-select";
import { LogoutButton } from "@/components/logout-button";
import { getMembers } from "@/lib/data";
import { getIntl } from "@/i18n/resolve-locale";

export default async function ProfilePage() {
  const { user, dict } = await getIntl();
  const members = user?.role === "editor" ? await getMembers() : [];

  const roleLabel =
    user?.role === "editor" ? dict.familyMembers.editor : dict.familyMembers.reader;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <h1 className="font-display text-lg text-slate">{dict.profile.title}</h1>
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
            <div className="mt-1 text-xs text-stone">{roleLabel}</div>
          </div>
        </div>
      )}
      {user && (
        <div className="flex items-center justify-between rounded-md border border-border bg-card p-4">
          <div>
            <h2 className="font-display text-base text-slate">
              {dict.profile.preferences}
            </h2>
            <div className="mt-0.5 text-xs text-stone">{dict.profile.language}</div>
          </div>
          <LanguageSelect value={user.locale} />
        </div>
      )}
      {user?.role === "editor" && (
        <FamilyMembers initialMembers={members} currentUserId={user.id} />
      )}
      <LogoutButton className="self-start text-rust hover:text-rust/80" />
    </div>
  );
}
