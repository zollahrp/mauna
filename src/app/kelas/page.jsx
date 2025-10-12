"use client";

import { useEffect, useMemo, useState } from "react";
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

  function getSublevelId(lvl, idx) {
    if (Array.isArray(lvl?.sublevels) && lvl.sublevels[idx]?.sublevel_id != null) {
      return lvl.sublevels[idx].sublevel_id;
    }
    if (Array.isArray(lvl?.sublevel_ids) && lvl.sublevel_ids[idx] != null) {
      return lvl.sublevel_ids[idx];
    }
    return idx + 1;
  }

  async function handleStart(sublevelId) {
    try {
      setStartingId(sublevelId);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      await api.post(`/api/user/soal/sublevel/${sublevelId}/start`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      router.push(`/kelas/sublevel/${sublevelId}`);
    } catch (e) {
      toast.error("Gagal memulai sublevel. Coba lagi.");
    } finally {
      setStartingId(null);
    }
  }

  if (loading) {
    return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">Memuat data level...</div>;
  }

  if (!data) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-muted-foreground">Tidak ada data level ditemukan.</div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {levels.map(([name, lvl]) => {
        const bannerColor = LEVEL_COLORS[name] ?? "#eee";
        const isUnlockedLevel = !!lvl?.is_level_unlocked;
        const total = Number(lvl?.total_sublevels || 0);
        const completed = Number(lvl?.completed || 0);
        const unlocked = Number(lvl?.unlocked || 0);
        const starsCount = Number(lvl?.total_stars || 0);

        return (
          <section key={String(lvl?.level_id || name)} aria-labelledby={`level-${name}`} className="mb-12">
            {/* Level Info Box */}
            <div
              className="rounded-2xl shadow-xl p-8 flex flex-col md:flex-row items-center justify-between mb-6"
              style={{
                background: bannerColor,
                color: "#fff",
                opacity: isUnlockedLevel ? 1 : 0.85,
              }}
            >
              <div>
                <h2 id={`level-${name}`} className="text-2xl font-bold mb-2">{name}</h2>
                <div className="flex gap-8 text-lg font-semibold">
                  <span>
                    Sublevel: {completed} / {total}
                  </span>
                  <span>
                    Bintang: {starsCount} / {total * 3}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3 mt-4 md:mt-0">
                <span className="bg-white/30 px-5 py-2 rounded-xl font-bold text-lg shadow">
                  {isUnlockedLevel ? (lvl?.is_level_completed ? "Selesai ✔️" : "Belum Selesai") : "Terkunci"}
                </span>
                <button
                  type="button"
                  className="flex items-center gap-2 px-5 py-2 bg-white/30 border border-white/40 rounded-xl font-semibold hover:bg-white/40 transition shadow"
                >
                  📘 Buku Panduan
                </button>
              </div>
            </div>

            {/* Sublevel Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 justify-center px-2 py-2">
              {Array.from({ length: total }).map((_, idx) => {
                const isUnlocked = isUnlockedLevel && idx < unlocked;
                const starsForThis = idx < completed ? 3 : 0;
                const sublevelId = idx + 1; // ganti jika ada id asli
                const isStarting = false; // ganti jika ada loading

                return (
                  <div
                    key={`${name}-${idx}`}
                    className={`relative flex flex-col items-center justify-center rounded-2xl shadow-lg border-2 transition-all duration-200 w-28 h-32 bg-white
                      ${isUnlocked
                        ? "border-[#ffbb00] cursor-pointer hover:scale-105 hover:shadow-xl"
                        : "border-gray-300 opacity-70"
                      }`}
                    style={{
                      boxShadow: isUnlocked ? "0 4px 16px rgba(255,187,0,0.08)" : "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                    onClick={async () => {
                      if (isUnlocked) {
                        try {
                          setStartingId(sublevelId);
                          const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                          const res = await api.get(`/api/user/soal/sublevel/${sublevelId}/start`, {}, {
                            headers: token ? { Authorization: `Bearer ${token}` } : {},
                          });
                          // Simpan data quiz ke localStorage
                          if (res.data?.data) {
                            localStorage.setItem("current_quiz", JSON.stringify(res.data.data));
                            router.push(`/kelas/practice/${sublevelId}`);
                          } else {
                            toast.error("Quiz tidak ditemukan.");
                          }
                        } catch (e) {
                          toast.error("Gagal memulai sublevel. Coba lagi.");
                        } finally {
                          setStartingId(null);
                        }
                      }
                    }}
                  >
                    <span className={`text-xs font-semibold mb-1 text-center ${isUnlocked ? "text-gray-700" : "text-gray-400"}`}>
                      Sublevel {idx + 1}
                    </span>
                    <span className={`text-2xl font-bold ${isUnlocked ? "text-gray-800" : "text-gray-400"}`}>{idx + 1}</span>
                    <div className="flex mt-2 gap-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={i < starsForThis ? "text-[#ffbb00]" : "text-gray-300"}
                          fill={i < starsForThis ? "#ffbb00" : "none"}
                        />
                      ))}
                    </div>
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl z-10">
                        <Lock size={32} className="text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm mt-8">
        <div className="rounded-lg p-3 shadow-sm" style={{ background: "var(--summary-a)" }}>
          <p className="font-semibold" style={{ color: "var(--level-star)" }}>
            Sublevel
          </p>
          <p className="text-foreground">
            {data.overall_summary.completed_sublevels} / {data.overall_summary.total_sublevels}
          </p>
        </div>
        <div className="rounded-lg p-3 shadow-sm" style={{ background: "var(--summary-b)" }}>
          <p className="font-semibold" style={{ color: "var(--level-elementary)" }}>
            Rata-rata Skor
          </p>
          <p className="text-foreground">{Number(data.overall_summary.average_score).toFixed(1)}%</p>
        </div>
        <div className="rounded-lg p-3 shadow-sm" style={{ background: "var(--summary-a)" }}>
          <p className="font-semibold" style={{ color: "var(--level-star)" }}>
            Total Bintang
          </p>
          <p className="text-foreground">{data.overall_summary.total_stars}</p>
        </div>
        <div className="rounded-lg p-3 shadow-sm" style={{ background: "var(--summary-b)" }}>
          <p className="font-semibold" style={{ color: "var(--level-elementary)" }}>
            Tingkat Selesai
          </p>
          <p className="text-foreground">{(Number(data.overall_summary.completion_rate) * 100).toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}