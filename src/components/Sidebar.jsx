"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Menu, X } from "lucide-react";

const mainMenuItems = [
  { name: "Belajar", icon: "/icons/home.png", href: "/kelas" },
  { name: "Kamus", icon: "/icons/dictionary.png", href: "/kelas/dictionary" },
  { name: "Papan Skor", icon: "/icons/score.png", href: "/kelas/leaderboard" },
  { name: "Profil", icon: "/icons/profile.png", href: "/kelas/profile" },
  { name: "Playground", icon: "/icons/bola.png", href: "/kelas/bermain" },
];

const collapseMenuItems = [
  { name: "Toko", icon: "/icons/toko.png", href: "/kelas/toko" },
  { name: "Lencana", icon: "/icons/medali.png", href: "/kelas/badges" },
  { name: "Keluar", icon: "/icons/logout.png", action: "logout" },
];

const mobileMainMenu = [
  { name: "Belajar", icon: "/icons/home.png", href: "/kelas" },
  { name: "Kamus", icon: "/icons/dictionary.png", href: "/kelas/dictionary" },
  { name: "Leaderboard", icon: "/icons/score.png", href: "/kelas/leaderboard" },
  { name: "Lainnya", icon: "/icons/more.png", action: "lainnya" },
];

const mobileLainnyaMenu = [
  { name: "Profil", icon: "/icons/profile.png", href: "/kelas/profile" },
  { name: "Playground", icon: "/icons/bola.png", href: "/kelas/bermain" },
  { name: "Toko", icon: "/icons/toko.png", href: "/kelas/toko" },
  { name: "Lencana", icon: "/icons/medali.png", href: "/kelas/badges" },
  { name: "Keluar", icon: "/icons/logout.png", action: "logout" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapseOpen, setCollapseOpen] = useState(false);
  const [role, setRole] = useState("");
  const [lainnyaOpen, setLainnyaOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const profile = localStorage.getItem("ProfileInfo");
    if (profile) {
      try {
        const parsed = JSON.parse(profile);
        setRole(parsed.user?.role || parsed.role || "");
      } catch { }
    }
  }, []);

  const collapseMenuItemsWithAdmin = [
    ...(role === "admin" || role === "moderator"
      ? [{ name: "Admin Panel", icon: "/icons/admin.png", href: "/admin" }]
      : []),
    ...collapseMenuItems,
  ];

  const handleLogout = () => {
    localStorage.removeItem("ProfileInfo");
    localStorage.removeItem("current_quiz");
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      {/* Hamburger Menu Button - Tablet Only */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 hidden md:flex lg:hidden hover:bg-gray-50 transition-colors"
        aria-label="Open Menu"
      >
        <Menu size={24} className="text-gray-700" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 flex-col p-4 font-[var(--font-poppins)] overflow-y-auto shadow-md z-40">
        <div className="flex items-center gap-2 mb-8 px-2">
          <Image src="/logo_mauna.png" alt="Mauna Logo" width={150} height={150} priority />
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-4">
            {mainMenuItems.map((item) => {
              const isActive = item.href && (item.href === "/kelas" ? pathname === "/kelas" : pathname.startsWith(item.href));
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors border ${
                      isActive
                        ? "bg-[#f0f9ff] border-[#ffbb00] text-[#ffbb00] font-semibold"
                        : "border-transparent text-gray-800 hover:bg-gray-50 hover:text-[#ffbb00]"
                    }`}
                    title={item.name}
                  >
                    <Image src={item.icon} alt={item.name} width={30} height={30} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}

            <li>
              <button
                onClick={() => setCollapseOpen(!collapseOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl transition-colors border border-transparent text-gray-800 hover:bg-gray-50 w-full"
                title="Lainnya"
              >
                <Image src="/icons/more.png" alt="Lainnya" width={30} height={30} />
                <span>Lainnya</span>
                {collapseOpen ? <ChevronUp className="ml-auto" size={18} /> : <ChevronDown className="ml-auto" size={18} />}
              </button>
              
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: collapseOpen ? "200px" : "0px",
                  opacity: collapseOpen ? 1 : 0,
                }}
              >
                <ul className="mt-2 space-y-2 pl-8">
                  {collapseMenuItemsWithAdmin.map((item) =>
                    item.action === "logout" ? (
                      <li key={item.name}>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-2 py-1 rounded-lg text-red-600 hover:bg-red-50 w-full"
                          title={item.name}
                        >
                          <Image src={item.icon} alt={item.name} width={24} height={24} />
                          <span>{item.name}</span>
                        </button>
                      </li>
                    ) : (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-2 px-2 py-1 rounded-lg ${
                            pathname.startsWith(item.href)
                              ? "bg-[#f0f9ff] text-[#ffbb00] font-semibold"
                              : "text-gray-800 hover:bg-gray-50 hover:text-[#ffbb00]"
                          }`}
                          title={item.name}
                        >
                          <Image src={item.icon} alt={item.name} width={24} height={24} />
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Tablet Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:block lg:hidden">
          <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={closeSidebar} />
          
          <aside className="relative w-64 h-full bg-white border-r border-gray-200 flex flex-col p-4 font-[var(--font-poppins)] overflow-y-auto shadow-lg transform transition-transform duration-300 ease-in-out translate-x-0">
            <button
              onClick={closeSidebar}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors z-10"
              aria-label="Close Menu"
            >
              <X size={20} className="text-gray-500" />
            </button>

            <div className="flex items-center gap-2 mb-8 px-2 pr-12">
              <Image src="/logo_mauna.png" alt="Mauna Logo" width={150} height={150} priority />
            </div>

            <nav className="flex-1">
              <ul className="space-y-4">
                {mainMenuItems.map((item) => {
                  const isActive = item.href && (item.href === "/kelas" ? pathname === "/kelas" : pathname.startsWith(item.href));
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors border ${
                          isActive
                            ? "bg-[#f0f9ff] border-[#ffbb00] text-[#ffbb00] font-semibold"
                            : "border-transparent text-gray-800 hover:bg-gray-50 hover:text-[#ffbb00]"
                        }`}
                        title={item.name}
                      >
                        <Image src={item.icon} alt={item.name} width={30} height={30} />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}

                <li>
                  <button
                    onClick={() => setCollapseOpen(!collapseOpen)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl transition-colors border border-transparent text-gray-800 hover:bg-gray-50 w-full"
                    title="Lainnya"
                  >
                    <Image src="/icons/more.png" alt="Lainnya" width={30} height={30} />
                    <span>Lainnya</span>
                    {collapseOpen ? <ChevronUp className="ml-auto" size={18} /> : <ChevronDown className="ml-auto" size={18} />}
                  </button>
                  
                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                      maxHeight: collapseOpen ? "200px" : "0px",
                      opacity: collapseOpen ? 1 : 0,
                    }}
                  >
                    <ul className="mt-2 space-y-2 pl-8">
                      {collapseMenuItemsWithAdmin.map((item) =>
                        item.action === "logout" ? (
                          <li key={item.name}>
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-2 px-2 py-1 rounded-lg text-red-600 hover:bg-red-50 w-full"
                              title={item.name}
                            >
                              <Image src={item.icon} alt={item.name} width={24} height={24} />
                              <span>{item.name}</span>
                            </button>
                          </li>
                        ) : (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              onClick={closeSidebar}
                              className={`flex items-center gap-2 px-2 py-1 rounded-lg ${
                                pathname.startsWith(item.href)
                                  ? "bg-[#f0f9ff] text-[#ffbb00] font-semibold"
                                  : "text-gray-800 hover:bg-gray-50 hover:text-[#ffbb00]"
                              }`}
                              title={item.name}
                            >
                              <Image src={item.icon} alt={item.name} width={24} height={24} />
                              <span>{item.name}</span>
                            </Link>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </li>
              </ul>
            </nav>
          </aside>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around items-center py-2 md:hidden shadow-[0_-2px_6px_rgba(0,0,0,0.05)] font-[var(--font-poppins)]">
        {mobileMainMenu.map((item) => {
          let isActive = false;
          if (item.href === "/kelas") {
            isActive = pathname === "/kelas";
          } else if (item.href) {
            isActive = pathname.startsWith(item.href);
          }

          return item.action === "lainnya" ? (
            <button
              key={item.name}
              onClick={() => setLainnyaOpen(true)}
              className="flex flex-col items-center gap-2 text-xs text-gray-600 hover:text-[#ffbb00]"
              title={item.name}
            >
              <Image src={item.icon} alt={item.name} width={36} height={36} />
              <span>{item.name}</span>
            </button>
          ) : (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center gap-2 text-xs ${
                isActive ? "text-[#ffbb00] font-semibold" : "text-gray-600 hover:text-[#ffbb00]"
              }`}
              title={item.name}
            >
              <Image
                src={item.icon}
                alt={item.name}
                width={36}
                height={36}
                className={isActive ? "opacity-100" : "opacity-80"}
              />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile Lainnya Panel */}
      {lainnyaOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center md:hidden"
          onClick={() => setLainnyaOpen(false)}
        >
          <div
            className="bg-white rounded-t-2xl w-full max-w-full p-6 pb-8 shadow-lg transform transition-transform duration-300 ease-in-out translate-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-black text-lg">Menu Lainnya</span>
              <button
                onClick={() => setLainnyaOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>
            <ul className="space-y-4">
              {mobileLainnyaMenu.map((item) =>
                item.action === "logout" ? (
                  <li key={item.name}>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 w-full"
                      title={item.name}
                    >
                      <Image src={item.icon} alt={item.name} width={28} height={28} />
                      <span>{item.name}</span>
                    </button>
                  </li>
                ) : (
                  <li key={item.name}>
                    <button
                      onClick={() => {
                        router.push(item.href);
                        setLainnyaOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl w-full ${
                        pathname.startsWith(item.href)
                          ? "bg-[#f0f9ff] text-[#ffbb00] font-semibold"
                          : "text-gray-800 hover:bg-gray-50 hover:text-[#ffbb00]"
                      }`}
                      title={item.name}
                    >
                      <Image src={item.icon} alt={item.name} width={28} height={28} />
                      <span>{item.name}</span>
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}