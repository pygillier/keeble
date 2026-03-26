'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import PocketBase from 'pocketbase';
import type { Tag } from '@/types';

const PB_URL = process.env.POCKETBASE_URL ?? 'http://localhost:8090';

async function getAuthenticatedPb(): Promise<PocketBase> {
  const token = (await cookies()).get('pb_auth')?.value;
  const pb = new PocketBase(PB_URL);
  if (token) pb.authStore.save(token, null);
  return pb;
}

function revalidateTags() {
  revalidatePath('/tags');
  revalidatePath('/');
}

export async function createTagAction(
  data: Pick<Tag, 'name' | 'color'>,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const pb = await getAuthenticatedPb();
    const created = await pb.collection('tags').create<Tag>(data);
    revalidateTags();
    return { success: true, id: created.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Create failed' };
  }
}

export async function updateTagAction(
  id: string,
  data: Partial<Pick<Tag, 'name' | 'color'>>,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const pb = await getAuthenticatedPb();
    await pb.collection('tags').update(id, data);
    revalidateTags();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
  }
}

export async function deleteTagAction(
  id: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const pb = await getAuthenticatedPb();
    await pb.collection('tags').delete(id);
    revalidateTags();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Delete failed' };
  }
}
