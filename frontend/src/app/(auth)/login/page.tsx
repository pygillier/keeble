"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AuthCard, AuthField, AuthSubmitButton } from "@/components/auth-card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { useDictionary } from "@/i18n/locale-context";

export default function LoginPage() {
  const router = useRouter();
  const dict = useDictionary();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const response = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setSubmitting(false);

    if (!response.ok) {
      setError(dict.auth.incorrectCredentials);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <AuthCard>
      <h2 className="mb-1 text-[17px] font-semibold text-slate">{dict.auth.signIn}</h2>
      <p className="mb-5 text-sm leading-relaxed text-stone">
        {dict.auth.welcomeBack}
      </p>
      <form onSubmit={handleSubmit}>
        <AuthField label={dict.auth.email}>
          <Input
            type="email"
            placeholder={dict.auth.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </AuthField>
        <AuthField label={dict.auth.password}>
          <Input
            type="password"
            placeholder={dict.auth.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </AuthField>
        {error && <p className="mb-3 text-xs text-rust">{error}</p>}
        <AuthSubmitButton type="submit" disabled={submitting}>
          {submitting ? dict.auth.signingIn : dict.auth.signIn}
        </AuthSubmitButton>
      </form>
    </AuthCard>
  );
}
