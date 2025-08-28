import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data: authUsersResponse, error: authError } =
    await supabaseAdmin.auth.admin.listUsers();

  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role, jabatan');

  if (authError || profilesError) {
    console.error('API Error fetching users:', authError || profilesError);
    return NextResponse.json(
      { error: (authError || profilesError)?.message },
      { status: 500 }
    );
  }

  const users = authUsersResponse.users.map((authUser) => {
    const profile = profiles?.find((p) => p.id === authUser.id);
    return {
      id: authUser.id,
      email: authUser.email,
      full_name: profile?.full_name || 'Belum diatur',
      role: profile?.role || 'user',
      jabatan: profile?.jabatan || '-',
    };
  });

  return NextResponse.json(users);
}