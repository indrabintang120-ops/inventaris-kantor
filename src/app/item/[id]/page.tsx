'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Tag, MapPin, Info, Hash, Loader2 } from 'lucide-react'; // Import ikon Hash & Loader2

type Barang = {
  nama: string;
  kode_aset: string | null; // <-- Tambahkan tipe data
  deskripsi: string | null;
  status: string;
  lokasi: string | null;
  kategori: { nama: string } | null;
  profiles: { full_name: string } | null;
};

export default function ItemDetailPage() {
  const params = useParams();
  const { id } = params;

  const [barang, setBarang] = useState<Barang | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const supabase = createClient();

    const fetchBarang = async () => {
      // Tambahkan 'kode_aset' ke dalam query select
      const { data, error } = await supabase
        .from('barang')
        .select(`
            nama,
            kode_aset,
            deskripsi,
            status,
            lokasi,
            kategori ( nama ),
            profiles ( full_name )
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        setError('Barang tidak ditemukan atau terjadi error.');
        console.error(error);
      } else {
        setBarang(data);
      }
      setLoading(false);
    };

    fetchBarang();
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </main>
    );
  }

  if (error || !barang) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center">
        <p>{error || 'Barang tidak ditemukan.'}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{barang.nama}</CardTitle>
              <CardDescription className="mt-1">
                Detail Aset Inventaris
              </CardDescription>
            </div>
            <Badge variant={barang.status === 'Tersedia' ? 'default' : 'secondary'}>
              {barang.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm">
          {/* Tampilkan Kode Aset di sini */}
          <div className="flex items-start gap-4">
            <Hash className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold">Kode Aset</p>
              <p className="text-muted-foreground font-mono">{barang.kode_aset || '-'}</p>
            </div>
          </div>
          {barang.deskripsi && (
            <div className="flex items-start gap-4">
              <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold">Deskripsi</p>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {barang.deskripsi}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-4">
            <User className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold">Pengguna Saat Ini</p>
              <p className="text-muted-foreground">
                {barang.profiles?.full_name || 'Tidak sedang digunakan'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Tag className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold">Kategori</p>
              <p className="text-muted-foreground">{barang.kategori?.nama || '-'}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold">Lokasi</p>
              <p className="text-muted-foreground">{barang.lokasi || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}