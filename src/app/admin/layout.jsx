"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarMenu = [
  { name: "Dashboard", href: "/admin" },
  { name: "Kamus", href: "/admin/kamus" },
  {
    name: "Practice",
    // parent menu for subitems
    children: [
      { name: "Level", href: "/admin/level" },
      { name: "Sublevel", href: "/admin/sublevel" },
      { name: "Soal", href: "/admin/soal" },
    ],
  },
  { name: "User", href: "/admin/user" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false); // mobile sidebar
  const [openPractice, setOpenPractice] = useState(false); // practice submenu

  // close mobile sidebar on route change
  useEffect(() => setOpen(false), [pathname]);

  // open practice submenu when current path is inside practice children
  useEffect(() => {
    const shouldOpen = ["/admin/level", "/admin/sublevel", "/admin/soal"].some((p) =>
      pathname?.startsWith(p)
    );
    setOpenPractice(shouldOpen);
  }, [pathname]);

  const renderLink = (item, isSub = false) => {
    const isActive = item.href && pathname === item.href;
    const base = `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${
      isActive ? "bg-[#ffbb00] text-white" : "hover:bg-gray-100 text-gray-700"
    }`;
    const subPadding = isSub ? "pl-8 text-sm" : "text-sm";
    return (
      <Link
        key={item.href || item.name}
        href={item.href || "#"}
        className={`${base} ${subPadding}`}
      >
        <span className="">{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Top bar (mobile) */}
          <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b">
        <h2 className="text-lg font-semibold text-[#ffbb00]">Admin Panel</h2>
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((s) => !s)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          {open ? (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar for md+ */}
          <aside className="hidden md:flex md:w-64 bg-white border-r flex-col py-6 px-4 gap-4 shadow-sm">
          <h2 className="text-2xl font-bold mb-4 text-[#ffbb00]">Admin Panel</h2>
          <nav className="flex flex-col gap-2">
            {sidebarMenu.map((item) =>
              item.children ? (
                <div key={item.name}>
                  <button
                    onClick={() => setOpenPractice((s) => !s)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100`}
                    aria-expanded={openPractice}
                  >
                    <span className=" text-sm">{item.name}</span>
                    {/* arrow icon with rotate */}
                    <svg
                      className={`w-4 h-4 text-gray-500 transform transition-transform duration-200 ${
                        openPractice ? "rotate-90" : "rotate-0"
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <div
                    className={`mt-2 flex flex-col gap-1 overflow-hidden transition-[max-height,opacity,transform] duration-200 ease-in-out ${
                      openPractice ? "max-h-40 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-1"
                    }`}
                  >
                    {item.children.map((child) => renderLink(child, true))}
                  </div>
                </div>
              ) : (
                renderLink(item)
              )
            )}
          </nav>
        </aside>

        {/* Mobile sidebar (drawer) */}
        {open && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-30 md:hidden"
              onClick={() => setOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r p-6 md:hidden overflow-auto shadow-lg transform transition-transform">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#ffbb00]">Admin Panel</h2>
                <button
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                {sidebarMenu.map((item) =>
                  item.children ? (
                    <div key={item.name}>
                      <button
                        onClick={() => setOpenPractice((s) => !s)}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100`}
                        aria-expanded={openPractice}
                      >
                        <span className="text-sm">{item.name}</span>
                        <svg
                          className={`w-4 h-4 text-gray-500 transform transition-transform duration-200 ${
                            openPractice ? "rotate-90" : "rotate-0"
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      <div
                        className={`mt-2 flex flex-col gap-1 overflow-hidden transition-[max-height,opacity,transform] duration-200 ease-in-out ${
                          openPractice ? "max-h-40 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-1"
                        }`}
                      >
                        {item.children.map((child) => renderLink(child, true))}
                      </div>
                    </div>
                  ) : (
                    renderLink(item)
                  )
                )}
              </nav>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen p-4 md:p-8 text-black">
          {children}
        </main>
      </div>
    </div>
  );
}
