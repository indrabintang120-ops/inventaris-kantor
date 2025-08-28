import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddPenggunaDialog } from './add-pengguna-dialog';
import { PenggunaRowActions } from './row-actions';

type Pengguna = {
    id: string;
    email: string | undefined;
    full_name: string;
    role: string;
    jabatan: string;
}

async function getUsers() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/pengguna`, {
        cache: 'no-store',
    });
    if (!res.ok) {
        console.error('Failed to fetch users:', await res.text());
        return [];
    }
    return res.json();
}

export default async function PenggunaPage() {
  const users: Pengguna[] = await getUsers();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h1>
          <p className="text-muted-foreground">
            Kelola semua pengguna aplikasi di sini.
          </p>
        </div>
        <AddPenggunaDialog />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Lengkap</TableHead>
              <TableHead>Jabatan</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Peran (Role)</TableHead>
              <TableHead className="w-[100px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.jabatan}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell className="text-right">
                    <PenggunaRowActions user={{
                        id: user.id,
                        fullName: user.full_name,
                        jabatan: user.jabatan,
                        role: user.role
                    }} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Tidak ada data pengguna.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}