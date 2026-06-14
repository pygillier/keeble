"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AuthCard, AuthField, AuthSubmitButton } from "@/components/auth-card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
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
      setError("Incorrect email or password.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <AuthCard>
      <h2 className="mb-1 text-[17px] font-semibold text-slate">Sign in</h2>
      <p className="mb-5 text-sm leading-relaxed text-stone">
        Welcome back. Enter your details to access your family&apos;s vault.
      </p>
      <form onSubmit={handleSubmit}>
        <AuthField label="Email address">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </AuthField>
        <AuthField label="Password">
          <Input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </AuthField>
        {error && <p className="mb-3 text-xs text-rust">{error}</p>}
        <AuthSubmitButton type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </AuthSubmitButton>
      </form>
    </AuthCard>
  );
}
