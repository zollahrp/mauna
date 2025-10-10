"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function Page() {
  const [data, setData] = useState(null);
  const [activeLevel, setActiveLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("Token tidak ditemukan");
          return;
        }

        const res = await api.get("/api/user/soal/user/progress/summary");
        setData(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    // Jalankan hanya setelah token ada
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      fetchProgress();
    }
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Memuat data level...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Tidak ada data level ditemukan.
      </div>
    );
  }

  const userDisplay = `@${data.username}'${data.user_id.toString().slice(-2)}`;
  const levels = Object.entries(data.progress_by_level);

  return (
    <div className="p-6 space-y-6">
      {/* Header user */}
      <div className="flex justify-between items-center bg-[#32cd32] text-white p-6 rounded-xl shadow-md">
        <div>
          <p className="text-sm font-semibold opacity-90">
            {userDisplay}
          </p>
          {activeLevel && (
            <>
              <p className="text-sm opacity-90">
                ← BAGIAN 1, UNIT {activeLevel.level_id}
              </p>
              <h2 className="text-lg font-bold mt-1">
                {Object.keys(data.progress_by_level).find(
                  (key) =>
                    data.progress_by_level[key].level_id === activeLevel.level_id
                )}
              </h2>
            </>
          )}
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-[#2dbb2d] border border-white/30 rounded-lg font-semibold hover:bg-[#29a629] transition">
          📘 Buku Panduan
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm text-gray-700">
        <div className="bg-[#fff8e6] rounded-lg p-3 shadow-sm">
          <p className="font-semibold text-[#ffbb00]">Sublevel</p>
          <p>{data.overall_summary.completed_sublevels} / {data.overall_summary.total_sublevels}</p>
        </div>
        <div className="bg-[#f0f9ff] rounded-lg p-3 shadow-sm">
          <p className="font-semibold text-[#00bfff]">Rata-rata Skor</p>
          <p>{data.overall_summary.average_score.toFixed(1)}%</p>
        </div>
        <div className="bg-[#fff8e6] rounded-lg p-3 shadow-sm">
          <p className="font-semibold text-[#ffbb00]">Total Bintang</p>
          <p>{data.overall_summary.total_stars}</p>
        </div>
        <div className="bg-[#f0f9ff] rounded-lg p-3 shadow-sm">
          <p className="font-semibold text-[#00bfff]">Tingkat Selesai</p>
          <p>{(data.overall_summary.completion_rate * 100).toFixed(1)}%</p>
        </div>
      </div>

      {/* Grid level */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {levels.map(([name, lvl]) => (
          <div
            key={lvl.level_id}
            onClick={() => lvl.is_level_unlocked && setActiveLevel(lvl)}
            className={`cursor-pointer w-24 h-24 flex flex-col items-center justify-center rounded-2xl shadow-md transition-all duration-200 hover:scale-105
              ${lvl.is_level_unlocked
                ? "bg-gradient-to-br from-[#f0f9ff] to-[#fff8e6] border-2 border-[#ffbb00]"
                : "bg-gray-200 border-2 border-gray-300 opacity-70 cursor-not-allowed"
              }`}
          >
            {/* Nama level */}
            <span
              className={`text-xs font-semibold mb-1 text-center ${lvl.is_level_unlocked ? "text-gray-800" : "text-gray-500"
                }`}
            >
              {name}
            </span>

            {/* Nomor */}
            <span
              className={`text-lg font-bold ${lvl.is_level_unlocked ? "text-gray-800" : "text-gray-500"
                }`}
            >
              {lvl.level_id}
            </span>

            {/* Bintang */}
            <div className="flex mt-1 space-x-1">
              {[...Array(3)].map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${i < lvl.total_stars ? "text-[#ffbb00]" : "text-gray-400"
                    }`}
                >
                  ★
                </span>
              ))}
            </div>

            {/* Lock icon */}
            {!lvl.is_level_unlocked && (
              <span className="text-gray-500 text-sm mt-1">🔒</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
