'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export function CetakButton({ id }: { id: number }) {
  return (
    <Link href={`/cetak/serah-terima/${id}`} target="_blank">
      <Button variant="outline" size="sm">
        <Printer className="mr-2 h-4 w-4" />
        Cetak
      </Button>
    </Link>
  );
}