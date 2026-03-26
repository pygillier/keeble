'use client';

import { MantineProvider } from '@mantine/core';
import { keebleTheme } from '@/lib/theme';

export function Providers({ children }: { children: React.ReactNode }) {
  return <MantineProvider theme={keebleTheme}>{children}</MantineProvider>;
}
