"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState(null);

  // refs untuk scroll ke section level
  const levelRefs = useRef([]);

  useEffect(() => {
    let cancelled = false;
    const fetchProgress = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;
        const res = await api.get("/api/user/soal/user/progress/summary");
        if (!cancelled) setData(res.data);
      } catch {
        if (!cancelled) {
          setData(null);
          toast.error("Gagal mengambil data progress");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProgress();
    return () => {
      cancelled = true;
    };
  }, []);

  const levels = useMemo(() => {
    if (!data?.progress_by_level) return [];
    return Object.entries(data.progress_by_level);
  }, [data]);

  // Fungsi untuk scroll ke level berikutnya
  const scrollToLevel = (idx) => {
    if (levelRefs.current[idx]) {
      levelRefs.current[idx].scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const skipLevel = async (levelId) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;
      const res = await api.get(`/api/user/soal/level/${levelId}/skip-quiz`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.data?.data) {
        localStorage.setItem("quiz_skip", JSON.stringify(res.data.data));
      }
      toast.success("Level berhasil dilewati");
      router.push(`/kelas/practice/skip/${levelId}`);
    } catch {
      toast.error("Kerjakan satu sublevel terlebih dahulu sebelum melewati.");
    }
  };

  // useEffect untuk menjalankan skipLevel ketika levelId berubah
  const [skipLevelId, setSkipLevelId] = useState(null);

  useEffect(() => {
    if (skipLevelId) {
      skipLevel(skipLevelId);
      setSkipLevelId(null);
    }
  }, [skipLevelId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-gray-500 text-sm">
        Memuat data level...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-gray-500 text-sm">
        Tidak ada data level ditemukan.
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-12 max-w-6xl mx-auto">
      {levels.map(([name, lvl], idx) => {
        const bannerColor = LEVEL_COLORS[name] ?? "#ccc";
        const isUnlockedLevel = !!lvl?.is_level_unlocked;
        const total = Number(lvl?.total_sublevels || 0);
        const completed = Number(lvl?.completed || 0);
        const starsCount = Number(lvl?.total_stars || 0);

        // Tampilkan tombol skip jika unlocked: 0 (is_level_unlocked === false)
        const showSkipButton = !isUnlockedLevel;

        return (
          <section
            key={String(lvl?.level_id || name)}
            className="space-y-8"
            ref={el => (levelRefs.current[idx] = el)}
          >
            {/* === Header Level === */}
            <div className="rounded-2xl border border-gray-100 bg-gradient-to-r from-white to-gray-50 shadow-sm hover:shadow-md transition-all duration-300 px-6 py-5 md:px-8 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Left Section */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 w-full">
                {/* Level Badge */}
                <div
                  className="w-14 h-14 flex items-center justify-center rounded-xl text-white font-bold text-lg shadow-sm"
                  style={{
                    backgroundColor: bannerColor,
                  }}
                >
                  {name.charAt(0)}
                </div>
                {/* Level Info */}
                <div className="text-center md:text-left">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">{name}</h2>
                  <p className="text-gray-500 text-sm md:text-base">
                    Sublevel <span className="font-semibold text-gray-800">{completed}</span> / {total} • ⭐{" "}
                    <span className="font-semibold text-gray-800">{starsCount}</span> / {total * 3}
                  </p>
                </div>
              </div>
              {/* Status Badge & Skip Button */}
              <div className="shrink-0 flex flex-col items-end gap-2">
                <span
                  className={`px-4 py-1.5 text-sm font-medium rounded-full shadow-sm transition-all ${isUnlockedLevel
                      ? lvl?.is_level_completed
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                >
                  {isUnlockedLevel
                    ? lvl?.is_level_completed
                      ? "Selesai"
                      : "Belum Selesai"
                    : "Terkunci"}
                </span>
                {showSkipButton && (
                  <button
                    className="mt-1 px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-full shadow transition"
                    onClick={() => setSkipLevelId(lvl?.level_id)}
                    type="button"
                  >
                    Skip Level
                  </button>
                )}
              </div>
            </div>

            {/* === Sublevel Grid === */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 justify-items-center">
              {lvl.sublevels.map((sub) => {
                const isUnlocked = sub.is_unlocked;
                return (
                  <div
                    key={sub.sublevel_id}
                    className={`relative flex flex-col items-center justify-center rounded-2xl border transition-all w-32 h-36 bg-white shadow-sm hover:shadow-md ${isUnlocked
                        ? "border-[#ffbb00] cursor-pointer hover:-translate-y-1 hover:shadow-lg"
                        : "border-gray-200 opacity-60"
                      }`}
                    onClick={async () => {
                      if (isUnlocked) {
                        try {
                          setStartingId(sub.sublevel_id);
                          const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                          const res = await api.get(`/api/user/soal/sublevel/${sub.sublevel_id}/start`, {}, {
                            headers: token ? { Authorization: `Bearer ${token}` } : {},
                          });
                          if (res.data?.data) {
                            localStorage.setItem("current_quiz", JSON.stringify(res.data.data));
                            router.push(`/kelas/practice/${sub.sublevel_id}`);
                          } else {
                            toast.error("Quiz tidak ditemukan.");
                          }
                        } catch {
                          toast.error("Gagal memulai sublevel. Coba lagi.");
                        } finally {
                          setStartingId(null);
                        }
                      }
                    }}
                  >
                    <span
                      className={`text-xs font-medium mb-1 text-center ${isUnlocked ? "text-gray-700" : "text-gray-400"
                        }`}
                    >
                      {sub.sublevel_name}
                    </span>
                    <span
                      className={`text-2xl font-bold ${isUnlocked ? "text-gray-900" : "text-gray-400"
                        }`}
                    >
                      {sub.sublevel_id}
                    </span>
                    <div className="flex mt-2 gap-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={i < sub.stars ? "text-[#ffbb00]" : "text-gray-300"}
                          fill={i < sub.stars ? "#ffbb00" : "none"}
                        />
                      ))}
                    </div>
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl z-10">
                        <Lock size={28} className="text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* === Summary Section === */}
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          {
            label: "Sublevel",
            value: `${data.overall_summary.completed_sublevels} / ${data.overall_summary.total_sublevels}`,
          },
          {
            label: "Rata-rata Skor",
            value: `${Number(data.overall_summary.average_score).toFixed(1)}%`,
          },
          { label: "Total Bintang", value: data.overall_summary.total_stars },
          {
            label: "Tingkat Selesai",
            value: `${Number(data.overall_summary.completion_rate).toFixed(1)}%`,
          },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all"
          >
            <p className="text-gray-500 font-medium mb-2">{item.label}</p>
            <p className="text-gray-900 font-extrabold text-2xl">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}