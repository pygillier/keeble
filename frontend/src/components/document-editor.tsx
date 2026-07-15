"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageUpIcon, XIcon } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { API_URL } from "@/lib/config";
import { formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagBadge } from "@/components/tag-badge";
import { DocumentContent } from "@/components/document-content";
import type { DocumentSummary, DocumentStatus } from "@/lib/data";
import { useDictionary, useLocale } from "@/i18n/locale-context";

type Busy = "idle" | "saving" | "deleting" | "uploading";

function SidebarSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border p-4">
      <h3 className="mb-3 text-[10px] font-semibold tracking-wider text-stone uppercase">
        {label}
      </h3>
      {children}
    </div>
  );
}

export function DocumentEditor({
  mode,
  initialDoc,
}: {
  mode: "new" | "edit";
  initialDoc?: DocumentSummary;
}) {
  const router = useRouter();
  const dict = useDictionary();
  const locale = useLocale();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialDoc?.title ?? "");
  const [tags, setTags] = useState<string[]>(initialDoc?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [contentMd, setContentMd] = useState(initialDoc?.content_md ?? "");
  const [status, setStatus] = useState<DocumentStatus>(
    initialDoc?.status ?? "draft"
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Busy>("idle");

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) setTags([...tags, tag]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function insertAtCursor(text: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContentMd((prev) => `${prev}\n${text}\n`);
      return;
    }
    const { selectionStart, selectionEnd, value } = textarea;
    const next = `${value.slice(0, selectionStart)}${text}${value.slice(selectionEnd)}`;
    setContentMd(next);
    requestAnimationFrame(() => {
      const cursor = selectionStart + text.length;
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setBusy("uploading");
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiFetch("/api/uploads", {
      method: "POST",
      body: formData,
    });
    setBusy("idle");

    if (!response.ok) {
      setError(dict.editor.couldntUploadImage);
      return;
    }

    const { url } = await response.json();
    insertAtCursor(`![${file.name}](${API_URL}${url})`);
  }

  async function handleSave() {
    setError(null);
    setBusy("saving");

    const payload = { title, tags, content_md: contentMd, status };
    const [path, method] =
      mode === "new"
        ? ["/api/documents", "POST"]
        : [`/api/documents/${initialDoc!.slug}`, "PUT"];
    const response = await apiFetch(path, {
      method,
      body: JSON.stringify(payload),
    });

    setBusy("idle");

    if (!response.ok) {
      setError(dict.editor.couldntSaveGuide);
      return;
    }

    const doc = await response.json();
    router.push(`/docs/${doc.slug}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!initialDoc) return;
    if (!window.confirm(dict.editor.confirmDelete(initialDoc.title))) {
      return;
    }

    setError(null);
    setBusy("deleting");
    const response = await apiFetch(`/api/documents/${initialDoc.slug}`, {
      method: "DELETE",
    });
    setBusy("idle");

    if (!response.ok) {
      setError(dict.editor.couldntDeleteGuide);
      return;
    }

    router.push("/");
    router.refresh();
  }

  const cancelHref = mode === "edit" ? `/docs/${initialDoc!.slug}` : "/";

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3">
        <span className="text-sm text-stone">
          {dict.editor.guides}
          <span className="px-1.5 text-stone-light">/</span>
          <strong className="font-medium text-slate">
            {title || dict.editor.untitled}
          </strong>
        </span>
        <div className="ml-auto flex items-center gap-2">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as DocumentStatus)}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-slate outline-none focus-visible:border-ring"
          >
            <option value="draft">{dict.editor.draft}</option>
            <option value="published">{dict.editor.published}</option>
          </select>
          <Link
            href={cancelHref}
            className="text-sm font-medium text-stone transition-colors hover:text-slate"
          >
            {dict.common.cancel}
          </Link>
          {mode === "edit" && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={busy !== "idle"}
            >
              {busy === "deleting" ? dict.editor.deleting : dict.editor.delete}
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={busy !== "idle" || !title.trim()}
            className="bg-forest hover:bg-forest-hover"
          >
            {busy === "saving" ? dict.editor.saving : dict.editor.saveChanges}
          </Button>
        </div>
      </div>

      {error && (
        <p className="border-b border-border bg-rust-bg px-4 py-2 text-xs text-rust">
          {error}
        </p>
      )}

      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex flex-col lg:w-64 lg:shrink-0 lg:border-r lg:border-border">
          <SidebarSection label={dict.editor.document}>
            <div className="mb-3">
              <label className="mb-1.5 block text-xs font-medium text-slate">
                {dict.editor.title}
              </label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={dict.editor.titlePlaceholder}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate">
                {dict.editor.slug}
              </label>
              <Input
                value={initialDoc?.slug ?? dict.editor.generatedOnSave}
                disabled
                className="font-mono text-xs"
              />
            </div>
          </SidebarSection>

          <SidebarSection label={dict.editor.tags}>
            <div className="mb-2 flex min-h-9 flex-wrap gap-1.5 rounded-lg border border-input bg-parchment p-1.5">
              {tags.map((tag) => (
                <TagBadge key={tag} tag={tag} className="px-2 py-0.5">
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    aria-label={dict.editor.removeTag(tag)}
                    className="text-forest/60 transition-colors hover:text-forest"
                  >
                    <XIcon className="size-3" />
                  </button>
                </TagBadge>
              ))}
            </div>
            <Input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTag();
                }
              }}
              onBlur={addTag}
              placeholder={dict.editor.addTagPlaceholder}
            />
          </SidebarSection>

          <SidebarSection label={dict.editor.images}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy !== "idle"}
              className="flex w-full flex-col items-center gap-1 rounded-lg border-[1.5px] border-dashed border-border bg-parchment px-3 py-4 text-center text-xs text-stone transition-colors hover:border-leaf hover:bg-mist hover:text-forest disabled:opacity-50"
            >
              <ImageUpIcon className="size-4" />
              {busy === "uploading" ? dict.editor.uploading : dict.editor.clickToUpload}
            </button>
          </SidebarSection>

          {initialDoc && (
            <SidebarSection label={dict.editor.metadata}>
              <p className="text-xs text-stone">
                {dict.common.updated(
                  formatRelativeTime(initialDoc.updated_at, locale, dict.common.justNow)
                )}
              </p>
              <p className="mt-1 text-xs text-stone">
                {dict.editor.created(
                  formatRelativeTime(initialDoc.created_at, locale, dict.common.justNow)
                )}
              </p>
            </SidebarSection>
          )}
        </div>

        <div className="flex flex-1 flex-col lg:flex-row">
          <div className="flex flex-1 flex-col border-b border-border lg:border-b-0 lg:border-r">
            <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border bg-parchment px-4 text-[10.5px] font-semibold tracking-wider text-stone uppercase">
              <span className="size-1.5 rounded-full bg-leaf" />
              {dict.editor.markdown}
            </div>
            <textarea
              ref={textareaRef}
              value={contentMd}
              onChange={(event) => setContentMd(event.target.value)}
              spellCheck={false}
              placeholder={dict.editor.contentPlaceholder}
              className="min-h-80 flex-1 resize-none bg-white p-4 font-mono text-xs leading-relaxed text-slate outline-none lg:min-h-0"
            />
          </div>

          <div className="flex flex-1 flex-col">
            <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border bg-parchment px-4 text-[10.5px] font-semibold tracking-wider text-stone uppercase">
              <span className="size-1.5 rounded-full bg-amber" />
              {dict.editor.preview}
            </div>
            <div className="flex-1 overflow-y-auto bg-white p-4">
              <h2 className="mb-2 font-display text-lg text-slate">
                {title || dict.editor.untitled}
              </h2>
              {tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>
              )}
              <DocumentContent content={contentMd} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
