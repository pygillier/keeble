import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";

import { getDocument } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { TagBadge } from "@/components/tag-badge";
import { DocumentContent } from "@/components/document-content";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [doc, user] = await Promise.all([getDocument(slug), getSessionUser()]);
  if (!doc) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-forest px-4 py-4">
        <div className="mb-2 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-medium text-white/65 transition-colors hover:text-white"
          >
            <ArrowLeftIcon className="size-3.5" />
            Back
          </Link>
          {user?.role === "editor" && (
            <Link
              href={`/docs/${doc.slug}/edit`}
              className="inline-flex items-center gap-1 text-xs font-medium text-white/65 transition-colors hover:text-white"
            >
              <PencilIcon className="size-3.5" />
              Edit
            </Link>
          )}
        </div>
        <h1 className="font-display text-lg text-white">{doc.title}</h1>
        {doc.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {doc.tags.map((tag) => (
              <TagBadge
                key={tag}
                tag={tag}
                variant="slate"
                className="bg-white/15 text-white/90"
              />
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 p-4">
        <DocumentContent content={doc.content_md} />
      </div>
    </div>
  );
}
