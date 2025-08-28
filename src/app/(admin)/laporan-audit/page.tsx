import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type AuditLog = {
  id: number;
  old_record_data: any | null;
  new_record_data: any | null;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  changed_at: string;
  profiles: { full_name: string | null } | null;
};

async function getAuditLogs() {
  // Pastikan URL fetch ini benar
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/laporan-audit`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    // Log ini akan memberitahu kita jika API-nya tidak ditemukan
    console.error('Failed to fetch audit logs:', await res.text());
    return [];
  }

  const logs: AuditLog[] = await res.json();
  return logs;
}

export default async function AuditLogPage() {
  const logs = await getAuditLogs();

  const getOperationBadge = (operation: string) => {
    switch (operation) {
      case 'INSERT':
        return <Badge variant="default">CREATE</Badge>;
      case 'UPDATE':
        return <Badge variant="secondary">UPDATE</Badge>;
      case 'DELETE':
        return <Badge variant="destructive">DELETE</Badge>;
      default:
        return <Badge variant="outline">{operation}</Badge>;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Laporan Audit Log</h1>
        <p className="text-muted-foreground">
          Melihat semua riwayat perubahan data pada tabel barang.
        </p>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Waktu</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead>Detail Perubahan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs && logs.length > 0 ? (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {new Date(log.changed_at).toLocaleString('id-ID', {
                      dateStyle: 'long',
                      timeStyle: 'medium',
                    })}
                  </TableCell>
                  <TableCell>{log.profiles?.full_name || '-'}</TableCell>
                  <TableCell>{getOperationBadge(log.operation)}</TableCell>
                  <TableCell className="font-mono text-xs">
                    <pre className="bg-muted p-2 rounded-md overflow-auto max-h-40">
                      {JSON.stringify(
                        {
                          old: log.old_record_data,
                          new: log.new_record_data,
                        },
                        null,
                        2
                      )}
                    </pre>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Tidak ada data log.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}