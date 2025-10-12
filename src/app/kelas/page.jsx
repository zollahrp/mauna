"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Lock, Star } from "lucide-react";
import toast from "react-hot-toast";

const LEVEL_COLORS = {
  Beginner: "#32cd32",
  Elementary: "#00bfff",
  Intermediate: "#ffbb00",
  Advanced: "#ff4d4f",
};

export default function JourneyPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await api.get("/api/user/soal/user/progress/summary");
        setData(res.data);
      } catch (error) {
        toast.error("Gagal mengambil data progress");
      } finally {
        setLoading(false);
      }
    };
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

  const levels = Object.entries(data.progress_by_level);

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      {/* Level List - Setiap level tampil dengan box hijau dan grid sublevel */}
      {levels.map(([name, lvl]) => (
        <div key={lvl.level_id} className="mb-10">
          {/* Box hijau info level */}
          <div
            className="rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between mb-4"
            style={{
              background: LEVEL_COLORS[name],
              color: "#fff",
              opacity: lvl.is_level_unlocked ? 1 : 0.7,
            }}
          >
            <div>
              <h2 className="text-xl font-bold mb-1">{name}</h2>
              <p className="text-sm font-semibold opacity-90 mb-2">
                @{data.username}'{String(data.user_id).slice(-2)}
              </p>
              <div className="flex gap-6 text-base font-semibold">
                <span>
                  Sublevel: {lvl.completed} / {lvl.total_sublevels}
                </span>
                <span>
                  Bintang: {lvl.total_stars} / {lvl.total_sublevels * 3}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="bg-white/20 px-4 py-2 rounded-lg font-bold text-lg">
                {lvl.is_level_unlocked
                  ? lvl.is_level_completed
                    ? "Selesai ✔️"
                    : "Belum Selesai"
                  : "Terkunci"}
              </span>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/20 border border-white/30 rounded-lg font-semibold hover:bg-white/30 transition">
                📘 Buku Panduan
              </button>
            </div>
          </div>
          {/* Grid sublevel */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-center mb-4">
            {[...Array(lvl.total_sublevels)].map((_, idx) => {
              const isUnlocked = lvl.is_level_unlocked && idx < lvl.unlocked;
              const stars = idx < lvl.completed ? 3 : 0;
              return (
                <div
                  key={idx}
                  className={`relative flex flex-col items-center justify-center rounded-2xl shadow-md border-2 transition-all duration-200 w-28 h-32
                    ${isUnlocked
                      ? "bg-white border-[#ffbb00] cursor-pointer hover:scale-105"
                      : "bg-white border-gray-300 opacity-80"
                    }`}
                  onClick={() =>
                    isUnlocked &&
                    toast.success(`Mulai Sublevel ${idx + 1} (${name})`)
                  }
                >
                  <span className="text-xs font-semibold mb-1 text-center text-gray-700">
                    Sublevel {idx + 1}
                  </span>
                  <span className="text-2xl font-bold text-gray-800">{idx + 1}</span>
                  <div className="flex mt-2 space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < stars ? "text-[#ffbb00]" : "text-gray-300"}
                        fill={i < stars ? "#ffbb00" : "none"}
                      />
                    ))}
                  </div>
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl z-10">
                      <Lock size={32} className="text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Overall Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm text-gray-700 mt-8">
        <div className="bg-[#fff8e6] rounded-lg p-3 shadow-sm">
          <p className="font-semibold text-[#ffbb00]">Sublevel</p>
          <p>
            {data.overall_summary.completed_sublevels} / {data.overall_summary.total_sublevels}
          </p>
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
    </div>
  );
}