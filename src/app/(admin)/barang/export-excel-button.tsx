'use client';

import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { type Barang } from './columns';

export function ExportExcelButton({ data }: { data: Barang[] }) {
  const handleExport = () => {
    // 1. Ubah format data agar sesuai dengan header yang diinginkan
    const formattedData = data.map((item) => ({
      'Kode Aset': item.kode_aset || '-',
      'Nama Barang': item.nama,
      'Kategori': item.kategori?.nama || '-',
      'Status': item.status,
      'Pengguna': item.profiles?.full_name || 'Tidak ada',
      'Lokasi': item.lokasi || '-',
      'Deskripsi': item.deskripsi || '-',
    }));

    // 2. Buat worksheet dari data yang sudah diformat
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // 3. Buat workbook baru dan tambahkan worksheet ke dalamnya
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Barang');

    // 4. Atur lebar kolom
    worksheet['!cols'] = [
        { wch: 15 }, // Kode Aset
        { wch: 40 }, // Nama Barang
        { wch: 20 }, // Kategori
        { wch: 15 }, // Status
        { wch: 30 }, // Pengguna
        { wch: 30 }, // Lokasi
        { wch: 50 }, // Deskripsi
    ];

    // 5. Buat file Excel dan picu unduhan di browser
    XLSX.writeFile(workbook, 'Daftar_Inventaris_Barang.xlsx');
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={data.length === 0}>
      <FileDown className="mr-2 h-4 w-4" />
      Export ke Excel
    </Button>
  );
}