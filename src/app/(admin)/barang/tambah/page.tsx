import TambahBarangForm from './tambah-form';
import { notFound } from 'next/navigation';

type Kategori = {
  id: number;
  nama: string;
};

// Fungsi baru untuk mengambil kategori dari API
async function getCategories() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/kategori`, {
        cache: 'no-store',
    });

    if (!res.ok) {
        console.error('Failed to fetch categories:', await res.text());
        return [];
    }
    return res.json();
}

export default async function TambahBarangPage() {
  const categories: Kategori[] = await getCategories();

  // notFound() akan menampilkan halaman 404 jika categories tidak ditemukan
  if (!categories) {
    notFound();
  }

  return <TambahBarangForm categories={categories} />;
}