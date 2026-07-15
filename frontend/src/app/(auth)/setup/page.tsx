"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AuthCard, AuthField, AuthSubmitButton } from "@/components/auth-card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { useDictionary } from "@/i18n/locale-context";

const TOTAL_STEPS = 3;

function ProgressDots({ step }: { step: number }) {
  return (
    <div className="mb-6 flex gap-1.5">
      {Array.from({ length: TOTAL_STEPS }, (_, index) => (
        <div
          key={index}
          className={`h-1 flex-1 rounded-full transition-colors ${
            index < step
              ? "bg-forest"
              : index === step
                ? "bg-leaf"
                : "bg-mist"
          }`}
        />
      ))}
    </div>
  );
}

export default function SetupPage() {
  const router = useRouter();
  const dict = useDictionary();
  const [step, setStep] = useState(0);
  const [familyName, setFamilyName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const response = await apiFetch("/api/setup", {
      method: "POST",
      body: JSON.stringify({
        family_name: familyName,
        display_name: displayName,
        email,
        password,
      }),
    });

    setSubmitting(false);

    if (!response.ok) {
      setError(dict.setup.genericError);
      return;
    }

    setStep(2);
  }

  return (
    <AuthCard>
      <ProgressDots step={step} />

      {step === 0 && (
        <div>
          <div className="mb-1 text-[17px] font-semibold text-slate">
            {dict.setup.welcome}
          </div>
          <p className="mb-5 text-sm leading-relaxed text-stone">
            {dict.setup.intro}
          </p>
          <AuthSubmitButton onClick={() => setStep(1)}>
            {dict.setup.getStarted}
          </AuthSubmitButton>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSubmit}>
          <div className="mb-1 text-[11px] font-medium text-stone">
            {dict.setup.stepOf(2, TOTAL_STEPS)}
          </div>
          <div className="mb-1 text-[17px] font-semibold text-slate">
            {dict.setup.createAccount}
          </div>
          <p className="mb-5 text-sm leading-relaxed text-stone">
            {dict.setup.createAccountIntro}
          </p>
          <AuthField label={dict.setup.familyName}>
            <Input
              type="text"
              placeholder={dict.setup.familyNamePlaceholder}
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              required
            />
          </AuthField>
          <AuthField label={dict.setup.yourName}>
            <Input
              type="text"
              placeholder={dict.setup.yourNamePlaceholder}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </AuthField>
          <AuthField label={dict.setup.email}>
            <Input
              type="email"
              placeholder={dict.setup.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </AuthField>
          <AuthField label={dict.setup.password}>
            <Input
              type="password"
              placeholder={dict.setup.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </AuthField>
          {error && <p className="mb-3 text-xs text-rust">{error}</p>}
          <AuthSubmitButton type="submit" disabled={submitting}>
            {submitting ? dict.setup.creating : dict.setup.continue}
          </AuthSubmitButton>
        </form>
      )}

      {step === 2 && (
        <div>
          <div className="mb-1 text-[17px] font-semibold text-slate">
            {dict.setup.allSet}
          </div>
          <p className="mb-5 text-sm leading-relaxed text-stone">
            {dict.setup.allSetIntro}
          </p>
          <AuthSubmitButton
            onClick={() => {
              router.push("/");
              router.refresh();
            }}
          >
            {dict.setup.goHome}
          </AuthSubmitButton>
        </div>
      )}
    </AuthCard>
  );
}
