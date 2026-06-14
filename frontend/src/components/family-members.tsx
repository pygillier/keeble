"use client";

import { useState } from "react";
import { PlusIcon, TrashIcon } from "lucide-react";

import { apiFetch } from "@/lib/api";
import type { Member, Role } from "@/lib/data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const roleSelectClass =
  "h-7 rounded-lg border border-input bg-transparent px-2 text-xs text-slate capitalize outline-none focus-visible:border-ring disabled:opacity-50";

const emptyForm = { displayName: "", email: "", password: "", role: "reader" as Role };

function RoleSelect({
  value,
  onChange,
  disabled,
  className,
}: {
  value: Role;
  onChange: (role: Role) => void;
  disabled?: boolean;
  className: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as Role)}
      disabled={disabled}
      className={className}
    >
      <option value="reader">Reader</option>
      <option value="editor">Editor</option>
    </select>
  );
}

export function FamilyMembers({
  initialMembers,
  currentUserId,
}: {
  initialMembers: Member[];
  currentUserId: string;
}) {
  const [members, setMembers] = useState(initialMembers);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  async function handleRoleChange(member: Member, nextRole: Role) {
    setError(null);
    setBusyId(member.id);
    const response = await apiFetch(`/api/members/${member.id}`, {
      method: "PATCH",
      body: JSON.stringify({ role: nextRole }),
    });
    setBusyId(null);

    if (!response.ok) {
      setError("Couldn't update that member's role.");
      return;
    }

    const updated = await response.json();
    setMembers((current) =>
      current.map((m) => (m.id === member.id ? updated : m))
    );
  }

  async function handleDelete(member: Member) {
    if (!window.confirm(`Remove ${member.display_name} from the family?`)) {
      return;
    }

    setError(null);
    setBusyId(member.id);
    const response = await apiFetch(`/api/members/${member.id}`, {
      method: "DELETE",
    });
    setBusyId(null);

    if (!response.ok) {
      setError("Couldn't remove that member.");
      return;
    }

    setMembers((current) => current.filter((m) => m.id !== member.id));
  }

  async function handleCreate() {
    setError(null);
    setCreating(true);
    const response = await apiFetch("/api/members", {
      method: "POST",
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        display_name: form.displayName,
        role: form.role,
      }),
    });
    setCreating(false);

    if (!response.ok) {
      setError(
        response.status === 409
          ? "That email is already in use."
          : "Couldn't add that member."
      );
      return;
    }

    const created = await response.json();
    setMembers((current) => [...current, created]);
    setForm(emptyForm);
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base text-slate">Family members</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button size="sm" className="bg-forest hover:bg-forest-hover" />
            }
          >
            <PlusIcon />
            Add member
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a family member</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate">
                  Name
                </label>
                <Input
                  value={form.displayName}
                  onChange={(event) =>
                    setForm({ ...form, displayName: event.target.value })
                  }
                  placeholder="e.g. Sam"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate">
                  Email
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  placeholder="sam@example.com"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate">
                  Password
                </label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate">
                  Role
                </label>
                <RoleSelect
                  value={form.role}
                  onChange={(role) => setForm({ ...form, role })}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-slate capitalize outline-none focus-visible:border-ring"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleCreate}
                disabled={
                  creating ||
                  !form.displayName.trim() ||
                  !form.email.trim() ||
                  !form.password
                }
                className="bg-forest hover:bg-forest-hover"
              >
                {creating ? "Adding…" : "Add member"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <p className="rounded-md bg-rust-bg px-3 py-2 text-xs text-rust">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {members.map((member) => {
          const isSelf = member.id === currentUserId;
          return (
            <div
              key={member.id}
              className="flex items-center gap-3 rounded-md border border-border bg-card p-3"
            >
              <Avatar>
                <AvatarFallback className="bg-mist text-sm font-semibold text-forest">
                  {member.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate">
                  {member.display_name}
                  {isSelf && (
                    <span className="ml-1.5 text-xs font-normal text-stone">
                      (you)
                    </span>
                  )}
                </div>
                <div className="truncate text-xs text-stone">
                  {member.email}
                </div>
              </div>
              <RoleSelect
                value={member.role}
                onChange={(role) => handleRoleChange(member, role)}
                disabled={isSelf || busyId === member.id}
                className={roleSelectClass}
              />
              <button
                type="button"
                onClick={() => handleDelete(member)}
                disabled={isSelf || busyId === member.id}
                aria-label={`Remove ${member.display_name}`}
                className="text-stone transition-colors hover:text-rust disabled:opacity-30"
              >
                <TrashIcon className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
