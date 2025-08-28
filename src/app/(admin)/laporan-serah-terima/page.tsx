import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { CetakButton } from './row-actions';

type Riwayat = {
  id: number;
  tanggal_serah_terima: string;
  catatan: string | null;
  barang: { nama: string } | null;
  penerima: { full_name: string | null } | null;
  admin: { full_name: string | null } | null;
};

async function getHandoverHistory() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/serah-terima`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('Failed to fetch handover history:', await res.text());
    return [];
  }

  const riwayat: Riwayat[] = await res.json();
  return riwayat;
}

export default async function LaporanSerahTerimaPage() {
  const riwayat = await getHandoverHistory();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Laporan Serah Terima
          </h1>
          <p className="text-muted-foreground">
            Riwayat semua serah terima barang yang tercatat.
          </p>
        </div>
        <Button variant="outline" disabled>
          <Printer className="mr-2 h-4 w-4" />
          Cetak Semua Laporan
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Tanggal</TableHead>
              <TableHead>Nama Barang</TableHead>
              <TableHead>Diserahkan Kepada</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Catatan</TableHead>
              <TableHead className="w-[120px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {riwayat && riwayat.length > 0 ? (
              riwayat.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {new Date(item.tanggal_serah_terima).toLocaleString(
                      'id-ID',
                      { dateStyle: 'long', timeStyle: 'medium' }
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.barang?.nama || '(Barang Telah Dihapus)'}
                  </TableCell>
                  <TableCell>{item.penerima?.full_name || '-'}</TableCell>
                  <TableCell>{item.admin?.full_name || '-'}</TableCell>
                  <TableCell>{item.catatan || '-'}</TableCell>
                  <TableCell className="text-right">
                    <CetakButton id={item.id} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Belum ada riwayat serah terima.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}