"use client";

import Image from "next/image";
import Link from "next/link";

export default function KelasLayout({ children }) {
    const isLoggedIn = false;

    return (
        <aside className="w-96 pr-10 border-l border-gray-200 bg-white p-6 flex flex-col gap-6">
            {/* Leaderboard */}
            <div className="border rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">Buka Papan Skor!</h3>
                <p className="text-sm text-gray-600">
                    Selesaikan{" "}
                    <span className="font-semibold text-[#ffbb00]">9 pelajaran lagi</span>{" "}
                    untuk mulai berkompetisi
                </p>
                <div className="mt-4">
                    <Image src="/icons/score.png" alt="Score" width={40} height={40} />
                </div>
            </div>

            {/* Misi Harian */}
            <div className="border rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-800 text-lg">Misi Harian</h3>
                    <Link
                        href="/misi"
                        className="text-sm text-[#00bfff] font-medium hover:underline"
                    >
                        Lihat semua
                    </Link>
                </div>
                <p className="text-sm text-gray-600 mb-2">Dapatkan 10 XP</p>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-[40%] bg-[#ffbb00]"></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">4 / 10</p>
            </div>

            {/* Profil / Login */}
            {!isLoggedIn && (
                <div className="border rounded-2xl p-6 shadow-sm text-center">
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
    );
}
