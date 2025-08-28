'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

type Barang = {
  id: string;
  kode_aset: string | null;
  nama: string;
};

// Komponen tombol cetak
function PrintButton() {
  return (
    <Button onClick={() => window.print()} className="no-print">
      <Printer className="mr-2 h-4 w-4" />
      Cetak Stiker
    </Button>
  );
}

export default function CetakStikerPage() {
  const params = useParams();
  const id = params.id as string;

  const [barang, setBarang] = useState<Barang | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const getBarang = async () => {
      const res = await fetch(`/api/barang/${id}`);
      if (res.ok) {
        const data = await res.json();
        setBarang(data.barang);
      }
      setLoading(false);
    };

    getBarang();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!barang) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Data barang tidak ditemukan.</p>
      </div>
    );
  }

  const fullUrl = `${process.env.NEXT_PUBLIC_APP_URL}/item/${barang.id}`;

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: 64mm 32mm;
            margin: 2mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none;
          }
          .sticker-container {
            page-break-after: always;
          }
        }
      `}</style>
      <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
        <div className="fixed top-4 right-4 no-print">
          <PrintButton />
        </div>
        
        <div className="sticker-container w-[64mm] h-[32mm] bg-white shadow-lg text-black flex items-center justify-center p-2">
          <div className="grid grid-cols-3 gap-2 w-full h-full items-center">
            <div className="col-span-1 flex items-center justify-center">
               <QRCodeSVG value={fullUrl} size={100} includeMargin />
            </div>
            <div className="col-span-2 flex flex-col justify-center text-xs leading-tight break-words pl-2">
              {/* Tambahkan Teks "ASET SC" di sini */}
              <p className="font-semibold text-[8px] mb-1">ASET SC</p>
              <p className="font-bold">{barang.nama}</p>
              <p className="font-mono text-sm font-bold">{barang.kode_aset || barang.id.substring(0,8)}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}