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
        <div className="max-w-3xl mx-auto text-black py-8 px-2 sm:px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold">Toko</h1>
                <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-semibold">XP Kamu:</span>
                    {profileLoading ? (
                        <span className="text-gray-400">Memuat...</span>
                    ) : (
                        <span className="text-[#ffbb00] font-bold text-lg sm:text-xl">🪙 {xp}</span>
                    )}
                </div>
            </div>
            {message && (
                <div
                    className={`mb-4 px-4 py-2 rounded text-sm sm:text-base ${message.type === "success"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                >
                    {message.text}
                </div>
            )}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Memuat item...</div>
            ) : items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Belum ada item di toko.</div>
            ) : (
                <div className="space-y-5">
                    {items.map((item) => {
                        let iconSrc = `/icons/${item.icon}`;
                        if (item.item_type === "streak_freeze") iconSrc = "/icons/freeze.png";
                        else if (item.item_type === "badge") iconSrc = "/icons/emas.png";
                        else if (item.item_type === "boost") iconSrc = "/icons/boost.png";

                        return (
                            <div
                                key={item.id}
                                className="flex flex-col sm:flex-row items-center sm:items-stretch border rounded-xl bg-white shadow hover:shadow-lg transition px-3 sm:px-6 py-4 gap-3 sm:gap-6"
                            >
                                <div className="flex justify-center items-center w-full sm:w-auto">
                                    <Image
                                        src={iconSrc}
                                        alt={item.name}
                                        width={64}
                                        height={64}
                                        className="rounded mb-2 sm:mb-0 sm:mr-6"
                                    />
                                </div>
                                <div className="flex-1 w-full text-center sm:text-left">
                                    <div className="font-semibold text-lg sm:text-xl mb-1">{item.name}</div>
                                    <div className="text-gray-600 text-xs sm:text-sm mb-2">{item.description}</div>
                                </div>
                                <div className="flex flex-col items-center sm:items-end min-w-[120px] w-full sm:w-auto">
                                    <div className="font-bold text-[#ffbb00] mb-2 text-base sm:text-lg">🪙 {item.xp_cost} XP</div>
                                    <button
                                        onClick={() => handleBuy(item.id, item.xp_cost)}
                                        disabled={buying === item.id || xp < item.xp_cost}
                                        className={`w-full sm:w-auto px-4 py-2 rounded-lg bg-[#ffbb00] text-white font-semibold hover:bg-yellow-500 transition ${buying === item.id ? "opacity-60 cursor-not-allowed" : ""
                                            } ${xp < item.xp_cost ? "opacity-50 cursor-not-allowed" : ""}`}
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