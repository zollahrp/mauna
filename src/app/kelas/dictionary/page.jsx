"use client";

import { useState } from "react";

export default function DictionaryPage() {
  const [activeCategory, setActiveCategory] = useState("abjad");

  // Contoh data statis sementara
  const data = {
    abjad: [
      { word: "A", meaning: "Huruf pertama dalam alfabet" },
      { word: "B", meaning: "Huruf kedua dalam alfabet" },
      { word: "C", meaning: "Huruf ketiga dalam alfabet" },
    ],
    imbuhan: [
      { word: "ber-", meaning: "Menunjukkan adanya kegiatan atau keadaan" },
      { word: "ter-", meaning: "Menunjukkan keadaan paling atau tidak sengaja" },
      { word: "ke-an", meaning: "Menunjukkan abstraksi dari sifat atau keadaan" },
    ],
    angka: [
      { word: "1", meaning: "Satu" },
      { word: "2", meaning: "Dua" },
      { word: "3", meaning: "Tiga" },
    ],
  };

  const categories = [
    { id: "abjad", label: "Abjad" },
    { id: "imbuhan", label: "Imbuhan" },
    { id: "angka", label: "Angka" },
  ];

  return (
    <div className="min-h-screen bg-white px-6 py-8 font-poppins">

      {/* Kategori */}
      <div className="flex justify-center gap-3 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 ${
              activeCategory === cat.id
                ? "bg-[#ffbb00] text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Garis Judul */}
      <div className="relative mb-6 text-center">
        <div className="border-t-2 border-[#ffbb00]"></div>
        <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-[#ffbb00] font-bold text-sm tracking-widest">
          {activeCategory.toUpperCase()}
        </span>
      </div>

      {/* Daftar Kata */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data[activeCategory].map((item, i) => (
          <div
            key={i}
            className="border border-[#ffbb00]/40 rounded-xl p-4 hover:shadow-md transition duration-200"
          >
            <p className="font-bold text-gray-800">{item.word}</p>
            <p className="text-gray-600 text-sm mt-1">{item.meaning}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
