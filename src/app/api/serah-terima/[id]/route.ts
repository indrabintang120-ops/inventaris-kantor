import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const { data: riwayat, error } = await supabaseAdmin
    .from('riwayat_serah_terima')
    .select(
      `
      id,
      tanggal_serah_terima,
      catatan,
      barang ( id, kode_aset, nama, deskripsi ),
      penerima:profiles!riwayat_serah_terima_ke_pengguna_id_fkey ( full_name, jabatan ),
      admin:profiles!riwayat_serah_terima_diserahkan_oleh_admin_id_fkey ( full_name, jabatan )
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    console.error('API Error fetching single handover history:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!riwayat) {
    return NextResponse.json({ error: 'Riwayat tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json(riwayat);
}