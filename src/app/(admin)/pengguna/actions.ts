'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function addUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('full_name') as string;
  const role = formData.get('role') as string;
  const jabatan = formData.get('jabatan') as string;

  if (!email || !password || !fullName || !role) {
    return { success: false, message: 'Semua kolom wajib diisi.' };
  }
  if (password.length < 6) {
    return { success: false, message: 'Password minimal harus 6 karakter.' };
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      app_role: role,
      jabatan: jabatan,
    },
  });

  if (error) {
    console.error('Error creating user:', error);
    return { success: false, message: error.message };
  }

  revalidatePath('/pengguna');
  return { success: true, message: 'Pengguna berhasil ditambahkan.' };
}

// FUNGSI BARU UNTUK UPDATE PENGGUNA
export async function updateUser(id: string, formData: FormData) {
  const supabase = supabaseAdmin;
  
  const fullName = formData.get('full_name') as string;
  const role = formData.get('role') as string;
  const jabatan = formData.get('jabatan') as string;

  if (!fullName || !role) {
      return { success: false, message: 'Nama dan Peran wajib diisi.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
        full_name: fullName, 
        role: role,
        jabatan: jabatan
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating user:', error);
    return { success: false, message: error.message };
  }

  revalidatePath('/pengguna');
  return { success: true, message: 'Data pengguna berhasil diperbarui.' };
}


// FUNGSI BARU UNTUK RESET PASSWORD
export async function resetUserPassword(id: string, formData: FormData) {
    const supabase = supabaseAdmin;
    const password = formData.get('password') as string;

    if (!password || password.length < 6) {
        return { success: false, message: 'Password baru minimal harus 6 karakter.' };
    }

    const { error } = await supabase.auth.admin.updateUserById(id, {
        password: password,
    });

    if (error) {
        console.error('Error resetting password:', error);
        return { success: false, message: error.message };
    }

    return { success: true, message: 'Password pengguna berhasil direset.' };
}