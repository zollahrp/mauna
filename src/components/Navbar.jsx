"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-[#FAFAFA]/60 backdrop-blur-md">
      <div className="container mx-auto max-w-screen-lg flex items-center justify-between py-4 px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image
            src="/logo_mauna.png"
            alt="Logo"
            width={200}
            height={200}
            className="object-contain"
          />
        </div>

        {/* Button kanan */}
        <button
          type="button"
          onClick={() => router.push("/auth/register")}
          className="bg-[#ffbb00] hover:bg-[#e6a800] text-white font-semibold font-poppins px-6 py-3 rounded-2xl shadow-[0_3px_0_#b45309] transition active:translate-y-0.5 cursor-pointer"
        >
          MULAI
        </button>
      </div>
    </header>
  );
}
