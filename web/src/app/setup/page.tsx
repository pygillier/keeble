'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  FileButton,
  Group,
  Paper,
  PasswordInput,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useTranslations } from 'next-intl';
import { completeSetupAction, createUserAction, importDocumentsAction } from '@/lib/actions/auth';

type Step = 0 | 1 | 2 | 3;

export default function SetupPage() {
  const t = useTranslations('setup');
  const router = useRouter();
  const [active, setActive] = useState<Step>(0);

  // Step 2 — create admin account
  const [familyName, setFamilyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step2Error, setStep2Error] = useState('');
  const [step2Loading, setStep2Loading] = useState(false);

  // Step 3 — locale + app name
  const [appName, setAppName] = useState('');
  const [locale, setLocale] = useState('en');

  // Step 4 — import + finish
  const [files, setFiles] = useState<File[]>([]);
  const [finishLoading, setFinishLoading] = useState(false);
  const [finishError, setFinishError] = useState('');

  async function handleCreateAdmin() {
    setStep2Error('');
    setStep2Loading(true);
    const result = await createUserAction(familyName, email, password);
    setStep2Loading(false);
    if (result.success) {
      setActive(2);
    } else {
      setStep2Error(result.error ?? 'Failed to create account.');
    }
  }

  async function handleFinish() {
    setFinishError('');
    setFinishLoading(true);

    // Import any selected markdown files
    if (files.length > 0) {
      const fileContents = await Promise.all(
        files.map(
          (f) =>
            new Promise<{ name: string; content: string }>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve({ name: f.name, content: reader.result as string });
              reader.onerror = reject;
              reader.readAsText(f);
            }),
        ),
      );
      await importDocumentsAction(fileContents);
    }

    const result = await completeSetupAction(appName || 'Keeble', locale);
    setFinishLoading(false);
    if (result.success) {
      router.push('/');
      router.refresh();
    } else {
      setFinishError(result.error ?? 'Setup failed.');
    }
  }

  return (
    <div
      style={{ minHeight: '100vh', backgroundColor: '#F7F5F0', display: 'flex', alignItems: 'center' }}
    >
      <Container size="sm" w="100%" py="xl">
        <Paper shadow="md" p={{ base: 'lg', sm: 'xl' }} radius="md">
          {/* Step 1 — Welcome */}
          {active === 0 && (
            <Stack align="center" gap="lg" py="xl">
              <Title
                order={1}
                style={{ fontFamily: 'var(--font-lora)', color: 'var(--mantine-color-forest-6)' }}
              >
                {t('welcome.title')}
              </Title>
              <Text c="dimmed" ta="center" size="lg">
                {t('welcome.subtitle')}
              </Text>
              <Text ta="center" maw={360} c="slate.7">
                {t('welcome.description')}
              </Text>
              <Button size="lg" mt="md" onClick={() => setActive(1)}>
                {t('welcome.cta')}
              </Button>
            </Stack>
          )}

          {/* Step 2 — Admin account */}
          {active === 1 && (
            <Stack gap="md">
              <Title order={2} style={{ fontFamily: 'var(--font-lora)' }}>
                {t('admin.title')}
              </Title>
              <TextInput
                label={t('admin.familyName')}
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="e.g. Alex"
                required
              />
              <TextInput
                label={t('admin.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <PasswordInput
                label={t('admin.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              {step2Error && (
                <Text c="red" size="sm">
                  {step2Error}
                </Text>
              )}
              <Group justify="space-between" mt="xs">
                <Button variant="subtle" onClick={() => setActive(0)}>
                  Back
                </Button>
                <Button
                  loading={step2Loading}
                  disabled={!familyName || !email || password.length < 8}
                  onClick={handleCreateAdmin}
                >
                  {t('admin.next')}
                </Button>
              </Group>
            </Stack>
          )}

          {/* Step 3 — Language & name */}
          {active === 2 && (
            <Stack gap="md">
              <Title order={2} style={{ fontFamily: 'var(--font-lora)' }}>
                {t('locale.title')}
              </Title>
              <TextInput
                label={t('locale.familyName')}
                placeholder="e.g. The Smiths"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
              />
              <Select
                label={t('locale.language')}
                value={locale}
                onChange={(v) => setLocale(v ?? 'en')}
                data={[
                  { value: 'en', label: 'English' },
                  { value: 'fr', label: 'Français' },
                  { value: 'de', label: 'Deutsch' },
                  { value: 'es', label: 'Español' },
                ]}
                allowDeselect={false}
              />
              <Group justify="flex-end" mt="xs">
                <Button onClick={() => setActive(3)}>{t('locale.next')}</Button>
              </Group>
            </Stack>
          )}

          {/* Step 4 — Import & finish */}
          {active === 3 && (
            <Stack gap="md">
              <Title order={2} style={{ fontFamily: 'var(--font-lora)' }}>
                {t('import.title')}
              </Title>
              <Text c="dimmed" size="sm">
                {t('import.description')}
              </Text>
              <FileButton onChange={setFiles} accept=".md" multiple>
                {(props) => (
                  <Button variant="outline" {...props}>
                    {files.length > 0 ? `${files.length} file(s) selected` : 'Choose .md files'}
                  </Button>
                )}
              </FileButton>
              {files.length > 0 && (
                <Text size="xs" c="dimmed">
                  {files.map((f) => f.name).join(', ')}
                </Text>
              )}
              {finishError && (
                <Text c="red" size="sm">
                  {finishError}
                </Text>
              )}
              <Group justify="space-between" mt="xs">
                <Button
                  variant="subtle"
                  loading={finishLoading}
                  onClick={() => {
                    setFiles([]);
                    handleFinish();
                  }}
                >
                  {t('import.skip')}
                </Button>
                <Button loading={finishLoading} onClick={handleFinish}>
                  {t('import.finish')}
                </Button>
              </Group>
            </Stack>
          )}

          {/* Step indicator dots */}
          <Group justify="center" mt="xl" gap={6}>
            {([0, 1, 2, 3] as Step[]).map((i) => (
              <Box
                key={i}
                w={8}
                h={8}
                style={{
                  borderRadius: '50%',
                  backgroundColor:
                    i === active
                      ? 'var(--mantine-color-forest-6)'
                      : 'var(--mantine-color-forest-1)',
                }}
              />
            ))}
          </Group>
        </Paper>
      </Container>
    </div>
  );
}
