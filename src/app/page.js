"use client";

import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function Home() {
  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center bg-white px-4 md:px-6">
      <div className="container mx-auto max-w-screen-lg grid md:grid-cols-2 gap-0 items-center flex-1">
        {/* Kiri - Lottie */}
        <div className="flex justify-end md:pr-4">
          <div className="w-[450px] h-[450px] md:w-[500px] md:h-[500px]">
            <DotLottieReact
              src="https://lottie.host/9d11a902-ea15-4ae0-a23c-3a970aef3763/0r3Cgea1po.lottie"
              loop
              autoplay
            />
          </div>
        </div>

        {/* Kanan - Teks + Button */}
        <div className="text-left md:pl-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 leading-snug">
            Cara seru dan efektif <br /> belajar bahasa isyarat!
          </h1>
          <div className="flex flex-col gap-4 max-w-sm">
            <button className="w-full bg-[#FDC93A] hover:bg-[#e06e2d] text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors">
              Mulai
            </button>
            <button className="w-full border border-gray-300 hover:bg-gray-100 text-gray-800 font-semibold px-6 py-3 rounded-lg transition">
              Aku sudah punya akun
            </button>
          </div>
        </div>
      </div>

      {/* Separator bawah */}
      <div className="w-full border-t border-b border-gray-300 mt-10 py-3">
        <div className="container mx-auto max-w-screen-lg flex justify-between text-gray-700 font-semibold">
          <span>BISINDO</span>
          <span>SIBI</span>
        </div>
      </div>
    </section>
  );
}
