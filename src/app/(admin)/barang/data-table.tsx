'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type Row,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SerahTerimaMassalDialog } from './serah-terima-massal-dialog';
import { type Barang } from './columns';

interface AdminProfile {
  id: string;
  full_name: string | null;
}

interface DataTableProps<TData extends Barang, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  adminProfile: AdminProfile;
}

export function DataTable<TData extends Barang, TValue>({
  columns,
  data,
  adminProfile,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [isMassHandoverDialogOpen, setIsMassHandoverDialogOpen] = useState(false);

  const table = useReactTable({
    data,
    columns,
    // --- PERUBAHAN DI SINI ---
    // Aturan ini akan memberitahu tabel bahwa sebuah baris
    // hanya bisa dipilih jika statusnya 'Tersedia'.
    enableRowSelection: (row) => row.original.status === 'Tersedia',
    // --- AKHIR PERUBAHAN ---
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });
  
  const selectedRowsData = table.getSelectedRowModel().rows.map(row => row.original);

  const handleSuccess = () => {
    router.refresh();
    table.resetRowSelection();
  };

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter berdasarkan nama barang..."
          value={(table.getColumn('nama')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('nama')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button
          onClick={() => setIsMassHandoverDialogOpen(true)}
          disabled={selectedRowsData.length === 0}
        >
          Serah Terima Massal ({selectedRowsData.length})
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      <SerahTerimaMassalDialog
        isOpen={isMassHandoverDialogOpen}
        onClose={() => setIsMassHandoverDialogOpen(false)}
        selectedItems={selectedRowsData}
        onSuccess={handleSuccess}
        adminId={adminProfile.id}
      />
    </div>
  );
}