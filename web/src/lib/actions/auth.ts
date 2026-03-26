'use server';

import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { User } from '@/types';

const PB_URL = process.env.POCKETBASE_URL ?? 'http://localhost:8090';

const COOKIE_OPTS = {
  path: '/',
  httpOnly: true,
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30, // 30 days
  secure: process.env.NODE_ENV === 'production',
};

export async function loginAction(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  const pb = new PocketBase(PB_URL);
  try {
    await pb.collection('users').authWithPassword<User>(email, password);
    (await cookies()).set('pb_auth', pb.authStore.token, COOKIE_OPTS);
    return { success: true };
  } catch {
    return { success: false, error: 'Invalid email or password.' };
  }
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete('pb_auth');
  redirect('/login');
}

export async function createUserAction(
  name: string,
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  const pb = new PocketBase(PB_URL);
  try {
    await pb.collection('users').create({
      name,
      email,
      password,
      passwordConfirm: password,
    });
    await pb.collection('users').authWithPassword(email, password);
    (await cookies()).set('pb_auth', pb.authStore.token, COOKIE_OPTS);
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create account.';
    return { success: false, error: msg };
  }
}

export async function completeSetupAction(
  appName: string,
  locale: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${PB_URL}/api/keeble/complete-setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_name: appName, default_locale: locale }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      return { success: false, error: data.error ?? 'Setup failed.' };
    }
    // Set locale cookie so next-intl picks it up immediately
    (await cookies()).set('keeble_locale', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
    return { success: true };
  } catch {
    return { success: false, error: 'Could not connect to server.' };
  }
}

export async function importDocumentsAction(
  files: Array<{ name: string; content: string }>,
): Promise<{ imported: number; errors: string[] }> {
  const token = (await cookies()).get('pb_auth')?.value;
  if (!token) return { imported: 0, errors: ['Not authenticated'] };

  const pb = new PocketBase(PB_URL);
  pb.authStore.save(token, null);

  const { parseDoc } = await import('@/lib/markdown');
  let imported = 0;
  const errors: string[] = [];

  for (const file of files) {
    try {
      const parsed = await parseDoc(file.content);
      const slug =
        parsed.frontmatter.slug ??
        file.name
          .replace(/\.md$/, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-');
      await pb.collection('documents').create({
        title: parsed.frontmatter.title ?? slug,
        slug,
        body: parsed.content,
      });
      imported++;
    } catch (err) {
      errors.push(`${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return { imported, errors };
}
