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

    // Polling setiap 5 detik
    intervalRef.current = setInterval(() => {
      getDailyProgress();
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, []);

  // Batasi progress maksimal 3
  const completedSublevels = Math.min(userDailyProgress?.completed_sublevels || 0, 3);

  return (
    <div className="relative flex min-h-screen bg-white">
      {/* Konten utama */}
      <main className="flex-1 p-6 md:p-0 md:pr-[17rem] md:pl-10 transition-all duration-300">
        {children}
      </main>

      {/* Sidebar kanan */}
      <aside className="hidden md:flex fixed right-35 top-0 bottom-0 w-[24rem] p-8 flex-col gap-6 overflow-y-auto bg-white">
        {/* Leaderboard */}
        <div className="rounded-2xl p-6 shadow-md bg-white">
          <Link href="/kelas/leaderboard" className="flex flex-col items-center">
            <h3 className="font-semibold text-gray-800 mb-3 text-lg">
              Buka Papan Skor!
            </h3>
          </Link>

          <div className="flex items-center gap-3">
            <Image
              src="/icons/score.png"
              alt="Score"
              width={42}
              height={42}
              className="flex-shrink-0"
            />
            <p className="text-sm text-gray-600 leading-snug">
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
        <div className="rounded-2xl p-6 shadow-md bg-white">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800 text-lg">Misi Harian</h3>
          </div>
          <p className="text-sm text-gray-600 mb-2">Dapatkan 10 XP</p>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#ffbb00] transition-all duration-700"
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
          <div className="rounded-2xl p-6 shadow-md bg-white text-center">
            <p className="text-sm text-gray-700 mb-6">
              Buat profil untuk menyimpan progresmu!
            </p>
            <button className="w-full py-3 rounded-xl bg-[#32cd32] text-white font-semibold hover:opacity-90">
              Buat Profil
            </button>
            <button className="w-full mt-3 py-3 rounded-xl bg-[#00bfff] text-white font-semibold hover:opacity-90">
              Masuk
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}