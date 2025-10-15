"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import Image from "next/image";

export default function TokoPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);
  const [message, setMessage] = useState(null);
  const [xp, setXp] = useState(0);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      try {
        const res = await api.get("/api/shop/items");
        setItems(res.data?.data || []);
      } catch {
        setMessage({ type: "error", text: "Gagal memuat item." });
      }
      setLoading(false);
    }

    async function fetchProfile() {
      setProfileLoading(true);
      try {
        const res = await api.get("/api/auth/profile");
        setXp(res.data?.data?.total_xp ?? 0);
      } catch {
        setXp(0);
      }
      setProfileLoading(false);
    }

    fetchItems();
    fetchProfile();
  }, []);

  const handleBuy = async (itemId, xpCost) => {
    setBuying(itemId);
    setMessage(null);
    try {
      const res = await api.post(`/api/shop/items/${itemId}/redeem`);
      if (res.data?.success) {
        setMessage({ type: "success", text: "Berhasil membeli item!" });
        setXp((prev) => prev - xpCost);
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Gagal membeli item." });
    }
    setBuying(null);
  };

  return (
    <div className="max-w-3xl mx-auto text-black bg-white min-h-screen py-10 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Toko</h1>
        <div className="flex items-center gap-2">
          <span className="text-gray-700 font-medium">XP Kamu:</span>
          {profileLoading ? (
            <span className="text-gray-400 text-sm">Memuat...</span>
          ) : (
            <span className="text-[#ffbb00] font-semibold text-lg">
              🪙 {xp}
            </span>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Items */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Memuat item...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Belum ada item di toko.
        </div>
      ) : (
        <div className="grid gap-5">
          {items.map((item) => {
            let iconSrc = `/icons/${item.icon}`;
            if (item.item_type === "streak_freeze") iconSrc = "/icons/freeze.png";
            else if (item.item_type === "badge") iconSrc = "/icons/emas.png";
            else if (item.item_type === "boost") iconSrc = "/icons/boost.png";

            const isDisabled = buying === item.id || xp < item.xp_cost;

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-center sm:items-stretch justify-between border border-gray-200 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
              >
                {/* Icon */}
                <div className="flex justify-center items-center w-full sm:w-auto mb-3 sm:mb-0">
                  <Image
                    src={iconSrc}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="rounded-lg"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left px-0 sm:px-4">
                  <h2 className="text-lg sm:text-xl font-semibold leading-tight">
                    {item.name}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                </div>

                {/* Action */}
                <div className="flex flex-col items-center sm:items-end mt-3 sm:mt-0">
                  <div className="text-[#ffbb00] font-semibold mb-2 text-base">
                    🪙 {item.xp_cost} XP
                  </div>
                  <button
                    onClick={() => handleBuy(item.id, item.xp_cost)}
                    disabled={isDisabled}
                    className={`cursor-pointer w-full sm:w-auto px-4 py-2 rounded-lg font-medium text-sm text-white bg-[#ffbb00] hover:bg-yellow-500 transition-all ${
                      isDisabled ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    {buying === item.id
                      ? "Memproses..."
                      : xp < item.xp_cost
                      ? "XP Tidak Cukup"
                      : "Beli"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
