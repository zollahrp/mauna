"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import api from "@/lib/axios";
import { ChevronDown } from "lucide-react";

const TIERS = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
const TIER_COLORS = {
  Bronze: "#cd7f32",
  Silver: "#bfc1c2",
  Gold: "#ffd700",
  Platinum: "#e5e4e2",
  Diamond: "#00bfff",
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTier, setActiveTier] = useState("Bronze");

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

  // Filter leaderboard by tier
  const filteredLeaderboard = leaderboard.filter(
    (user) => user.tier?.toLowerCase() === activeTier.toLowerCase()
  );

  // Find border index (last user with this tier)
  const borderIndex = filteredLeaderboard.length - 1;

  return (
    <div className="min-h-screen lg:-ml-[20rem] px-3 py-4 md:px-6 md:py-8 lg:ml-1 mb-16 md:mb-0">
      {/* Container */}
      <div className="max-w-full md:max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 text-center mb-3 md:mb-4">
            Papan Skor Mingguan 🏆
          </h2>
          
          {/* Tier Selection - Responsive */}
          {/* Mobile: Dropdown Select */}
          <div className="block md:hidden">
            <div className="relative">
              <select
                value={activeTier}
                onChange={(e) => setActiveTier(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#ffbb00] focus:border-[#ffbb00] shadow-sm"
                style={{
                  backgroundImage: `linear-gradient(45deg, transparent 50%, ${TIER_COLORS[activeTier]}22 50%)`,
                }}
              >
                {TIERS.map((tier) => (
                  <option key={tier} value={tier}>
                    Tier {tier}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
            </div>
          </div>

          {/* Tablet & Desktop: Buttons */}
          <div className="hidden md:flex gap-2 justify-center flex-wrap">
            {TIERS.map((tier) => (
              <button
                key={tier}
                className={`px-4 py-2 rounded-lg font-semibold border transition flex-shrink-0 text-sm ${
                  activeTier === tier
                    ? "bg-[#ffbb00] text-white border-[#ffbb00] shadow-lg"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
                style={{
                  boxShadow:
                    activeTier === tier
                      ? `0 4px 12px ${TIER_COLORS[tier]}33`
                      : undefined,
                }}
                onClick={() => setActiveTier(tier)}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Container */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          {loading ? (
            <div className="text-center text-gray-400 py-8 md:py-12">
              <div className="animate-pulse text-sm md:text-base">Memuat data...</div>
            </div>
          ) : filteredLeaderboard.length === 0 ? (
            <div className="text-center text-gray-400 py-8 md:py-12">
              <div className="text-2xl md:text-4xl mb-2 md:mb-4">📊</div>
              <div className="text-sm md:text-base">Tidak ada data untuk tier {activeTier}</div>
            </div>
          ) : (
            <div>
              {/* Header Row - Desktop only */}
              <div className="hidden lg:flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-6">
                  <span className="w-12 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">Rank</span>
                  <span className="w-12"></span>
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nama</span>
                  <span className="ml-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Tier</span>
                </div>
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">XP</span>
              </div>

              {/* Leaderboard List */}
              <div className="divide-y divide-gray-100">
                {filteredLeaderboard.map((user, index) => (
                  <div
                    key={user.user_id}
                    className={`px-4 py-4 md:px-6 md:py-5 transition-colors hover:bg-gray-50 ${
                      user.is_current_user ? "bg-yellow-50 border-l-4 border-yellow-400" : ""
                    } ${
                      index === borderIndex
                        ? "border-b-4 border-[#00bfff]" // Pembatas kualifikasi
                        : ""
                    }`}
                  >
                    {/* Mobile Layout */}
                    <div className="flex items-center space-x-4 md:hidden">
                      {/* Rank */}
                      <div className="flex-shrink-0">
                        {index < 3 ? (
                          <div className="w-8 h-8 flex items-center justify-center">
                            <span className="text-xl">
                              {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-600 font-bold w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                            {user.rank}
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0"
                        style={{
                          borderColor: TIER_COLORS[user.tier] || "#eee",
                        }}
                      >
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.username}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Image
                            src="/images/avatar_default.jpg"
                            alt="Default Avatar"
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* User Info - Mobile */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0 mr-2">
                            <h3 className="font-medium text-gray-800 text-sm truncate max-w-[120px] md:max-w-none">
                              {user.username}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="px-2 py-0.5 rounded text-xs font-bold"
                                style={{
                                  background: TIER_COLORS[user.tier] || "#eee",
                                  color: "#333",
                                }}
                              >
                                {user.tier}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-[#ffbb00] text-sm">
                              {user.total_xp?.toLocaleString() || 0}
                            </div>
                            <div className="text-xs text-gray-500">XP</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center justify-between">
                      <div className="flex items-center gap-6 flex-1 min-w-0">
                        {/* Rank */}
                        <div className="flex-shrink-0 w-12 flex justify-center">
                          {index < 3 ? (
                            <div className="w-8 h-8 flex items-center justify-center">
                              <span className="text-xl">
                                {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-600 font-bold w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                              {user.rank}
                            </span>
                          )}
                        </div>

                        {/* Avatar */}
                        <div
                          className="w-12 h-12 rounded-full overflow-hidden border-2 flex-shrink-0"
                          style={{
                            borderColor: TIER_COLORS[user.tier] || "#eee",
                          }}
                        >
                          {user.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.username}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image
                              src="/images/avatar_default.jpg"
                              alt="Default Avatar"
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        {/* User Info - Desktop */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <span className="font-medium text-gray-800 text-base truncate max-w-[200px] lg:max-w-[300px]">
                            {user.username}
                          </span>
                          <span
                            className="px-3 py-1 rounded text-xs font-bold flex-shrink-0"
                            style={{
                              background: TIER_COLORS[user.tier] || "#eee",
                              color: "#333",
                            }}
                          >
                            {user.tier}
                          </span>
                        </div>
                      </div>

                      {/* XP - Desktop */}
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-[#ffbb00] text-lg">
                          {user.total_xp?.toLocaleString() || 0}
                        </div>
                        <div className="text-xs text-gray-500">XP</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Info */}
              {filteredLeaderboard.length > 0 && (
                <div className="px-4 py-3 md:px-6 md:py-4 bg-blue-50 text-center border-t border-blue-100">
                  <div className="text-xs md:text-sm text-[#00bfff]">
                    <span className="font-semibold">Garis biru</span> menandakan batas kualifikasi tier {activeTier}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}