'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
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
import { Input } from '@/components/ui/input'; // Menggunakan Input untuk Lokasi
import { serahTerimaBarang } from './actions'; // Menggunakan API Route
import { useRouter } from 'next/navigation';

// Definisikan tipe data untuk pengguna
type Pengguna = {
  id: string;
  nama_lengkap: string;
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
  const [penggunaList, setPenggunaList] = useState<Pengguna[]>([]);
  const [penerimaId, setPenerimaId] = useState<string>('');
  const [lokasi, setLokasi] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil daftar pengguna saat dialog akan dibuka
  useEffect(() => {
    if (isOpen) {
      const fetchPengguna = async () => {
        try {
            const res = await fetch('/api/pengguna');
            if (!res.ok) throw new Error('Gagal mengambil data pengguna');
            const data = await res.json();
            setPenggunaList(data);
        } catch (error) {
            console.error(error);
            alert('Gagal memuat daftar pengguna.');
        }
      };
      fetchPengguna();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
        const response = await fetch(`/api/serah-terima/${barangId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                penerimaId: penerimaId,
                lokasi: lokasi,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Gagal melakukan serah terima');
        }
        
        alert('Serah terima barang berhasil.');
        setIsOpen(false);
        router.refresh();

    } catch (error) {
        console.error(error);
        alert((error as Error).message);
    } finally {
        setIsSubmitting(false);
    }
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
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="kePenggunaId">Serahkan Kepada</Label>
            <Select onValueChange={setPenerimaId} value={penerimaId} required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih pengguna..." />
              </SelectTrigger>
              <SelectContent>
                {penggunaList.map((pengguna) => (
                  <SelectItem key={pengguna.id} value={pengguna.id}>
                    {pengguna.nama_lengkap || 'Tanpa Nama'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lokasi">Lokasi Baru</Label>
            <Input
              id="lokasi"
              name="lokasi"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="e.g. Meja Kerja Penerima"
              required
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
            <Button type="submit" disabled={isSubmitting || !penerimaId || !lokasi}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan & Serahkan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
