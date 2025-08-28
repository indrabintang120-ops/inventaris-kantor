'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Kategori = {
  id: number;
  nama: string;
};

export default function TambahBarangForm({
  categories,
}: {
  categories: Kategori[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);

    startTransition(async () => {
      const response = await fetch('/api/barang', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Redirect ke halaman barang dan refresh data
        router.push('/barang');
        router.refresh(); 
      } else {
        const result = await response.json();
        alert(`Gagal menyimpan: ${result.error}`);
      }
    });
  };

  return (
    <div>
       <div className="flex items-center gap-4 mb-6">
        <Link href="/barang">
          <Button variant="outline" size="icon" className="h-7 w-7">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Kembali</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Barang Baru</h1>
          <p className="text-muted-foreground">
            Isi formulir di bawah ini untuk menambahkan item baru.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Barang</CardTitle>
          <CardDescription>
            Kode Aset akan dibuat secara otomatis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="nama">Nama Barang</Label>
              <Input id="nama" name="nama" type="text" required />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea id="deskripsi" name="deskripsi" />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="grid gap-3">
                <Label htmlFor="kategori">Kategori</Label>
                <Select name="kategori_id" required>
                  <SelectTrigger id="kategori">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue='Tersedia' required>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tersedia">Tersedia</SelectItem>
                    <SelectItem value="Digunakan">Digunakan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="lokasi">Lokasi</Label>
                <Input id="lokasi" name="lokasi" type="text" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.push('/barang')}>Batal</Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Menyimpan...' : 'Simpan Barang'}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}