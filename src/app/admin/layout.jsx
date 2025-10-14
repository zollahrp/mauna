"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarMenu = [
  { name: "Dashboard", href: "/admin" },
  { name: "Dashboard Kamus", href: "/admin/kamus" },
  { name: "Dashboard Soal", href: "/admin/soal" },
  { name: "Dashboard Toko", href: "/admin/toko" },
  { name: "Dashboard User", href: "/admin/user" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col py-8 px-4 gap-2">
        <h2 className="text-2xl font-bold mb-8 text-[#00bfff]">Admin Panel</h2>
        <nav className="flex flex-col gap-2">
          {sidebarMenu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                pathname === item.href
                  ? "bg-[#00bfff] text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}