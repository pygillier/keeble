import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { DocumentEditor } from "@/components/document-editor";

export default async function NewDocumentPage() {
  const user = await getSessionUser();
  if (user?.role !== "editor") redirect("/");

  return <DocumentEditor mode="new" />;
}
