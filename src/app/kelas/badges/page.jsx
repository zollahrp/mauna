"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

const LEVEL_COLORS = {
  easy: "bg-green-100 text-green-700 border-green-300",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
  hard: "bg-red-100 text-red-700 border-red-300",
};

export default function BadgesPage() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await api.get("/public/badges");
        if (res.data.success && Array.isArray(res.data.data)) {
          setBadges(res.data.data);
        }
      } catch (err) {
        setBadges([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 md:px-10 py-8 sm:py-10 font-poppins flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-left">
          Koleksi Lencana Kamu
        </h2>
        {loading ? (
          <div className="text-center text-gray-400 py-10">Memuat lencana...</div>
        ) : badges.length === 0 ? (
          <div className="text-center text-gray-400 py-10">Belum ada lencana.</div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`border rounded-xl p-4 sm:p-5 flex flex-col items-center gap-2 shadow hover:scale-105 transition-transform duration-200 cursor-pointer ${LEVEL_COLORS[badge.level] || "bg-gray-100 text-gray-700 border-gray-300"}`}
                title={badge.nama}
              >
                <div className="text-4xl sm:text-5xl mb-2">{badge.icon}</div>
                <div className="font-bold text-base sm:text-lg text-center">{badge.nama}</div>
                <div className="text-xs sm:text-sm text-gray-600 text-center">{badge.deskripsi}</div>
                <span className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${LEVEL_COLORS[badge.level]}`}>
                  {badge.level.charAt(0).toUpperCase() + badge.level.slice(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}