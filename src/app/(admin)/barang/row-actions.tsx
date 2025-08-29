'use client';

import { useState, useTransition } from 'react';
import { MoreHorizontal, Pen, Trash, QrCode, ArrowRightLeft, Undo2, Sticker } from 'lucide-react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteBarang } from './actions';
import { SerahTerimaDialog } from './serah-terima-dialog';
import { PengembalianDialog } from './pengembalian-dialog';

export function RowActions({ id, status, penggunaId }: { id: string, status: string, penggunaId: string | null }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isSerahTerimaOpen, setIsSerahTerimaOpen] = useState(false);
  const [isPengembalianOpen, setIsPengembalianOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fullUrl = `${process.env.NEXT_PUBLIC_APP_URL}/item/${id}`;

  const handleDelete = () => {
    startTransition(async () => {
      await deleteBarang(id);
      setIsDeleteOpen(false);
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Buka menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {status === 'Tersedia' && (
            <DropdownMenuItem onSelect={() => setIsSerahTerimaOpen(true)}>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              <span>Serah Terima</span>
            </DropdownMenuItem>
          )}

          {status === 'Digunakan' && penggunaId && (
            <DropdownMenuItem onSelect={() => setIsPengembalianOpen(true)}>
              <Undo2 className="mr-2 h-4 w-4" />
              <span>Pengembalian</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setIsQrOpen(true)}>
            <QrCode className="mr-2 h-4 w-4" />
            <span>Lihat QR Code</span>
          </DropdownMenuItem>
          <Link href={`/cetak/stiker/${id}`} target="_blank" legacyBehavior passHref>
            <DropdownMenuItem asChild>
              <a>
                <Sticker className="mr-2 h-4 w-4" />
                <span>Cetak Stiker</span>
              </a>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <Link href={`/barang/edit/${id}`} legacyBehavior passHref>
            <DropdownMenuItem asChild>
              <a>
                <Pen className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </a>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            onSelect={() => setIsDeleteOpen(true)}
            className="text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            <span>Hapus</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog untuk Serah Terima (dikontrol oleh state) */}
      <SerahTerimaDialog 
        barangId={id} 
        open={isSerahTerimaOpen} 
        onOpenChange={setIsSerahTerimaOpen} 
      />
      
      {/* Dialog untuk Pengembalian (dikontrol oleh state) */}
      {penggunaId && (
        <PengembalianDialog 
          barangId={id} 
          dariPenggunaId={penggunaId}
          open={isPengembalianOpen}
          onOpenChange={setIsPengembalianOpen}
        />
      )}

      {/* Dialog untuk Hapus */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda Benar-Benar Yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data
              barang secara permanen dari server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Menghapus...' : 'Lanjutkan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog untuk QR Code */}
      <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code Barang</DialogTitle>
            <DialogDescription>
              Scan QR code ini untuk melihat halaman detail publik.
            </DialogDescription>
          </DialogHeader> {/* <-- INI YANG SAYA PERBAIKI */}
          <div className="flex items-center justify-center p-4">
            <QRCodeSVG value={fullUrl} size={256} />
          </div>
          <div className="text-center text-sm text-muted-foreground break-all">
            {fullUrl}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}