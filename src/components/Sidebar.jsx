"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const menuItems = [
  { name: "Belajar", icon: "/icons/home.png", href: "/kelas" },
  { name: "Kamus", icon: "/icons/dictionary.png", href: "/kelas/dictionary" },
  { name: "Papan Skor", icon: "/icons/score.png", href: "/kelas/leaderboard" },
  { name: "Profil", icon: "/icons/profile.png", href: "/kelas/profile" },
  { name: "Lainnya", icon: "/icons/more.png", href: "/lainnya" },
  { name: "Keluar", icon: "/icons/logout.png", action: "logout" }, // 👈 tambahan logout di sini
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // hapus semua data session di localStorage
    localStorage.removeItem("Profile info");
    localStorage.removeItem("token");

    // redirect ke halaman login
    router.push("/auth/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col p-4 font-[var(--font-poppins)]">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <Image src="/logo_mauna.png" alt="Mauna Logo" width={150} height={150} />
      </div>

      {/* Menu */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive =
              item.href &&
              (item.href === "/kelas"
                ? pathname === "/kelas"
                : pathname.startsWith(item.href));

            return (
              <li key={item.name}>
                {item.action === "logout" ? (
                  // 🔴 tombol logout (bukan Link)
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl transition-colors border w-full text-left
                      border-transparent text-red-600 hover:bg-red-50 hover:border-red-200"
                  >
                    <Image src={item.icon} alt={item.name} width={30} height={30} />
                    <span>{item.name}</span>
                  </button>
                ) : (
                  // 🔵 menu biasa
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors border
                      ${
                        isActive
                          ? "bg-[#f0f9ff] border-[#ffbb00] text-[#ffbb00] font-semibold"
                          : "border-transparent text-gray-800 hover:bg-gray-50 hover:text-[#ffbb00]"
                      }`}
                  >
                    <Image src={item.icon} alt={item.name} width={30} height={30} />
                    <span>{item.name}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
