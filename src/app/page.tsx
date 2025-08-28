'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Selamat Datang di Aplikasi Inventaris
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Anda telah berhasil login.
        </p>
        <Button onClick={handleLogout} variant="destructive" className="mt-6">
          Logout
        </Button>
      </div>
    </main>
  );
}