"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-20">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">

        {/* Brand */}
        <div>
          <h3 className="text-white text-xl font-bold">MAUNA</h3>
          <p className="mt-3 text-sm">
            Belajar kapan pun dan di mana pun, dengan cara yang seru dan inklusif.
          </p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-white font-semibold mb-3">Menu</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white">Fitur</a></li>
              <li><a href="#howitworks" className="hover:text-white">Cara Kerja</a></li>
              <li><a href="#testimoni" className="hover:text-white">Testimoni</a></li>
              <li><a href="#cta" className="hover:text-white">Mulai</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#faq" className="hover:text-white">FAQ</a></li>
              <li><a href="#contact" className="hover:text-white">Kontak</a></li>
              <li><a href="#privacy" className="hover:text-white">Kebijakan Privasi</a></li>
            </ul>
          </div>
        </div>

        {/* Socials */}
        <div>
          <h4 className="text-white font-semibold mb-3">Ikuti Kami</h4>
          <div className="flex space-x-4 text-lg">
            <a href="#" className="hover:text-white">🌐</a>
            <a href="#" className="hover:text-white">🐦</a>
            <a href="#" className="hover:text-white">📸</a>
            <a href="#" className="hover:text-white">💼</a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} MAUNA. All rights reserved.
      </div>
    </footer>
  );
}
