"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Sidebar from "./Sidebar";

export default function ClientWrapper({ children }) {
  const pathname = usePathname();

  // Halaman tanpa Navbar & Footer (auth)
  const hideNavAndFooter = ["/auth/login", "/auth/register"];

  // 🔥 Deteksi halaman not-found
  const isNotFound = pathname === "/_not-found" || pathname === "/404";

  // Cek apakah ini halaman kelas
  const isKelas = pathname.startsWith("/kelas");

  // Layout untuk halaman auth
  if (hideNavAndFooter.includes(pathname)) {
    return <main>{children}</main>;
  }

  // Layout untuk not-found (tanpa navbar/footer/sidebar)
  if (isNotFound) {
    return <main className="min-h-screen">{children}</main>;
  }

  // Layout Kelas
  if (isKelas) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // Layout Landing Page (default)
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
