"use client";

import React from "react";
import Image from "next/image";

export default function Navbar() {
  return (
    <header className="absolute top-0 left-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
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
        <button className="bg-[#ffbb00] hover:bg-[#e6b932] text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-colors">
          Mulai
        </button>
      </div>
    </header>
  );
}
