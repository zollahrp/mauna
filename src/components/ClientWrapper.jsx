"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Sidebar from "./Sidebar";

export default function ClientWrapper({ children }) {
  const pathname = usePathname();

  // Halaman tanpa Navbar & Footer (auth)
  const hideNavAndFooter = ["/auth/login", "/auth/register"];

  // Cek apakah ini halaman kelas
  const isKelas = pathname.startsWith("/kelas");

  if (hideNavAndFooter.includes(pathname)) {
    return <main>{children}</main>;
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
