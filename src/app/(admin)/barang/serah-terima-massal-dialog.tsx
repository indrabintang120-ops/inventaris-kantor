'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState, useTransition } from 'react';
import { type Barang } from './columns';

// Definisikan tipe data untuk profil pengguna agar lebih aman
type Profile = {
  id: string;
  full_name: string | null;
  role: string;
  jabatan: string | null;
};

interface SerahTerimaMassalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: Barang[];
  onSuccess: () => void;
  adminId: string; 
}

export function SerahTerimaMassalDialog({
  isOpen,
  onClose,
  selectedItems,
  onSuccess,
  adminId,
}: SerahTerimaMassalDialogProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [catatan, setCatatan] = useState('');
  const [isPending, startTransition] = useTransition();

  // Efek untuk mengambil data pengguna saat komponen pertama kali dimuat
  useEffect(() => {
    async function fetchProfiles() {
      try {
        // Asumsi kita punya API endpoint untuk mengambil semua pengguna
        const res = await fetch('/api/pengguna');
        if (!res.ok) {
          throw new Error('Gagal mengambil data pengguna');
        }
        const data: Profile[] = await res.json();
        setProfiles(data);
      } catch (error) {
        console.error(error);
        alert('Gagal memuat daftar pengguna.');
      }
    }
    fetchProfiles();
  }, []);

  const handleSubmit = async () => {
    if (!selectedProfileId) {
      alert('Silakan pilih penerima barang.');
      return;
    }
    if (!adminId) {
        alert('Error: ID Admin tidak ditemukan. Silakan coba muat ulang halaman.');
        return;
    }

    startTransition(async () => {
      try {
        const barangIds = selectedItems.map((item) => item.id);

        const response = await fetch('/api/serah-terima-massal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            barangIds: barangIds,
            kePenggunaId: selectedProfileId,
            diserahkanOlehAdminId: adminId,
            catatan: catatan,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Terjadi kesalahan pada server.');
        }

        alert('Serah terima massal berhasil!');
        onSuccess();
        onClose();

      } catch (error) {
        console.error('Error submitting bulk handover:', error);
        const errorMessage = error instanceof Error ? error.message : 'Gagal memproses serah terima.';
        alert(`Error: ${errorMessage}`);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Formulir Serah Terima Massal</DialogTitle>
          <DialogDescription>
            Pilih penerima untuk {selectedItems.length} barang yang dipilih.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="penerima" className="text-right">
              Penerima
            </Label>
            <Select
              value={selectedProfileId}
              onValueChange={setSelectedProfileId}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih Pengguna" />
              </SelectTrigger>
              <SelectContent id="penerima">
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.full_name || 'Tanpa Nama'} ({profile.jabatan || profile.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="catatan" className="text-right">
              Catatan
            </Label>
            <Textarea
              id="catatan"
              className="col-span-3"
              placeholder="Catatan serah terima (opsional)"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Memproses...' : 'Serahkan Barang'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} // <-- INI YANG HILANG SEBELUMNYA