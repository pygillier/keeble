'use server';

import { revalidatePath } from 'next/cache';
import { getPb } from '@/lib/pb';
import type { Document } from '@/types';

/**
 * Revalidate the document viewer page and the home list after any mutation.
 * Called by create, update, and delete actions.
 */
function revalidateDoc(id: string) {
  revalidatePath(`/doc/${id}`);
  revalidatePath('/');
}

export async function updateDocAction(
  id: string,
  data: Partial<Pick<Document, 'title' | 'slug' | 'body' | 'tags'>>,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const pb = getPb();
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
    const pb = getPb();
    await pb.collection('documents').delete(id);
    revalidateDoc(id);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Delete failed' };
  }
}
