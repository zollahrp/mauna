import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-6xl font-bold text-yellow-500">404</h1>
      <p className="text-gray-700 mt-4">Halaman yang kamu cari tidak ditemukan.</p>
      <Link
        href="/"
        className="mt-6 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-6 py-3 rounded-lg shadow-md"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
