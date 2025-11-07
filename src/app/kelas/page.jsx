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
  const [skipLevelId, setSkipLevelId] = useState(null);

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
    // Static fallback data, all levels locked
    const staticData = {
      overall_summary: {
        total_sublevels: 40,
        completed_sublevels: 0,
        completion_rate: 0.0,
        total_stars: 0,
        total_attempts: 0,
        average_score: 0,
      },
      progress_by_level: {
        "Level 1": {
          level_id: 1,
          total_sublevels: 10,
          completed: 0,
          total_stars: 0,
          unlocked: 0,
          is_level_unlocked: false,
          is_level_completed: false,
          completion_rate: 0.0,
          sublevels: Array.from({ length: 10 }, (_, i) => ({
            sublevel_id: i + 1,
            sublevel_name: `Sublevel 1.${i + 1}`,
            is_unlocked: false,
            is_completed: false,
            completion_percentage: 0,
            stars: 0,
            attempts: 0,
            best_score: 0,
            last_attempt: null,
            completed_at: null,
          })),
        },
        "Level 2": {
          level_id: 2,
          total_sublevels: 10,
          completed: 0,
          total_stars: 0,
          unlocked: 0,
          is_level_unlocked: false,
          is_level_completed: false,
          completion_rate: 0.0,
          sublevels: Array.from({ length: 10 }, (_, i) => ({
            sublevel_id: i + 11,
            sublevel_name: `Sublevel 2.${i + 1}`,
            is_unlocked: false,
            is_completed: false,
            completion_percentage: 0,
            stars: 0,
            attempts: 0,
            best_score: 0,
            last_attempt: null,
            completed_at: null,
          })),
        },
        "Level 3": {
          level_id: 3,
          total_sublevels: 10,
          completed: 0,
          total_stars: 0,
          unlocked: 0,
          is_level_unlocked: false,
          is_level_completed: false,
          completion_rate: 0.0,
          sublevels: Array.from({ length: 10 }, (_, i) => ({
            sublevel_id: i + 21,
            sublevel_name: `Sublevel 3.${i + 1}`,
            is_unlocked: false,
            is_completed: false,
            completion_percentage: 0,
            stars: 0,
            attempts: 0,
            best_score: 0,
            last_attempt: null,
            completed_at: null,
          })),
        },
        "Level 4": {
          level_id: 4,
          total_sublevels: 10,
          completed: 0,
          total_stars: 0,
          unlocked: 0,
          is_level_unlocked: false,
          is_level_completed: false,
          completion_rate: 0.0,
          sublevels: Array.from({ length: 10 }, (_, i) => ({
            sublevel_id: i + 31,
            sublevel_name: `Sublevel 4.${i + 1}`,
            is_unlocked: false,
            is_completed: false,
            completion_percentage: 0,
            stars: 0,
            attempts: 0,
            best_score: 0,
            last_attempt: null,
            completed_at: null,
          })),
        },
      },
    };

    // Render with same layout as main data, but all locked and click goes to /auth/login
    return (
      <div className="space-y-6 sm:space-y-7 md:space-y-8 lg:space-y-10 pb-8 sm:pb-10 md:pb-12 lg:pb-16">
        {/* Summary Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 text-center px-2 sm:px-0">
          {[
            {
              label: "Sublevel",
              value: `${staticData.overall_summary.completed_sublevels} / ${staticData.overall_summary.total_sublevels}`,
            },
            {
              label: "Rata-rata Skor",
              value: `${Number(staticData.overall_summary.average_score).toFixed(1)}%`,
            },
            { label: "Total Bintang", value: staticData.overall_summary.total_stars },
            {
              label: "Tingkat Selesai",
              value: `${Number(staticData.overall_summary.completion_rate).toFixed(1)}%`,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-md sm:rounded-lg md:rounded-xl lg:rounded-2xl bg-white border border-gray-200 p-2 sm:p-3 md:p-4 lg:p-5 shadow-sm hover:shadow-md transition-all"
            >
              <p className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-gray-500 font-medium mb-0.5 sm:mb-1 md:mb-1.5 leading-tight">
                {item.label}
              </p>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-900 font-bold">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Levels Section */}
        <div className="space-y-8 sm:space-y-10 md:space-y-12 lg:space-y-14">
          {Object.entries(staticData.progress_by_level).map(([name, lvl], idx) => {
            const bannerColor = LEVEL_COLORS[name] ?? "#ccc";
            const isUnlockedLevel = false; // force locked
            const total = Number(lvl?.total_sublevels || 0);
            const completed = Number(lvl?.completed || 0);
            const starsCount = Number(lvl?.total_stars || 0);
            const showSkipButton = true;

            return (
              <section
                key={String(lvl?.level_id || name)}
                className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6"
              >
                {/* Header Level */}
                <div className="rounded-md sm:rounded-lg md:rounded-xl lg:rounded-2xl border border-gray-100 bg-gradient-to-r from-white to-gray-50 shadow-sm hover:shadow-md transition-all duration-300 p-3 sm:p-4 md:p-5 lg:p-6">
                  <div className="flex flex-col gap-2.5 sm:gap-3 md:gap-3.5 lg:gap-4">
                    {/* Top Section - Level Info */}
                    <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
                      {/* Level Badge */}
                      <div
                        className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-md sm:rounded-lg md:rounded-lg lg:rounded-xl text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg shadow-sm flex-shrink-0"
                        style={{ backgroundColor: bannerColor }}
                      >
                        {name.charAt(0)}
                      </div>
                      {/* Level Info */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-gray-800 mb-0.5 truncate">
                          {name}
                        </h2>
                        <p className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-gray-500 line-clamp-1 sm:line-clamp-2">
                          Sublevel <span className="font-semibold text-gray-800">{completed}</span> / {total} • ⭐{" "}
                          <span className="font-semibold text-gray-800">{starsCount}</span> / {total * 3}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Section - Status & Skip Button */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span
                        className="px-2 sm:px-2.5 md:px-3 lg:px-4 py-0.5 sm:py-1 md:py-1.5 text-[8px] sm:text-[9px] md:text-xs lg:text-sm font-medium rounded-full shadow-sm transition-all whitespace-nowrap bg-gray-100 text-gray-500 border border-gray-200"
                      >
                        Terkunci
                      </span>
                      {showSkipButton && (
                        <button
                          className="px-2 sm:px-2.5 md:px-3 lg:px-4 py-0.5 sm:py-1 md:py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[8px] sm:text-[9px] md:text-xs lg:text-sm font-semibold rounded-full shadow transition whitespace-nowrap"
                          type="button"
                          disabled
                        >
                          Skip Level
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sublevel Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3">
                  {lvl.sublevels.map((sub) => (
                    <div
                      key={sub.sublevel_id}
                      className="relative flex flex-col items-center justify-center rounded-md sm:rounded-lg md:rounded-xl lg:rounded-2xl border border-gray-200 opacity-60 transition-all w-full aspect-square bg-white shadow-sm hover:shadow-md cursor-pointer"
                      onClick={() => window.location.href = "/auth/login"}
                    >
                      <span className="text-lg sm:text-md md:text-lg lg:text-md font-medium mb-0.5 text-center px-0.5 text-gray-400">
                        {sub.sublevel_name}
                      </span>
                      <span className="text-lg sm:text-sm md:text-base lg:text-xl font-bold text-gray-400">
                        {sub.sublevel_id}
                      </span>
                      <div className="flex mt-0.5 gap-0.5">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className="sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-4.5 lg:h-4.5 text-gray-300"
                            fill="none"
                          />
                        ))}
                      </div>
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md sm:rounded-lg md:rounded-xl lg:rounded-2xl z-10">
                        <Lock size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-7 md:space-y-8 lg:space-y-10  pb-8 sm:pb-10 md:pb-12 lg:pb-16">
      {/* Summary Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 text-center px-2 sm:px-0">
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
            className="rounded-md sm:rounded-lg md:rounded-xl lg:rounded-2xl bg-white border border-gray-200 p-2 sm:p-3 md:p-4 lg:p-5 shadow-sm hover:shadow-md transition-all"
          >
            <p className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-gray-500 font-medium mb-0.5 sm:mb-1 md:mb-1.5 leading-tight">
              {item.label}
            </p>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-900 font-bold">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Levels Section */}
      <div className="space-y-8 sm:space-y-10 md:space-y-12 lg:space-y-14">
        {levels.map(([name, lvl], idx) => {
          const bannerColor = LEVEL_COLORS[name] ?? "#ccc";
          const isUnlockedLevel = !!lvl?.is_level_unlocked;
          const total = Number(lvl?.total_sublevels || 0);
          const completed = Number(lvl?.completed || 0);
          const starsCount = Number(lvl?.total_stars || 0);
          const showSkipButton = !isUnlockedLevel;

          return (
            <section
              key={String(lvl?.level_id || name)}
              className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6"
              ref={el => (levelRefs.current[idx] = el)}
            >
              {/* Header Level */}
              <div className="rounded-md sm:rounded-lg md:rounded-xl lg:rounded-2xl border border-gray-100 bg-gradient-to-r from-white to-gray-50 shadow-sm hover:shadow-md transition-all duration-300 p-3 sm:p-4 md:p-5 lg:p-6">
                <div className="flex flex-col gap-2.5 sm:gap-3 md:gap-3.5 lg:gap-4">
                  {/* Top Section - Level Info */}
                  <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
                    {/* Level Badge */}
                    <div
                      className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-md sm:rounded-lg md:rounded-lg lg:rounded-xl text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg shadow-sm flex-shrink-0"
                      style={{ backgroundColor: bannerColor }}
                    >
                      {name.charAt(0)}
                    </div>
                    {/* Level Info */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-gray-800 mb-0.5 truncate">
                        {name}
                      </h2>
                      <p className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-gray-500 line-clamp-1 sm:line-clamp-2">
                        Sublevel <span className="font-semibold text-gray-800">{completed}</span> / {total} • ⭐{" "}
                        <span className="font-semibold text-gray-800">{starsCount}</span> / {total * 3}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Section - Status & Skip Button */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span
                      className={`px-2 sm:px-2.5 md:px-3 lg:px-4 py-0.5 sm:py-1 md:py-1.5 text-[8px] sm:text-[9px] md:text-xs lg:text-sm font-medium rounded-full shadow-sm transition-all whitespace-nowrap ${
                        isUnlockedLevel
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
                        className="px-2 sm:px-2.5 md:px-3 lg:px-4 py-0.5 sm:py-1 md:py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[8px] sm:text-[9px] md:text-xs lg:text-sm font-semibold rounded-full shadow transition whitespace-nowrap"
                        onClick={() => setSkipLevelId(lvl?.level_id)}
                        type="button"
                      >
                        Skip Level
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sublevel Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3">
                {lvl.sublevels.map((sub) => {
                  const isUnlocked = sub.is_unlocked;
                  return (
                    <div
                      key={sub.sublevel_id}
                      className={`relative flex flex-col items-center justify-center rounded-md sm:rounded-lg md:rounded-xl lg:rounded-2xl border transition-all w-full aspect-square bg-white shadow-sm hover:shadow-md ${
                        isUnlocked
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
                      <span className={`text-lg sm:text-md md:text-lg lg:text-md font-medium mb-0.5 text-center px-0.5 ${isUnlocked ? "text-gray-700" : "text-gray-400"}`}>
                        {sub.sublevel_name}
                      </span>
                      <span className={`text-lg sm:text-sm md:text-base lg:text-xl font-bold ${isUnlocked ? "text-gray-900" : "text-gray-400"}`}>
                        {sub.sublevel_id}
                      </span>
                      <div className="flex mt-0.5 gap-0.5">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={`sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-4.5 lg:h-4.5 ${i < sub.stars ? "text-[#ffbb00]" : "text-gray-300"}`}
                            fill={i < sub.stars ? "#ffbb00" : "none"}
                          />
                        ))}
                      </div>
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md sm:rounded-lg md:rounded-xl lg:rounded-2xl z-10">
                          <Lock size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}