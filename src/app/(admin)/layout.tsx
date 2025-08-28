'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Box,
  Users,
  Folder,
  FileText,
  History,
  Database,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/barang', label: 'Barang', icon: Box },
    { href: '/kategori', label: 'Kategori', icon: Folder },
    { href: '/pengguna', label: 'Pengguna', icon: Users },
    { href: '/laporan-serah-terima', label: 'Serah Terima', icon: History },
    { href: '/laporan-audit', label: 'Log Audit', icon: FileText },
    { href: '/backup', label: 'Backup', icon: Database },
  ];

  return (
    <div className="flex h-screen w-full bg-background">
      <aside className="w-64 flex-shrink-0 border-r bg-muted/40">
        <div className="flex h-full flex-col gap-4 py-4">
          <div className="px-4">
            <h2 className="text-lg font-semibold tracking-tight">
              Inventaris Kantor
            </h2>
          </div>
          <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  {
                    'bg-muted text-primary': pathname === item.href,
                  }
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}