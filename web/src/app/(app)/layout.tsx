import { KeebleAppShell } from '@/components/layout/AppShell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <KeebleAppShell>{children}</KeebleAppShell>;
}
