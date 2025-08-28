'use client';

import { useRef, useState, useTransition } from 'react';
import { MoreHorizontal, Pen, KeyRound } from 'lucide-react';

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateUser, resetUserPassword } from './actions';

// Definisikan tipe data untuk props
type UserProps = {
  id: string;
  fullName: string;
  jabatan: string;
  role: string;
};

export function PenggunaRowActions({ user }: { user: UserProps }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetPassOpen, setIsResetPassOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const editFormRef = useRef<HTMLFormElement>(null);
  const resetPassFormRef = useRef<HTMLFormElement>(null);

  const handleUpdate = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateUser(user.id, formData);
      if (result.success) {
        setIsEditOpen(false);
      } else {
        alert(result.message);
      }
    });
  };

  const handleResetPassword = (formData: FormData) => {
    startTransition(async () => {
      const result = await resetUserPassword(user.id, formData);
      if (result.success) {
        setIsResetPassOpen(false);
        alert('Password berhasil direset!');
      } else {
        alert(result.message);
      }
    });
  };

  return (
    <>
      {/* Dropdown Menu Trigger */}
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
          <DropdownMenuItem onSelect={() => setIsEditOpen(true)}>
            <Pen className="mr-2 h-4 w-4" />
            <span>Edit Pengguna</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setIsResetPassOpen(true)}>
            <KeyRound className="mr-2 h-4 w-4" />
            <span>Reset Password</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
            <DialogDescription>
              Ubah data pengguna di bawah ini dan klik simpan.
            </DialogDescription>
          </DialogHeader>
          <form ref={editFormRef} action={handleUpdate} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <Input id="full_name" name="full_name" defaultValue={user.fullName} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="jabatan">Jabatan</Label>
              <Input id="jabatan" name="jabatan" defaultValue={user.jabatan} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Peran (Role)</Label>
              <Select name="role" defaultValue={user.role} required>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Batal</Button></DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPassOpen} onOpenChange={setIsResetPassOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Masukkan password baru untuk pengguna ini.
            </DialogDescription>
          </DialogHeader>
          <form ref={resetPassFormRef} action={handleResetPassword} className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="password">Password Baru</Label>
                <Input id="password" name="password" type="password" required />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Batal</Button></DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Menyimpan...' : 'Simpan Password Baru'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}