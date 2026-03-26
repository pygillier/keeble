'use client';

import { useEffect, useState } from 'react';
import type { User } from '@/types';
import { getPb } from '@/lib/pb';

export function useAuth() {
  const pb = getPb();
  const [user, setUser] = useState<User | null>(
    pb.authStore.isValid ? (pb.authStore.model as User) : null,
  );

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setUser(pb.authStore.isValid ? (pb.authStore.model as User) : null);
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
    login,
    logout,
    isAuthenticated: !!user,
  };
}
