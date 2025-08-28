'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Printer } from 'lucide-react';

type RiwayatDetail = {
  id: number;
  tanggal_serah_terima: string;
  catatan: string | null;
  barang: { 
    id: string; 
    kode_aset: string | null;
    nama: string; 
    deskripsi: string | null 
  } | null;
  penerima: { full_name: string | null; jabatan: string | null } | null;
  admin: { full_name: string | null; jabatan: string | null } | null;
};

function PrintButton() {
  return (
    <Button onClick={() => window.print()} className="no-print">
      <Printer className="mr-2 h-4 w-4" />
      Cetak Halaman Ini
    </Button>
  );
}

export default function CetakSerahTerimaPage() {
  const params = useParams();
  const id = params.id as string;

  const [riwayat, setRiwayat] = useState<RiwayatDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const getDetailRiwayat = async () => {
      const res = await fetch(`/api/serah-terima/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRiwayat(data);
      }
      setLoading(false);
    };

    getDetailRiwayat();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!riwayat) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Data serah terima tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A5;
            margin: 20mm;
          }
          body {
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
      <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
        <div className="fixed top-4 right-4 no-print">
          <PrintButton />
        </div>
        
        <div className="w-[148mm] h-[210mm] bg-white shadow-lg p-12 text-black text-sm flex flex-col">
          <header className="text-center border-b-2 border-black pb-4">
            <h1 className="text-xl font-bold">BUKTI SERAH TERIMA ASET</h1>
            {/* Nama Perusahaan dihapus */}
          </header>

          <section className="mt-8">
            <p>Pada hari ini, {new Date(riwayat.tanggal_serah_terima).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, telah dilakukan serah terima aset inventaris perusahaan dengan rincian sebagai berikut:</p>
            
            <table className="mt-4 w-full">
              <tbody>
                <tr className="align-top"><td className="w-1/3 py-1">Kode Aset</td><td>: {riwayat.barang?.kode_aset || '-'}</td></tr>
                <tr className="align-top"><td className="w-1/3 py-1">Nama Aset</td><td>: {riwayat.barang?.nama}</td></tr>
                {/* ID Aset (UUID) dihapus */}
                <tr className="align-top"><td className="w-1/3 py-1">Deskripsi</td><td>: {riwayat.barang?.deskripsi || '-'}</td></tr>
                <tr className="align-top"><td className="w-1/3 py-1">Catatan</td><td>: {riwayat.catatan || '-'}</td></tr>
              </tbody>
            </table>
          </section>

          <section className="mt-8">
            <p>Aset tersebut di atas diserahkan oleh perusahaan dan diterima oleh karyawan berikut untuk digunakan dalam menunjang pekerjaan:</p>
             <table className="mt-4 w-full">
              <tbody>
                <tr className="align-top"><td className="w-1/3 py-1">Nama Penerima</td><td>: {riwayat.penerima?.full_name}</td></tr>
                <tr className="align-top"><td className="w-1/3 py-1">Jabatan</td><td>: {riwayat.penerima?.jabatan || '-'}</td></tr>
              </tbody>
            </table>
             <p className="mt-4 text-xs italic">Dengan menandatangani bukti ini, pihak penerima bertanggung jawab atas penggunaan dan pemeliharaan aset sesuai dengan kebijakan perusahaan.</p>
          </section>

          <footer className="mt-auto grid grid-cols-2 gap-4 text-center pt-8">
              <div>
                <p>Diserahkan oleh,</p>
                <div className="h-20"></div>
                <p className="font-semibold border-t border-gray-400 pt-1">{riwayat.admin?.full_name}</p>
                <p className="text-xs">({riwayat.admin?.jabatan || 'Admin'})</p>
              </div>
               <div>
                <p>Diterima oleh,</p>
                <div className="h-20"></div>
                <p className="font-semibold border-t border-gray-400 pt-1">{riwayat.penerima?.full_name}</p>
                <p className="text-xs">({riwayat.penerima?.jabatan || 'Penerima'})</p>
              </div>
          </footer>
        </div>
      </div>
    </>
  );
}