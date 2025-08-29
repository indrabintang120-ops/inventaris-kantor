'use server';

// Impor createClient yang sudah kita standarkan
import { createClient } from '@/lib/supabase/server'; 
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addBarang(formData: FormData) {
  const supabase = createClient();
  // ... sisa logika fungsi sama persis
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
  // ... sisa logika fungsi sama persis
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
  // ... sisa logika fungsi sama persis
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
  // ... sisa logika fungsi sama persis
  const barangId = formData.get('barangId') as string;
  const dariPenggunaId = formData.get('dariPenggunaId') as string;
  const catatan = formData.get('catatan') as string;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Admin tidak terautentikasi.' };
  const adminId = user.id;
  const { error: updateError } = await supabase
    .from('barang')
    .update({ 
      pengguna_id: null, 
      status: 'Tersedia', 
      lokasi: 'Gudang'
    })
    .eq('id', barangId);
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

// ... Anda bisa menghapus fungsi serahTerimaMassal dari sini jika tidak lagi digunakan