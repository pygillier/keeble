'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import PocketBase from 'pocketbase';
import type { Document } from '@/types';

const PB_URL = process.env.POCKETBASE_URL ?? 'http://localhost:8090';

async function getAuthenticatedPb(): Promise<PocketBase> {
  const token = (await cookies()).get('pb_auth')?.value;
  const pb = new PocketBase(PB_URL);
  if (token) pb.authStore.save(token, null);
  return pb;
}

/**
 * Revalidate the document viewer page and the home list after any mutation.
 * Called by create, update, and delete actions.
 */
function revalidateDoc(id: string) {
  revalidatePath(`/doc/${id}`);
  revalidatePath('/');
}

export async function createDocAction(
  data: Pick<Document, 'title' | 'slug' | 'description' | 'body' | 'tags'>,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const pb = await getAuthenticatedPb();
    const created = await pb.collection('documents').create<Document>(data);
    revalidatePath('/');
    return { success: true, id: created.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Create failed' };
  }
}

export async function updateDocAction(
  id: string,
  data: Partial<Pick<Document, 'title' | 'slug' | 'description' | 'body' | 'tags'>>,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const pb = await getAuthenticatedPb();
    await pb.collection('documents').update(id, data);
    revalidateDoc(id);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
  }
}

export async function deleteDocAction(
  id: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const pb = await getAuthenticatedPb();
    await pb.collection('documents').delete(id);
    revalidateDoc(id);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Delete failed' };
  }
}

export async function uploadImageAction(
  docId: string,
  formData: FormData,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    const pb = await getAuthenticatedPb();
    const updated = await pb.collection('documents').update<Document>(docId, formData);
    const images = updated.images as string[];
    const filename = images[images.length - 1];
    const url = `/api/images/documents/${updated.id}/${filename}`;
    revalidateDoc(docId);
    return { success: true, url };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Upload failed' };
  }
}
