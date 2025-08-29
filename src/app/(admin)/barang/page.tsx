import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { columns, type Barang } from './columns';
import { DataTable } from './data-table';
import { ExportExcelButton } from "./export-excel-button";
import { createClient } from "@/lib/supabase/server"; // Import Supabase server client
import { redirect } from "next/navigation";

async function getBarang() {
  // Gunakan URL absolut atau environment variable untuk fetch di server
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
  const supabase = createClient();

  // 1. Ambil data sesi pengguna
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Jika tidak ada user, redirect ke login (seharusnya sudah ditangani middleware)
    return redirect('/login');
  }

  // 2. Ambil data profil dari user yang login
  const { data: adminProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', user.id)
    .single();

  if (profileError || !adminProfile) {
      console.error('Gagal mengambil profil admin:', profileError);
      // Anda bisa menampilkan halaman error di sini
      return <p>Gagal memuat data admin. Silakan coba lagi.</p>;
  }


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

      {/* 3. Kirim data profil admin sebagai prop ke DataTable */}
      <DataTable columns={columns} data={data} adminProfile={adminProfile} />

    </div>
  );
}