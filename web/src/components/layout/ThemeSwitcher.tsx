'use client';

import { ActionIcon, Tooltip } from '@mantine/core';
import { useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

export function ThemeSwitcher() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const t = useTranslations('nav');

  const isDark = computedColorScheme === 'dark';

  return (
    <Tooltip label={isDark ? t('lightMode') : t('darkMode')} position="right" withArrow>
      <ActionIcon
        onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
        variant="subtle"
        color="gray"
        size="lg"
        aria-label={isDark ? t('lightMode') : t('darkMode')}
      >
        {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
      </ActionIcon>
    </Tooltip>
  );
}
