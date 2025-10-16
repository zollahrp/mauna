"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiOutlineMenu, HiX } from "react-icons/hi";

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-[#FAFAFA]/70 backdrop-blur-md border-b border-gray-200">
      <div className="mx-auto max-w-screen-xl flex items-center justify-between py-3 px-4 md:px-6">
        {/* Logo */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Image
            src="/logo_mauna.png"
            alt="Logo"
            width={160}
            height={160}
            className="object-contain w-[140px] md:w-[180px] h-auto"
          />
        </div>

        {/* Tombol desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            type="button"
            onClick={() => router.push("/auth/register")}
            className="bg-[#ffbb00] hover:bg-[#e6a800] text-white font-semibold font-poppins px-6 py-2.5 rounded-2xl shadow-[0_3px_0_#b45309] transition active:translate-y-0.5 cursor-pointer"
          >
            MULAI
          </button>
        </div>

        {/* Tombol menu (mobile) */}
        <button
          className="md:hidden p-2 text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <HiX className="h-7 w-7" />
          ) : (
            <HiOutlineMenu className="h-7 w-7" />
          )}
        </button>
      </div>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#FAFAFA]/95 backdrop-blur-md border-t border-gray-200 px-4 py-4 space-y-3 animate-fadeIn">
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              router.push("/auth/register");
            }}
            className="w-full bg-[#ffbb00] hover:bg-[#e6a800] text-white font-semibold font-poppins px-6 py-3 rounded-2xl shadow-[0_3px_0_#b45309] transition active:translate-y-0.5"
          >
            MULAI
          </button>
        </div>
      )}
    </header>
  );
}
