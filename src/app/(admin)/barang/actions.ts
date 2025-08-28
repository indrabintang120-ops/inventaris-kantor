'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ... (fungsi addBarang, deleteBarang, updateBarang, serahTerimaBarang, pengembalianBarang tidak berubah)
export async function addBarang(formData: FormData) {
  const supabase = createClient();
  const dataToInsert = {
    nama: formData.get('nama') as string,
    deskripsi: formData.get('deskripsi') as string,
    lokasi: formData.get('lokasi') as string,
    kategori_id: Number(formData.get('kategori_id')),
    status: formData.get('status') as string,
  };
  const { data: kategori } = await supabase.from('kategori').select('nama').eq('id', dataToInsert.kategori_id).single();
  if (!kategori) return;
  const prefix = kategori.nama.substring(0, 2).toUpperCase();
  const { count } = await supabase.from('barang').select('*', { count: 'exact', head: true }).eq('kategori_id', dataToInsert.kategori_id);
  const nextNumber = (count || 0) + 1;
  const paddedNumber = String(nextNumber).padStart(3, '0');
  const kodeAset = `${prefix}-${paddedNumber}`;
  await supabase.from('barang').insert({ ...dataToInsert, kode_aset: kodeAset });
  revalidatePath('/barang');
  redirect('/barang');
}
export async function deleteBarang(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('barang').delete().eq('id', id);
   if (error) {
    console.error('Error deleting barang:', error);
    return { success: false, message: error.message };
  }
  revalidatePath('/barang');
  return { success: true, message: 'Barang berhasil dihapus.' };
}
export async function updateBarang(id: string, formData: FormData) {
  const supabase = createClient();
  const dataToUpdate = {
    nama: formData.get('nama') as string,
    deskripsi: formData.get('deskripsi') as string,
    lokasi: formData.get('lokasi') as string,
    kategori_id: Number(formData.get('kategori_id')),
    status: formData.get('status') as string,
  };
  const { error } = await supabase.from('barang').update(dataToUpdate).eq('id', id);
   if (error) {
    console.error('Error updating barang:', error);
    return;
  }
  revalidatePath('/barang');
  revalidatePath(`/barang/edit/${id}`);
  redirect('/barang');
}
export async function serahTerimaBarang(formData: FormData) {
  const supabase = createClient();
  const barangId = formData.get('barangId') as string;
  const kePenggunaId = formData.get('kePenggunaId') as string;
  const catatan = formData.get('catatan') as string;
  if (!kePenggunaId) return { success: false, message: 'Anda harus memilih pengguna penerima.' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Admin tidak terautentikasi.' };
  const adminId = user.id;
  const { error: updateError } = await supabase.from('barang').update({ pengguna_id: kePenggunaId, status: 'Digunakan' }).eq('id', barangId);
   if (updateError) {
    return { success: false, message: updateError.message };
  }
  const { error: insertError } = await supabase.from('riwayat_serah_terima').insert({ barang_id: barangId, ke_pengguna_id: kePenggunaId, diserahkan_oleh_admin_id: adminId, catatan: catatan, tipe: 'serah-terima' });
    if (insertError) {
    return { success: false, message: insertError.message };
  }
  revalidatePath('/barang');
  return { success: true, message: 'Serah terima barang berhasil dicatat.' };
}
export async function pengembalianBarang(formData: FormData) {
  const supabase = createClient();
  const barangId = formData.get('barangId') as string;
  const dariPenggunaId = formData.get('dariPenggunaId') as string;
  const catatan = formData.get('catatan') as string;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Admin tidak terautentikasi.' };
  const adminId = user.id;
  const { error: updateError } = await supabase.from('barang').update({ pengguna_id: null, status: 'Tersedia' }).eq('id', barangId);
      if (updateError) {
        return { success: false, message: updateError.message };
    }
  const { error: insertError } = await supabase.from('riwayat_serah_terima').insert({ barang_id: barangId, dari_pengguna_id: dariPenggunaId, diserahkan_oleh_admin_id: adminId, catatan: catatan, tipe: 'pengembalian' });
      if (insertError) {
        return { success: false, message: insertError.message };
    }
  revalidatePath('/barang');
  return { success: true, message: 'Pengembalian barang berhasil dicatat.' };
}

// FUNGSI SERAH TERIMA MASSAL (DIPERBARUI DENGAN TRANSAKSI_ID)
export async function serahTerimaMassal(formData: FormData) {
  const supabase = createClient();

  const barangIdsString = formData.get('barangIds') as string;
  const kePenggunaId = formData.get('kePenggunaId') as string;
  const catatan = formData.get('catatan') as string;

  if (!barangIdsString || !kePenggunaId) {
    return { success: false, message: 'Barang dan pengguna wajib dipilih.' };
  }
  
  const barangIds = barangIdsString.split(',');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Admin tidak terautentikasi.' };
  }
  const adminId = user.id;

  // Buat satu ID transaksi untuk semua item dalam batch ini
  const { data: [{ id: transaksi_id }], error: trxIdError } = await supabase
    .from('riwayat_serah_terima')
    .insert({})
    .select('id')
    .single();

  if(trxIdError) {
      // Logic to handle the case where we can't even get a transaction id.
      // For simplicity, we'll just log it. A more robust solution might delete the empty row.
      console.error("Could not create transaction placeholder:", trxIdError);
      return { success: false, message: 'Gagal membuat ID transaksi.' };
  }


  // Siapkan data untuk riwayat
  const riwayatInserts = barangIds.map(id => ({
    barang_id: id,
    ke_pengguna_id: kePenggunaId,
    diserahkan_oleh_admin_id: adminId,
    catatan: catatan,
    tipe: 'serah-terima',
    transaksi_id: transaksi_id, // Gunakan ID transaksi yang sama
  }));

  // Update status barang
  const { error: updateError } = await supabase
    .from('barang')
    .update({ pengguna_id: kePenggunaId, status: 'Digunakan' })
    .in('id', barangIds);
  
  // Update/insert riwayat
  const { error: insertError } = await supabase.from('riwayat_serah_terima').upsert(riwayatInserts, { onConflict: 'barang_id' });


  if (updateError || insertError) {
    console.error({ updateError, insertError });
    return { success: false, message: 'Gagal menyimpan data serah terima massal.' };
  }

  revalidatePath('/barang');
  return { success: true, message: 'Serah terima massal berhasil.', transaksi_id: transaksi_id };
}