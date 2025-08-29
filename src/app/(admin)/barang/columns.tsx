'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { RowActions } from './row-actions';
import { Checkbox } from '@/components/ui/checkbox';

export type Barang = {
  id: string;
  kode_aset: string | null;
  nama: string;
  deskripsi: string | null;
  status: string;
  lokasi: string | null;
  kategori: { nama: string } | null;
  profiles: { id: string | null; full_name: string | null; } | null;
};

const createSortableHeader = (columnName: string) => {
  return ({ column }: { column: any }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {columnName}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

export const columns: ColumnDef<Barang>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        disabled={row.original.status !== 'Tersedia'}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'kode_aset',
    header: createSortableHeader('Kode Aset'),
  },
  {
    accessorKey: 'nama',
    header: createSortableHeader('Nama Barang'),
    cell: ({ row }) => <div className="font-medium">{row.getValue('nama')}</div>,
  },
  {
    accessorFn: (row) => row.kategori?.nama || '-',
    id: 'kategori',
    header: createSortableHeader('Kategori'),
    // Tambahkan baris ini untuk "mengajari" filter
    getFilterValue: (row) => row.original.kategori?.nama || '',
  },
  {
    accessorKey: 'status',
    header: createSortableHeader('Status'),
  },
  {
    accessorFn: (row) => row.profiles?.full_name || 'Tidak ada',
    id: 'pengguna',
    header: createSortableHeader('Pengguna'),
    // Tambahkan baris ini untuk "mengajari" filter
    getFilterValue: (row) => row.original.profiles?.full_name || '',
  },
  {
    accessorKey: 'lokasi',
    header: createSortableHeader('Lokasi'),
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => {
      const barang = row.original;
      return (
        <div className="text-right">
          <RowActions id={barang.id} status={barang.status} penggunaId={barang.profiles?.id || null} />
        </div>
      );
    },
  },
];