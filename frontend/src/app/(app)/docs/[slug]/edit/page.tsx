import { notFound, redirect } from "next/navigation";

import { getDocument } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { DocumentEditor } from "@/components/document-editor";

export default async function EditDocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [user, doc] = await Promise.all([getSessionUser(), getDocument(slug)]);
  if (!doc) notFound();
  if (user?.role !== "editor") redirect(`/docs/${slug}`);

  return <DocumentEditor mode="edit" initialDoc={doc} />;
}
