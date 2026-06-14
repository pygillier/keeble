"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AuthCard, AuthField } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

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
      setError("Something went wrong. Please check your details and try again.");
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
            Welcome to Keeble
          </div>
          <p className="mb-5 text-sm leading-relaxed text-stone">
            Let&apos;s set up your family&apos;s vault. You&apos;ll create the
            admin account first &mdash; family members can be added later
            from the settings panel.
          </p>
          <Button
            onClick={() => setStep(1)}
            className="mt-1 h-auto w-full bg-forest py-2.5 text-[14.5px] font-semibold hover:bg-forest-hover"
          >
            Get started →
          </Button>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSubmit}>
          <div className="mb-1 text-[11px] font-medium text-stone">
            Step 2 of {TOTAL_STEPS} — Create admin account
          </div>
          <div className="mb-1 text-[17px] font-semibold text-slate">
            Create your account
          </div>
          <p className="mb-5 text-sm leading-relaxed text-stone">
            This will be the admin account. Family members can be added later
            from the settings panel.
          </p>
          <AuthField label="Family name">
            <Input
              type="text"
              placeholder="e.g. The Johnsons"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              required
            />
          </AuthField>
          <AuthField label="Your name">
            <Input
              type="text"
              placeholder="e.g. Alex"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </AuthField>
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
              placeholder="Choose a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </AuthField>
          {error && <p className="mb-3 text-xs text-rust">{error}</p>}
          <Button
            type="submit"
            disabled={submitting}
            className="mt-1 h-auto w-full bg-forest py-2.5 text-[14.5px] font-semibold hover:bg-forest-hover"
          >
            {submitting ? "Creating…" : "Continue →"}
          </Button>
        </form>
      )}

      {step === 2 && (
        <div>
          <div className="mb-1 text-[17px] font-semibold text-slate">
            You&apos;re all set
          </div>
          <p className="mb-5 text-sm leading-relaxed text-stone">
            Your family&apos;s vault is ready. You can start adding guides
            right away.
          </p>
          <Button
            onClick={() => {
              router.push("/");
              router.refresh();
            }}
            className="mt-1 h-auto w-full bg-forest py-2.5 text-[14.5px] font-semibold hover:bg-forest-hover"
          >
            Go to Home →
          </Button>
        </div>
      )}
    </AuthCard>
  );
}
