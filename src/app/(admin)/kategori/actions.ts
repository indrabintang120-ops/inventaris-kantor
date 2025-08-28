'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addKategori(formData: FormData) {
  const supabase = createClient();
  const nama = formData.get('nama') as string;

  if (!nama) {
    return { success: false, message: 'Nama kategori tidak boleh kosong.' };
  }

  const { error } = await supabase.from('kategori').insert({ nama });

  if (error) {
    console.error('Error adding kategori:', error);
    if (error.code === '23505') {
      return { success: false, message: 'Nama kategori sudah ada.' };
    }
    return { success: false, message: error.message };
  }

  revalidatePath('/kategori');
  return { success: true, message: 'Kategori berhasil ditambahkan.' };
}

// Fungsi baru untuk update kategori
export async function updateKategori(id: number, formData: FormData) {
  const supabase = createClient();
  const nama = formData.get('nama') as string;

  if (!nama) {
    return { success: false, message: 'Nama kategori tidak boleh kosong.' };
  }

  const { error } = await supabase.from('kategori').update({ nama }).eq('id', id);

  if (error) {
    console.error('Error updating kategori:', error);
     if (error.code === '23505') {
      return { success: false, message: 'Nama kategori sudah ada.' };
    }
    return { success: false, message: error.message };
  }

  revalidatePath('/kategori');
  return { success: true, message: 'Kategori berhasil diperbarui.' };
}

// Fungsi baru untuk delete kategori
export async function deleteKategori(id: number) {
  const supabase = createClient();

  const { error } = await supabase.from('kategori').delete().eq('id', id);

  if (error) {
    console.error('Error deleting kategori:', error);
    return { success: false, message: error.message };
  }
  
  revalidatePath('/kategori');
  return { success: true, message: 'Kategori berhasil dihapus.' };
}