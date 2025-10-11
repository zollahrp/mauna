// src/app/kelas/dictionary/page.jsx

"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function DictionaryPage() {
  const [activeCategory, setActiveCategory] = useState("abjad");
  const [kamusData, setKamusData] = useState({
    abjad: [],
    imbuhan: [],
    angka: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKamus = async () => {
      try {
        const res = await api.get("/public/kamus"); // ✅ Gunakan .get() untuk request GET
        
        // ✅ PERBAIKAN UTAMA: Gunakan res.data karena Axios sudah memproses JSON.
        const allData = res.data.data;

        if (allData && Array.isArray(allData)) {
          const abjad = allData.filter(
            (item) => item.category === "ALPHABET" && isNaN(item.word_text)
          );
          const imbuhan = allData.filter(
            (item) => item.category === "IMBUHAN"
          );
          const angka = allData.filter(
            (item) => item.category === "ALPHABET" && !isNaN(item.word_text)
          );
          
          setKamusData({
            abjad,
            imbuhan,
            angka,
          });
        }
      } catch (err) {
        console.error("Failed to fetch dictionary data:", err);
        toast.error("Gagal memuat data kamus. Silakan coba lagi nanti.");
        setKamusData({ abjad: [], imbuhan: [], angka: [] }); // Pastikan state tetap array kosong
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
  ];

  return (
    <div className="min-h-screen bg-white px-6 py-8 font-poppins">
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

      <div className="relative mb-6 text-center">
        <div className="border-t-2 border-[#ffbb00]"></div>
        <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-[#ffbb00] font-bold text-sm tracking-widest">
          {activeCategory.toUpperCase()}
        </span>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-10">Memuat data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kamusData[activeCategory].length === 0 ? (
            <div className="col-span-3 text-center text-gray-400 py-10">
              Tidak ada data.
            </div>
          ) : (
            kamusData[activeCategory].map((item) => (
              <div
                key={item.id}
                className="border border-[#ffbb00]/40 rounded-xl p-4 hover:shadow-md transition duration-200"
              >
                <p className="font-bold text-gray-800">{item.word_text}</p>
                <p className="text-gray-600 text-sm mt-1">{item.definition}</p>
                {item.video_url && (
                  <a
                    href={item.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 underline mt-2 inline-block"
                  >
                    Lihat Video
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}