"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10">
      {/* Optional decorative wave on top */}
      <div className="absolute inset-x-0 -top-8 pointer-events-none">
        <svg
          viewBox="0 0 1200 100"
          preserveAspectRatio="none"
          className="w-full h-8"
          aria-hidden
        >
          <path
            d="M0,0 C300,80 900,0 1200,60 L1200,100 L0,100 Z"
            fill="#fff9e6" /* very pale yellow */
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Main glass container */}
      <div className="bg-white/60 backdrop-blur-md border-t border-white/20">
        <div className="max-w-screen-lg mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl md:text-3xl font-bold tracking-wider text-[#ffbb00]">
                MAUNA
              </span>
            </Link>
            <p className="text-sm text-gray-700 max-w-xs">
              Belajar kapan pun & di mana pun — interaktif, inklusif, dan penuh
              semangat. Bergabunglah dengan komunitas kami!
            </p>

            <div className="flex items-center gap-3 mt-4">
              <a
                href="#"
                aria-label="Website"
                className="p-2 rounded-lg hover:bg-white/30 transition"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="#444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>

              <a
                href="#"
                aria-label="Twitter"
                className="p-2 rounded-lg hover:bg-white/30 transition"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0016.5 3c-2.5 0-4.5 2.24-4 4.72A12.94 12.94 0 013 4s-4 9 5 13a13 13 0 01-8 2c12 7 27 0 27-16.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" stroke="#444" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="p-2 rounded-lg hover:bg-white/30 transition"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="#444" strokeWidth="0.9" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" stroke="#444" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17.5 6.5h.01" stroke="#444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation / Menu */}
          <div>
            <h4 className="text-gray-800 font-semibold mb-4">Menu</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li><a className="hover:text-[#ffbb00] transition" href="#features">Fitur</a></li>
              <li><a className="hover:text-[#ffbb00] transition" href="#howitworks">Cara Kerja</a></li>
              <li><a className="hover:text-[#ffbb00] transition" href="#testimoni">Testimoni</a></li>
              <li><a className="hover:text-[#ffbb00] transition" href="#cta">Mulai</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-gray-800 font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li><a className="hover:text-[#ffbb00] transition" href="#faq">FAQ</a></li>
              <li><a className="hover:text-[#ffbb00] transition" href="#contact">Kontak</a></li>
              <li><a className="hover:text-[#ffbb00] transition" href="#privacy">Kebijakan Privasi</a></li>
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div className="space-y-3">
            <h4 className="text-gray-800 font-semibold">Dapatkan update</h4>
            <p className="text-sm text-gray-700">Daftar email untuk tips belajar & fitur baru.</p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2 mt-2"
              aria-label="newsletter form"
            >
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                type="email"
                placeholder="email@contoh.com"
                className="w-full rounded-md border border-white/30 bg-white/10 placeholder-gray-600 px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ffbb00]/40"
                required
              />
              <button
                type="button"
                className="bg-[#ffbb00] hover:bg-[#e6a800] text-white font-semibold font-poppins px-6 py-3 rounded-2xl shadow-[0_3px_0_#b45309] transition active:translate-y-0.5 cursor-pointer"
              >
                DAFTAR
              </button>
            </form>

            <p className="text-xs text-gray-600 mt-2">
              Dengan mendaftar, kamu setuju menerima email dari MAUNA. Bisa berhenti kapan saja.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-screen-lg mx-auto px-6 py-4 border-t border-white/30 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
          <div>© {new Date().getFullYear()} MAUNA. All rights reserved.</div>
          <div className="mt-2 md:mt-0 text-xs text-gray-500">Dibuat dengan ♥ oleh tim MAUNA</div>
        </div>
      </div>
    </footer>
  );
}
