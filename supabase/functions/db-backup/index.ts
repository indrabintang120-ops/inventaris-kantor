import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log(`Fungsi "db-backup" siap dijalankan!`)

// Fungsi ini akan berjalan saat dipanggil
serve(async (_req) => {
  try {
    // Buat client Supabase dengan hak akses service_role untuk keamanan
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Perintah untuk menjalankan pg_dump dari Deno
    // Ini akan membaca koneksi database dari environment variable
    const command = new Deno.Command("pg_dump", {
        args: [
            Deno.env.get('SUPABASE_DB_URL')!, "--clean"
        ],
    });

    const { code, stdout, stderr } = await command.output();

    if (code !== 0) {
        const errorText = new TextDecoder().decode(stderr);
        console.error('pg_dump error:', errorText);
        throw new Error(errorText);
    }
    
    // Konversi hasil backup menjadi teks
    const backupContent = new TextDecoder().decode(stdout);
    
    // Buat nama file yang unik berdasarkan tanggal
    const date = new Date();
    const fileName = `backup-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.sql`;

    // Simpan file backup ke Supabase Storage di dalam bucket 'backups'
    const { error: uploadError } = await supabaseClient
      .storage
      .from('backups') // Nama bucket, kita akan buat ini nanti
      .upload(fileName, backupContent, {
        contentType: 'application/sql',
        upsert: true, // Timpa file jika namanya sama
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    // Kirim respon sukses
    return new Response(JSON.stringify({ message: `Backup berhasil: ${fileName}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    // Kirim respon error jika terjadi masalah
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})