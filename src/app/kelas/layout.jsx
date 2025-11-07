"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/axios";

export default function KelasLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDailyProgress, setUserDailyProgress] = useState(null);
  const intervalRef = useRef();

  const getDailyProgress = async () => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;
      const res = await api.get("/api/auth/daily-task");
      if (res.data?.data) {
        setUserDailyProgress(res.data.data);
      }
    } catch (err) {
      // console.error(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    getDailyProgress();

    // Polling setiap 15 detik
    intervalRef.current = setInterval(() => {
      getDailyProgress();
    }, 15000);

    return () => clearInterval(intervalRef.current);
  }, []);

  // Batasi progress maksimal 3
  const completedSublevels = Math.min(userDailyProgress?.completed_sublevels || 0, 3);

  return (
    <div className="relative flex min-h-screen bg-white">
      {/* Konten utama */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 md:pr-80 lg:pr-96  transition-all lg:ml-[20rem]  min-h-[100dvh] duration-300">
        {children}
      </main>

      {/* Sidebar kanan */}
      <aside className="hidden md:flex fixed right-4 lg:right-8 top-4 bottom-4 w-72 lg:w-80 p-6 flex-col gap-6 overflow-y-auto">
        {/* Leaderboard */}
        <div className="rounded-2xl p-6 shadow-md bg-white border border-gray-100">
          <Link href="/kelas/leaderboard" className="flex flex-col items-center">
            <h3 className="font-semibold text-gray-800 mb-3 text-base lg:text-lg">
              Buka Papan Skor!
            </h3>
          </Link>

          <div className="flex items-center gap-3">
            <Image
              src="/icons/score.png"
              alt="Score"
              width={40}
              height={40}
              className="flex-shrink-0"
            />
            <p className="text-xs lg:text-sm text-gray-600 leading-snug">
              {userDailyProgress?.is_completed ? (
                <>
                  <span className="font-semibold text-green-600">Selamat!</span>{" "}
                  <br />
                  <span className="text-[#000000] font-semibold">
                    Ayo terus latihan, puncak leaderboard menantimu!
                  </span>
                </>
              ) : (
                <>
                  Tinggal{" "}
                  <span className="font-semibold text-[#ffbb00]">
                    {userDailyProgress
                      ? `${Math.max(3 - completedSublevels, 0)} pelajaran lagi`
                      : "3 pelajaran lagi"}
                  </span>{" "}
                  untuk mulai berkompetisi. Semangat, kamu pasti bisa!
                </>
              )}
            </p>
          </div>
        </div>

        {/* Misi Harian */}
        <div className="rounded-2xl p-6 shadow-md bg-white border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800 text-base lg:text-lg">Misi Harian</h3>
          </div>
          <p className="text-xs lg:text-sm text-gray-600 mb-2">Dapatkan 10 XP</p>
          <div className="w-full h-3 lg:h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#ffbb00] transition-all duration-700 rounded-full"
              style={{
                width: `${(completedSublevels / 3) * 100}%`,
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {`${completedSublevels} / 3`}
            {userDailyProgress?.is_completed && (
              <span className="ml-2 text-green-600 font-semibold">
                Selesai!
              </span>
            )}
          </p>
        </div>

        {/* Profil / Login */}
        {!isLoggedIn && (
          <div className="rounded-2xl p-6 shadow-md bg-white border border-gray-100 text-center">
            <p className="text-xs lg:text-sm text-gray-700 mb-5">
              Buat profil untuk menyimpan progresmu!
            </p>
            <button className="w-full py-2.5 lg:py-3 rounded-xl bg-[#32cd32] text-white text-sm font-semibold hover:bg-[#2ab82a] transition-all">
              Buat Profil
            </button>
            <button className="w-full mt-3 py-2.5 lg:py-3 rounded-xl bg-[#00bfff] text-white text-sm font-semibold hover:bg-[#00a8e6] transition-all">
              Masuk
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}