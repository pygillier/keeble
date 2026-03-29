'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Avatar, Badge, Button, Divider, Stack, Text, Title } from '@mantine/core';
import { AppHeader } from '@/components/layout/Header';
import { useAuth } from '@/lib/hooks/useAuth';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tAuth = useTranslations('auth');
  const { user, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <>
      <AppHeader />
      <Stack p="lg" gap="lg">
        <Stack align="center" gap="sm" pt="md">
          <Avatar size={72} radius="xl" color="green" style={{ backgroundColor: '#3D9970' }}>
            {mounted && user?.name ? user.name[0].toUpperCase() : '?'}
          </Avatar>
          {mounted && user?.name && (
            <Title order={3} style={{ fontFamily: 'Lora, serif' }}>
              {user.name}
            </Title>
          )}
          {mounted && user?.email && (
            <Text c="dimmed" size="sm">
              {user.email}
            </Text>
          )}
          {mounted && (
            <Badge color={isAdmin ? 'green' : 'gray'} variant="light">
              {isAdmin ? t('roleAdmin') : t('roleMember')}
            </Badge>
          )}
        </Stack>

        <Divider />

        <Button variant="subtle" color="red" onClick={handleLogout} fullWidth>
          {tAuth('logout')}
        </Button>
      </Stack>
    </>
  );
}
