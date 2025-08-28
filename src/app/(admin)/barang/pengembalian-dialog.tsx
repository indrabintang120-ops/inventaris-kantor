'use client';

import { useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { pengembalianBarang } from './actions';

// Komponen ini menerima trigger (pemicu) sebagai children
export function PengembalianDialog({
  barangId,
  dariPenggunaId,
  children,
}: {
  barangId: string;
  dariPenggunaId: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    // Tambahkan ID barang dan pengguna ke form data sebelum dikirim
    formData.append('barangId', barangId);
    formData.append('dariPenggunaId', dariPenggunaId);

    startTransition(async () => {
      const result = await pengembalianBarang(formData);
      if (result.success) {
        setIsOpen(false);
        formRef.current?.reset();
      } else {
        alert(result.message);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Formulir Pengembalian Barang</DialogTitle>
          <DialogDescription>
            Konfirmasi untuk mengembalikan barang ini ke stok.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="catatan">Catatan Kondisi (Opsional)</Label>
            <Textarea
              id="catatan"
              name="catatan"
              placeholder="Misal: Kondisi baik, ada sedikit goresan."
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Konfirmasi Pengembalian'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}