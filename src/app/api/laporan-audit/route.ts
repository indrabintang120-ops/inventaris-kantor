import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data: logs, error } = await supabaseAdmin
    .from('log_audit')
    .select(
      `
      *,
      profiles ( full_name )
    `
    )
    .order('changed_at', { ascending: false });

  if (error) {
    console.error('API Error fetching audit logs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(logs);
}