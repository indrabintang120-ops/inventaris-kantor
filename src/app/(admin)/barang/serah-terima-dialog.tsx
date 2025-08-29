'use client';

import { useEffect, useState, useTransition } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { serahTerimaBarang } from './actions';
import { useRouter } from 'next/navigation';

// Definisikan tipe data yang BENAR sesuai data dari API Anda
type Profile = {
  id: string;
  full_name: string | null;
  jabatan: string | null;
};

export function SerahTerimaDialog({
  barangId,
  children,
}: {
  barangId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [penggunaList, setPenggunaList] = useState<Profile[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen) {
      const fetchPengguna = async () => {
        try {
            const res = await fetch('/api/pengguna'); 
            if (!res.ok) throw new Error('Gagal mengambil data pengguna');
            const data: Profile[] = await res.json();
            setPenggunaList(data);
        } catch (error) {
            console.error(error);
            alert('Gagal memuat daftar pengguna.');
        }
      };
      fetchPengguna();
    }
  }, [isOpen]);

  const handleSubmit = (formData: FormData) => {
    formData.append('barangId', barangId);

    startTransition(async () => {
      const result = await serahTerimaBarang(formData);
      if (result.success) {
        alert('Serah terima barang berhasil.');
        setIsOpen(false);
        router.refresh();
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
          <DialogTitle>Formulir Serah Terima Barang</DialogTitle>
          <DialogDescription>
            Pilih pengguna yang akan menerima barang ini.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="kePenggunaId">Serahkan Kepada</Label>
            <Select name="kePenggunaId" required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih pengguna..." />
              </SelectTrigger>
              <SelectContent>
                {penggunaList.map((pengguna) => (
                  <SelectItem key={pengguna.id} value={pengguna.id}>
                    {/* Perbaikan di sini: gunakan full_name */}
                    {pengguna.full_name || 'Tanpa Nama'} ({pengguna.jabatan || 'Tanpa Jabatan'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="catatan">Catatan (Opsional)</Label>
            <Textarea
              id="catatan"
              name="catatan"
              placeholder="Catatan serah terima..."
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
              {isPending ? 'Menyimpan...' : 'Simpan & Serahkan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}