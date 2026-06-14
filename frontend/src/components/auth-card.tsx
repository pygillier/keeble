export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-sm rounded-lg border border-border bg-white p-9 pb-7 shadow-lg">
      <h1 className="text-center font-display text-3xl text-forest">Keeble</h1>
      <p className="mb-6 text-center text-sm text-stone">
        Your family&apos;s guide to everything at home
      </p>
      {children}
    </div>
  );
}

export function AuthField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3.5">
      <label className="mb-1.5 block text-xs font-medium text-slate">
        {label}
      </label>
      {children}
    </div>
  );
}
