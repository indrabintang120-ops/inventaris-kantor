import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const supabase = createClient(); // Untuk mendapatkan info admin yang login

  const { barangIds, kePenggunaId, catatan } = await request.json();

  if (!barangIds || barangIds.length === 0 || !kePenggunaId) {
    return NextResponse.json(
      { error: 'Barang dan pengguna wajib dipilih.' },
      { status: 400 }
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Admin tidak terautentikasi.' }, { status: 401 });
  }
  const adminId = user.id;

  // Siapkan data untuk riwayat
  const riwayatInserts = barangIds.map((id: string) => ({
    barang_id: id,
    ke_pengguna_id: kePenggunaId,
    diserahkan_oleh_admin_id: adminId,
    catatan: catatan,
    tipe: 'serah-terima',
  }));

  // Gunakan supabaseAdmin untuk operasi data
  // 1. Update status barang satu per satu
  const { error: updateError } = await supabaseAdmin
    .from('barang')
    .update({ pengguna_id: kePenggunaId, status: 'Digunakan' })
    .in('id', barangIds);
  
  // 2. Insert semua riwayat sekaligus
  const { error: insertError } = await supabaseAdmin.from('riwayat_serah_terima').insert(riwayatInserts);

  if (updateError || insertError) {
    console.error({ updateError, insertError });
    return NextResponse.json(
      { error: 'Gagal menyimpan data serah terima massal.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: 'Serah terima massal berhasil.' });
}