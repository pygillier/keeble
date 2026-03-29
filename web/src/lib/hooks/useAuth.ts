'use client';

import { useEffect, useState } from 'react';
import type { User } from '@/types';
import { getPb } from '@/lib/pb';

export function useAuth() {
  const pb = getPb();
  const authRecord = () => (pb.authStore.isValid ? (pb.authStore.record as unknown as User) : null);

  const [user, setUser] = useState<User | null>(authRecord);
  const [isAdmin, setIsAdmin] = useState<boolean>(authRecord()?.is_admin ?? false);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      const record = authRecord();
      setUser(record);
      setIsAdmin(record?.is_admin ?? false);
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
