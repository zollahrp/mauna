"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import Link from "next/link";

export default function DictionaryPage() {
  const [activeCategory, setActiveCategory] = useState("abjad");
  const [kamusData, setKamusData] = useState({
    abjad: [],
    imbuhan: [],
    angka: [],
    kosakata: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKamus = async () => {
      try {
        const res = await api.get("/public/kamus");
        const allData = res.data?.data || [];

        const abjad = allData.filter((i) => i.category === "ALPHABET");
        const imbuhan = allData.filter((i) => i.category === "IMBUHAN");
        const angka = allData.filter((i) => i.category === "NUMBERS");
        const kosakata = allData.filter((i) => i.category === "KOSAKATA");

        setKamusData({ abjad, imbuhan, angka, kosakata });
      } catch (err) {
        console.error("Failed to fetch dictionary data:", err);
        toast.error("Gagal memuat data kamus. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };
    fetchKamus();
  }, []);

  const categories = [
    { id: "abjad", label: "Abjad" },
    { id: "imbuhan", label: "Imbuhan" },
    { id: "angka", label: "Angka" },
    { id: "kosakata", label: "Kosakata" },
  ];

  return (
    <div className="min-h-screen bg-white px-6 py-10 font-poppins md:pl-[17rem] md:pr-[17rem] transition-all duration-300">
      {/* Header Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-6 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-200
              ${
                activeCategory === cat.id
                  ? "bg-[#ffbb00] text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Section Label */}
      <div className="relative mb-8 text-center">
        <div className="border-t-2 border-[#ffbb00] w-full"></div>
        <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-gray-50 px-4 text-[#ffbb00] font-semibold text-xs tracking-widest">
          {activeCategory.toUpperCase()}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center text-gray-400 py-20 text-sm">
          Memuat data kamus...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {kamusData[activeCategory].length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-20 text-sm">
              Tidak ada data untuk kategori ini.
            </div>
          ) : (
            kamusData[activeCategory].map((item) => (
              <Link href={`/kelas/dictionary/${item.id}`} key={item.id}>
                <div className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between h-full">
                  {/* Header */}
                  <div>
                    <p className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-[#ffbb00] transition-colors">
                      {item.word_text}
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {item.definition}
                    </p>
                  </div>

                  {/* Footer */}
                  {item.video_url && (
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        Materi Video
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(item.video_url, "_blank", "noopener,noreferrer");
                        }}
                        className="text-sm text-[#2563eb] hover:text-[#1d4ed8] font-medium transition-colors"
                      >
                        Lihat
                      </button>
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
