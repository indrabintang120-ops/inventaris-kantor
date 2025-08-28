import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { updateBarang } from '../../actions';

// Definisikan tipe data
type Barang = {
  id: string;
  kode_aset: string | null;
  nama: string;
  deskripsi: string | null;
  lokasi: string | null;
  status: string;
  kategori_id: number | null;
};
type Kategori = {
  id: number;
  nama: string;
};

// Fungsi untuk mengambil data dari API
async function getData(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/barang/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    return notFound();
  }
  return res.json();
}

export default async function EditBarangPage({
  params,
}: {
  params: { id: string };
}) {
  // Panggil fungsi getData, bukan Supabase langsung
  const { barang, categories }: { barang: Barang, categories: Kategori[] } = await getData(params.id);

  const updateBarangWithId = updateBarang.bind(null, barang.id);

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
          <h1 className="text-2xl font-bold tracking-tight">Edit Barang</h1>
          <p className="text-muted-foreground">Ubah data barang di bawah ini.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Detail Barang</CardTitle>
          <CardDescription>Ubah data dan klik simpan jika sudah selesai.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateBarangWithId} className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="kode_aset">Kode Aset</Label>
              <Input id="kode_aset" type="text" defaultValue={barang.kode_aset || 'N/A'} disabled />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="nama">Nama Barang</Label>
              <Input id="nama" name="nama" type="text" defaultValue={barang.nama} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea id="deskripsi" name="deskripsi" defaultValue={barang.deskripsi || ''} />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="grid gap-3">
                <Label htmlFor="kategori">Kategori</Label>
                <Select name="kategori_id" defaultValue={String(barang.kategori_id)}>
                  <SelectTrigger id="kategori"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={barang.status}>
                  <SelectTrigger id="status"><SelectValue placeholder="Pilih status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tersedia">Tersedia</SelectItem>
                    <SelectItem value="Digunakan">Digunakan</SelectItem>
                    <SelectItem value="Perbaikan">Perbaikan</SelectItem>
                    <SelectItem value="Dihapus">Dihapus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="lokasi">Lokasi</Label>
                <Input id="lokasi" name="lokasi" type="text" defaultValue={barang.lokasi || ''} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Link href="/barang"><Button variant="outline" type="button">Batal</Button></Link>
              <Button type="submit">Simpan Perubahan</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}