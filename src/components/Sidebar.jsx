// src/components/Sidebar.jsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Belajar", icon: "/icons/home.png", href: "/kelas" },
  { name: "Bunyi", icon: "/icons/sound.png", href: "/bunyi" },
  { name: "Papan Skor", icon: "/icons/score.png", href: "/papan-skor" },
  { name: "Misi", icon: "/icons/mission.png", href: "/misi" },
  { name: "Toko", icon: "/icons/store.png", href: "/toko" },
  { name: "Profil", icon: "/icons/profile.png", href: "/profil" },
  { name: "Lainnya", icon: "/icons/more.png", href: "/lainnya" },
];

export default function Sidebar() {
  const pathname = usePathname();

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
            const isActive = pathname.startsWith(item.href);

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors border
                    ${
                      isActive
                        ? "bg-[#f0f9ff] border-[#ffbb00] text-[#ffbb00] font-semibold"
                        : "border-transparent text-gray-800 hover:bg-gray-50 hover:text-[#ffbb00]"
                    }`}
                >
                  <Image src={item.icon} alt={item.name} width={26} height={26} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
