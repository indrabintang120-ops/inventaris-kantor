import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Query ini mengambil data riwayat dan menggabungkannya dengan nama barang,
  // nama penerima, dan nama admin yang menyerahkan.
  const { data: riwayat, error } = await supabaseAdmin
    .from('riwayat_serah_terima')
    .select(
      `
      id,
      tanggal_serah_terima,
      catatan,
      barang ( nama ),
      penerima:profiles!riwayat_serah_terima_ke_pengguna_id_fkey ( full_name ),
      admin:profiles!riwayat_serah_terima_diserahkan_oleh_admin_id_fkey ( full_name )
    `
    )
    .order('tanggal_serah_terima', { ascending: false });

  if (error) {
    console.error('API Error fetching handover history:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(riwayat);
}