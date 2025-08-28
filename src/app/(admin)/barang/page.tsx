import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { columns, type Barang } from './columns';
import { DataTable } from './data-table'; // <-- Menggunakan DataTable yang benar
import { ExportExcelButton } from "./export-excel-button";

async function getBarang() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/barang`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('Failed to fetch barang:', await res.text());
    return [];
  }

  const barang: Barang[] = await res.json();
  return barang;
}


export default async function BarangPage() {
  const data = await getBarang();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Barang</h1>
          <p className="text-muted-foreground">
            Kelola semua data barang inventaris di sini.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <ExportExcelButton data={data} />
            <Link href="/barang/tambah">
                <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Barang
                </Button>
            </Link>
        </div>
      </div>

      {/* Ganti tabel manual dengan DataTable canggih kita */}
      <DataTable columns={columns} data={data} />

    </div>
  );
}