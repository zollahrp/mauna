"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Star, Zap } from "lucide-react"
import toast from "react-hot-toast"

const LEVEL_COLORS = {
  Beginner: "#32cd32",
  Elementary: "#00bfff",
  Intermediate: "#ffbb00",
  Advanced: "#ff4d4f",
}

export default function JourneyPage() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [startingId, setStartingId] = useState(null)
  const [skippingLevelId, setSkippingLevelId] = useState(null)
  const levelRefs = useRef([])

  const fetchWithToken = async (url, options = {}) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    const response = await fetch(url, {
      ...options,
      headers,
    })
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    return response.json()
  }

  useEffect(() => {
    let cancelled = false
    const fetchProgress = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        if (!token) return
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        const res = await fetchWithToken(`${baseUrl}/api/user/soal/user/progress/summary`)
        if (!cancelled) setData(res)
      } catch {
        if (!cancelled) {
          setData(null)
          toast.error("Gagal mengambil data progress")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchProgress()
    return () => {
      cancelled = true
    }
  }, [])

  const levels = useMemo(() => {
    if (!data?.progress_by_level) return []
    return Object.entries(data.progress_by_level)
  }, [data])

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center space-y-3">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Memuat data level...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center space-y-2">
          <p className="text-gray-500 text-lg">Tidak ada data level ditemukan.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-2 sm:px-4 md:px-8 py-4 md:py-10">
      <div className="space-y-10 md:space-y-16 max-w-6xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
          {[
            {
              label: "Sublevel",
              value: `${data.overall_summary.completed_sublevels} / ${data.overall_summary.total_sublevels}`,
              icon: "📚",
              color: "from-blue-500 to-blue-600",
            },
            {
              label: "Rata-rata Skor",
              value: `${Number(data.overall_summary.average_score).toFixed(1)}%`,
              icon: "📊",
              color: "from-purple-500 to-purple-600",
            },
            {
              label: "Total Bintang",
              value: data.overall_summary.total_stars,
              icon: "⭐",
              color: "from-yellow-500 to-yellow-600",
            },
            {
              label: "Tingkat Selesai",
              value: `${Number(data.overall_summary.completion_rate).toFixed(1)}%`,
              icon: "🎯",
              color: "from-green-500 to-green-600",
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`rounded-2xl bg-gradient-to-br ${item.color} p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-white`}
            >
              <div className="text-2xl md:text-3xl mb-2">{item.icon}</div>
              <p className="text-white/80 font-medium text-xs md:text-sm mb-1">{item.label}</p>
              <p className="font-extrabold text-xl md:text-2xl">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Level Sections */}
        {levels.map(([name, lvl], idx) => {
          const bannerColor = LEVEL_COLORS[name] ?? "#ccc"
          const isUnlockedLevel = !!lvl?.is_level_unlocked
          const total = Number(lvl?.total_sublevels || 0)
          const completed = Number(lvl?.completed || 0)
          const starsCount = Number(lvl?.total_stars || 0)
          const canSkip = !isUnlockedLevel
          const progressPercent = total > 0 ? (completed / total) * 100 : 0

          return (
            <section
              key={String(lvl?.level_id || name)}
              className="space-y-6 md:space-y-8"
              ref={(el) => (levelRefs.current[idx] = el)}
            >
              <div className="rounded-3xl border-2 border-gray-100 bg-gradient-to-r from-white via-gray-50 to-white shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                {/* Progress bar at top */}
                <div className="h-1 bg-gray-200">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: bannerColor,
                    }}
                  ></div>
                </div>

                <div className="px-2 sm:px-4 md:px-8 py-4 md:py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                  {/* Left Section */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6 flex-1 w-full">
                    {/* Level Badge */}
                    <div
                      className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-2xl text-white font-bold text-xl md:text-2xl shadow-lg transform hover:scale-110 transition-transform duration-300 flex-shrink-0"
                      style={{
                        backgroundColor: bannerColor,
                      }}
                    >
                      {name.charAt(0)}
                    </div>
                    {/* Level Info */}
                    <div className="flex-1">
                      <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-2">{name}</h2>
                      <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-base">
                        <div className="flex items-center gap-1 md:gap-2">
                          <span className="text-gray-600">Sublevel:</span>
                          <span className="font-bold text-gray-900 bg-gray-100 px-2 md:px-3 py-1 rounded-full">
                            {completed}/{total}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2">
                          <span className="text-gray-600">Bintang:</span>
                          <span className="font-bold text-yellow-600 bg-yellow-50 px-2 md:px-3 py-1 rounded-full flex items-center gap-1">
                            ⭐ {starsCount}/{total * 3}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Status & Skip Button */}
                  <div className="flex flex-col items-end gap-2 md:gap-3 flex-shrink-0">
                    <span
                      className={`px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-bold rounded-full shadow-md transition-all inline-block ${
                        isUnlockedLevel
                          ? lvl?.is_level_completed
                            ? "bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-2 border-green-300"
                            : "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border-2 border-amber-300"
                          : "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 border-2 border-gray-300"
                      }`}
                    >
                      {isUnlockedLevel ? (lvl?.is_level_completed ? "✓ Selesai" : "⏳ Belum Selesai") : "🔒 Terkunci"}
                    </span>

                    {canSkip && (
                      <button
                        disabled={skippingLevelId === lvl.level_id}
                        className="px-4 md:px-5 py-2 text-xs md:text-sm font-bold rounded-full shadow-lg transition-all flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 duration-200"
                        title="Lewati semua sublevel di level ini"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            setSkippingLevelId(lvl.level_id);
                            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
                            await fetchWithToken(`${baseUrl}/api/user/soal/level/${lvl.level_id}/skip-quiz`, {
                              method: "POST",
                            });
                            toast.success("Berhasil skip level! 🎉");
                            setLoading(true);
                            const res = await fetchWithToken(`${baseUrl}/api/user/soal/user/progress/summary`);
                            setData(res);
                          } catch {
                            toast.error("Gagal skip level. Coba lagi.");
                          } finally {
                            setSkippingLevelId(null);
                          }
                        }}
                        type="button"
                      >
                        <Zap size={18} />
                        Skip Level
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Responsive Sublevel Grid */}
              <div className="w-full overflow-x-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 min-w-[320px]">
                  {lvl.sublevels.map((sub, subIdx) => {
                    const isUnlocked = sub.is_unlocked;
                    const isCompleted = sub.is_completed;

                    return (
                      <div
                        key={sub.sublevel_id}
                        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-300 w-full aspect-square max-w-[140px] mx-auto shadow-md hover:shadow-lg transform ${
                          isUnlocked
                            ? "border-blue-300 bg-gradient-to-br from-blue-50 to-white cursor-pointer hover:-translate-y-2 hover:border-blue-500"
                            : "border-gray-200 bg-gray-50 opacity-50"
                        } ${isCompleted ? "ring-2 ring-green-400 ring-offset-2" : ""}`}
                        onClick={async () => {
                          if (isUnlocked) {
                            try {
                              setStartingId(sub.sublevel_id);
                              const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
                              const res = await fetchWithToken(
                                `${baseUrl}/api/user/soal/sublevel/${sub.sublevel_id}/start`,
                              );
                              if (res?.data) {
                                localStorage.setItem("current_quiz", JSON.stringify(res.data));
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
                          className={`text-xs md:text-sm font-semibold mb-2 text-center px-2 ${
                            isUnlocked ? "text-gray-700" : "text-gray-400"
                          }`}
                        >
                          {sub.sublevel_name}
                        </span>
                        <span className={`text-2xl md:text-3xl font-black mb-2 ${isUnlocked ? "text-gray-900" : "text-gray-400"}`}>
                          {sub.sublevel_id}
                        </span>
                        <div className="flex gap-1 mb-2">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < sub.stars ? "text-yellow-400" : "text-gray-300"}
                              fill={i < sub.stars ? "#facc15" : "none"}
                            />
                          ))}
                        </div>
                        {isCompleted && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            ✓
                          </div>
                        )}
                        {!isUnlocked && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-2xl z-10">
                            <Lock size={32} className="text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}