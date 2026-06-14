import { serverApiGet } from "@/lib/server-fetch";

export type DocumentStatus = "draft" | "published";

export type DocumentSummary = {
  id: string;
  title: string;
  slug: string;
  tags: string[];
  content_md: string;
  author_id: string;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
};

export type TagCount = {
  tag: string;
  count: number;
};

export async function getDocuments(params?: {
  status?: DocumentStatus;
  tag?: string;
  q?: string;
}): Promise<DocumentSummary[]> {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.tag) search.set("tag", params.tag);
  if (params?.q) search.set("q", params.q);

  const query = search.toString();
  const docs = await serverApiGet<DocumentSummary[]>(
    `/documents${query ? `?${query}` : ""}`
  );
  return docs ?? [];
}

export async function getDocument(
  slug: string
): Promise<DocumentSummary | null> {
  return serverApiGet<DocumentSummary>(`/documents/${slug}`);
}

export async function getTags(): Promise<TagCount[]> {
  const tags = await serverApiGet<TagCount[]>("/tags");
  return tags ?? [];
}

export type Role = "reader" | "editor";

export type Member = {
  id: string;
  email: string;
  display_name: string;
  role: Role;
};

export async function getMembers(): Promise<Member[]> {
  const members = await serverApiGet<Member[]>("/members");
  return members ?? [];
}
