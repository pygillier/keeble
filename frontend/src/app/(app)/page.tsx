import { getSessionUser } from "@/lib/auth";

export default async function Home() {
  const user = await getSessionUser();

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background p-8 text-center">
      <h1 className="font-display text-4xl text-forest">Keeble</h1>
      <p className="mt-2 max-w-sm text-slate">
        Welcome back{user ? `, ${user.display_name}` : ""}. Your family&apos;s
        guides will live here.
      </p>
    </div>
  );
}
