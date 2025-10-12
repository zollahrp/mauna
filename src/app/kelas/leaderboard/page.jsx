"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import api from "@/lib/axios";
export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get("/public/leaderboard");
        if (res.data.success && Array.isArray(res.data.data)) {
          setLeaderboard(res.data.data);
        }
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-16">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Papan Skor Mingguan 🏆
      </h2>
      <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-xl">
        {loading ? (
          <div className="text-center text-gray-400 py-10">Memuat data...</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center text-gray-400 py-10">Tidak ada data.</div>
        ) : (
          leaderboard.map((user, index) => (
            <div
              key={user.user_id}
              className={`flex items-center justify-between py-3 border-b last:border-none border-gray-100 ${
                user.is_current_user ? "bg-yellow-50" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-gray-600 font-semibold w-5 text-center">
                  {user.rank}
                </span>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2" style={{ borderColor: user.tier_color || "#eee" }}>
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.username}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <Image
                      src="/images/avatar_default.jpg"
                      alt="Default Avatar"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  )}
                </div>
                <span className="font-medium text-gray-800">{user.username}</span>
                <span
                  className="ml-2 px-2 py-1 rounded text-xs font-bold"
                  style={{ background: user.tier_color || "#eee", color: "#333" }}
                >
                  {user.tier}
                </span>
              </div>
              <span className="font-semibold text-[#ffbb00]">
                {user.total_xp} XP
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}