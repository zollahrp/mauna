  "use client";

  import { useEffect, useState } from "react";
  import Image from "next/image";
  import api from "@/lib/axios";

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
      <div className="min-h-screen bg-white flex flex-col items-center py-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Papan Skor Mingguan 🏆
        </h2>
        <div className="mb-6 flex gap-2">
          {TIERS.map((tier) => (
            <button
              key={tier}
              className={`px-4 py-2 rounded-lg font-semibold border transition ${activeTier === tier
                  ? "bg-[#ffbb00] text-white border-[#ffbb00]"
                  : "bg-gray-100 text-gray-700 border-gray-300"
                }`}
              style={{
                boxShadow:
                  activeTier === tier
                    ? `0 2px 8px ${TIER_COLORS[tier]}33`
                    : undefined,
              }}
              onClick={() => setActiveTier(tier)}
            >
              {tier}
            </button>
          ))}
        </div>
        <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-xl">
          {loading ? (
            <div className="text-center text-gray-400 py-10">Memuat data...</div>
          ) : filteredLeaderboard.length === 0 ? (
            <div className="text-center text-gray-400 py-10">Tidak ada data.</div>
          ) : (
            filteredLeaderboard.map((user, index) => (
              <div
                key={user.user_id}
                className={`flex items-center justify-between py-3 border-b last:border-none border-gray-100 ${user.is_current_user ? "bg-yellow-50" : ""
                  } ${index === borderIndex
                    ? "border-b-4 border-[#00bfff]" // Pembatas kualifikasi
                    : ""
                  }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-gray-600 font-semibold w-5 text-center">
                    {user.rank}
                  </span>
                  <div
                    className="w-10 h-10 rounded-full overflow-hidden border-2"
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
                    style={{
                      background: TIER_COLORS[user.tier] || "#eee",
                      color: "#333",
                    }}
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
          {filteredLeaderboard.length > 0 && (
            <div className="text-xs text-center text-[#00bfff] mt-2">
              <span className="font-semibold">Garis biru</span> = batas kualifikasi tier {activeTier}
            </div>
          )}
        </div>
      </div>
    );
  }