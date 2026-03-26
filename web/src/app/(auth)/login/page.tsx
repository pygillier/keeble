'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Paper, Title, TextInput, PasswordInput, Button, Text, Stack } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { loginAction } from '@/lib/actions/auth';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await loginAction(email, password);
    setLoading(false);
    if (result.success) {
      router.push('/');
      router.refresh();
    } else {
      setError(result.error ?? t('loginError'));
    }
  }

  return (
    <Paper shadow="md" p="xl" radius="md" w="100%" maw={420} mx="md">
      <Title
        order={1}
        mb={4}
        style={{ fontFamily: 'var(--font-lora)', color: 'var(--mantine-color-forest-6)' }}
      >
        Keeble
      </Title>
      <Text c="dimmed" size="sm" mb="lg">
        {t('login')}
      </Text>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label={t('email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <PasswordInput
            label={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && (
            <Text c="red" size="sm">
              {error}
            </Text>
          )}
          <Button type="submit" loading={loading} fullWidth mt="xs">
            {t('loginButton')}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
