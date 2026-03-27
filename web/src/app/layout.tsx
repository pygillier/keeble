import type { Metadata } from 'next';
import { DM_Sans, Lora } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import '@mantine/core/styles.css';
import './globals.css';
import { Providers } from '@/components/Providers';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600'],
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  weight: ['500'],
});

export const metadata: Metadata = {
  title: 'Keeble',
  description: 'Family documentation vault — step-by-step guides for everyone.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html lang="en" className={`${dmSans.variable} ${lora.variable}`} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
