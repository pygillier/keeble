'use client';

import { useEffect, useState } from 'react';
import type { User } from '@/types';
import { getPb } from '@/lib/pb';

export function useAuth() {
  const pb = getPb();
  const [user, setUser] = useState<User | null>(
    pb.authStore.isValid ? (pb.authStore.model as unknown as User) : null,
  );
  const [isAdmin, setIsAdmin] = useState<boolean>(pb.authStore.isSuperuser ?? false);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setUser(pb.authStore.isValid ? (pb.authStore.model as unknown as User) : null);
      setIsAdmin(pb.authStore.isSuperuser ?? false);
    });
    return () => unsubscribe();
  }, [pb]);

  async function login(email: string, password: string) {
    const auth = await pb.collection('users').authWithPassword<User>(email, password);
    return auth;
  }

  function logout() {
    pb.authStore.clear();
  }

  return {
    user,
    isAdmin,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
