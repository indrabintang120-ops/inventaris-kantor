import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data: categories, error } = await supabaseAdmin
    .from('kategori')
    .select('id, nama')
    .order('nama', { ascending: true });

  if (error) {
    console.error('API Error fetching categories:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(categories);
}