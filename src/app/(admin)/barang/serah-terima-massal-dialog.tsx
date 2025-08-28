'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Row } from '@tanstack/react-table';
import { ArrowRightLeft } from 'lucide-react';

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
import { createClient } from '@/lib/supabase/client';
import { type Barang } from './columns';
import { useRouter } from 'next/navigation';

type Pengguna = {
  id: string;
  full_name: string | null;
};

export function SerahTerimaMassalDialog({
  selectedRows,
  onSuccess,
}: {
  selectedRows: Row<Barang>[];
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [penggunaList, setPenggunaList] = useState<Pengguna[]>([]);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpen) {
      const supabase = createClient();
      const fetchPengguna = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name')
          .order('full_name');
        setPenggunaList(data || []);
      };
      fetchPengguna();
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const selectedIds = selectedRows.map((row) => row.original.id);
    
    const dataToSubmit = {
        barangIds: selectedIds,
        kePenggunaId: formData.get('kePenggunaId'),
        catatan: formData.get('catatan')
    };

    startTransition(async () => {
      const response = await fetch('/api/serah-terima-massal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      });

      if (response.ok) {
        setIsOpen(false);
        formRef.current?.reset();
        onSuccess();
        router.refresh(); // Refresh data di halaman
      } else {
        const result = await response.json();
        alert(`Gagal menyimpan: ${result.error}`);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={selectedRows.length === 0}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Serah Terima ({selectedRows.length} Barang)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Formulir Serah Terima Massal</DialogTitle>
          <DialogDescription>
            Pilih pengguna yang akan menerima barang-barang ini.
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm font-medium">Barang Terpilih:</div>
        <ul className="list-disc list-inside text-sm text-muted-foreground max-h-24 overflow-y-auto">
            {selectedRows.map(row => (
                <li key={row.original.id}>{row.original.nama}</li>
            ))}
        </ul>
        <form ref={formRef} onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="kePenggunaId">Serahkan Kepada</Label>
            <Select name="kePenggunaId" required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih pengguna..." />
              </SelectTrigger>
              <SelectContent>
                {penggunaList.map((pengguna) => (
                  <SelectItem key={pengguna.id} value={pengguna.id}>
                    {pengguna.full_name || 'Tanpa Nama'}
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
              placeholder="Kondisi barang, kelengkapan, dll."
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
              {isPending ? 'Memproses...' : 'Simpan & Serahkan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}