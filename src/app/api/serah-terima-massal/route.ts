import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const { 
        barangIds, 
        kePenggunaId, 
        diserahkanOlehAdminId,
        catatan 
    }: { 
        barangIds: string[]; 
        kePenggunaId: string;
        diserahkanOlehAdminId: string;
        catatan?: string;
    } = await request.json();

    if (!barangIds || barangIds.length === 0 || !kePenggunaId || !diserahkanOlehAdminId) {
      return NextResponse.json({ error: 'Data tidak lengkap: barangIds, kePenggunaId, dan diserahkanOlehAdminId wajib diisi.' }, { status: 400 });
    }

    // --- PERUBAHAN DIMULAI DI SINI ---

    // 1. Ambil data jabatan dari profil penerima
    const { data: profilePenerima, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('jabatan')
      .eq('id', kePenggunaId)
      .single();

    if (profileError || !profilePenerima) {
      console.error('Error fetching recipient profile:', profileError);
      throw new Error('Gagal menemukan profil penerima.');
    }

    // Gunakan jabatan sebagai lokasi baru. Jika jabatan kosong, bisa diberi nilai default.
    const lokasiBaru = profilePenerima.jabatan || 'Di Pengguna';

    // 2. Update data barang secara massal (termasuk lokasi)
    const { error: updateBarangError } = await supabaseAdmin
      .from('barang')
      .update({
        status: 'Digunakan',
        pengguna_id: kePenggunaId,
        lokasi: lokasiBaru, // <-- TAMBAHAN: Update kolom lokasi
        updated_at: new Date().toISOString(),
      })
      .in('id', barangIds);
    
    // --- AKHIR PERUBAHAN ---

    if (updateBarangError) {
      console.error('Error updating barang:', updateBarangError);
      throw new Error(`Gagal memperbarui data barang: ${updateBarangError.message}`);
    }
    
    const transaksiId = randomUUID();
    const riwayatRecords = barangIds.map((barangId) => ({
      transaksi_id: transaksiId,
      barang_id: barangId,
      ke_pengguna_id: kePenggunaId,
      diserahkan_oleh_admin_id: diserahkanOlehAdminId,
      catatan: catatan || 'Serah terima massal.',
      tipe: 'serah-terima',
      tanggal_serah_terima: new Date().toISOString(),
    }));

    const { error: insertRiwayatError } = await supabaseAdmin
      .from('riwayat_serah_terima')
      .insert(riwayatRecords);

    if (insertRiwayatError) {
      console.error('Error inserting riwayat:', insertRiwayatError);
      throw new Error(`Gagal mencatat riwayat serah terima: ${insertRiwayatError.message}`);
    }

    return NextResponse.json({ message: 'Serah terima massal berhasil diproses.', transaksi_id: transaksiId });

  } catch (error) {
    console.error('Server error during bulk handover:', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan internal server.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}