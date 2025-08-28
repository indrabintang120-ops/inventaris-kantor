import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddKategoriDialog } from './add-kategori-dialog';
import { KategoriRowActions } from './row-actions';

type Kategori = {
  id: number;
  nama: string;
};

async function getCategories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/kategori`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('Failed to fetch categories:', await res.text());
    return [];
  }

  const categories: Kategori[] = await res.json();
  return categories;
}

export default async function KategoriPage() {
  const categories = await getCategories();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Kategori</h1>
          <p className="text-muted-foreground">
            Kelola semua kategori barang di sini.
          </p>
        </div>
        <AddKategoriDialog />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Kategori</TableHead>
              <TableHead className="w-[100px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.nama}</TableCell>
                  <TableCell className="text-right">
                    <KategoriRowActions id={category.id} nama={category.nama} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  Tidak ada data kategori.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}