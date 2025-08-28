import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data: barang, error } = await supabaseAdmin
    .from('barang')
    .select(
      `
      id,
      kode_aset,
      nama,
      deskripsi,
      status,
      lokasi,
      kategori ( nama ),
      profiles ( id, full_name )
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('API Error fetching barang:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(barang);
}


export async function POST(request: Request) {
  // ... (sisa fungsi POST tidak berubah)
  const formData = await request.formData();

  const dataToInsert = {
    nama: formData.get('nama') as string,
    deskripsi: formData.get('deskripsi') as string,
    lokasi: formData.get('lokasi') as string,
    kategori_id: Number(formData.get('kategori_id')),
    status: formData.get('status') as string,
  };
  
  const { data: kategori } = await supabaseAdmin
    .from('kategori')
    .select('nama')
    .eq('id', dataToInsert.kategori_id)
    .single();

  if (!kategori) {
    return NextResponse.json({ error: 'Kategori tidak valid' }, { status: 400 });
  }

  const prefix = kategori.nama.substring(0, 2).toUpperCase();
  const { count } = await supabaseAdmin
    .from('barang')
    .select('*', { count: 'exact', head: true })
    .eq('kategori_id', dataToInsert.kategori_id);
  
  const nextNumber = (count || 0) + 1;
  const paddedNumber = String(nextNumber).padStart(3, '0');
  const kodeAset = `${prefix}-${paddedNumber}`;

  const { error } = await supabaseAdmin.from('barang').insert({
    ...dataToInsert,
    kode_aset: kodeAset,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Barang berhasil ditambahkan' });
}