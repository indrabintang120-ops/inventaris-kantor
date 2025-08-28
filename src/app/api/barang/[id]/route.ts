import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const [barangResult, categoriesResult] = await Promise.all([
    supabaseAdmin.from('barang').select('*, kode_aset').eq('id', id).single(),
    supabaseAdmin.from('kategori').select('id, nama').order('nama', { ascending: true }),
  ]);

  const { data: barang, error: barangError } = barangResult;
  const { data: categories, error: categoriesError } = categoriesResult;

  if (barangError || categoriesError) {
    console.error('API Error:', barangError || categoriesError);
    return NextResponse.json(
      { error: (barangError || categoriesError)?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ barang, categories });
}