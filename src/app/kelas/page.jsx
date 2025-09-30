"use client";

import { useState } from "react";

export default function Page() {
  const [levels] = useState([
    { id: 1, title: "Menawarkan dan menerima minuman", stars: 3, unlocked: true },
    { id: 2, title: "Memesan makanan di restoran", stars: 2, unlocked: true },
    { id: 3, title: "Berkenalan dengan orang baru", stars: 1, unlocked: true },
    { id: 4, title: "Percakapan sehari-hari", stars: 0, unlocked: true },
    { id: 5, title: "Belanja kebutuhan", stars: 0, unlocked: false },
  ]);

  // level yang aktif
  const [activeLevel, setActiveLevel] = useState(levels[0]);

  return (
    <div className="p-6 space-y-6">
      {/* Header ala Duolingo */}
      <div className="bg-[#32cd32] text-white p-6 rounded-xl flex items-center justify-between shadow-md">
        <div>
          <p className="text-sm font-semibold opacity-90">
            ← BAGIAN 1, UNIT {activeLevel.id}
          </p>
          <h2 className="text-lg font-bold mt-1">{activeLevel.title}</h2>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#2dbb2d] border border-white/30 rounded-lg font-semibold hover:bg-[#29a629] transition">
          📘 Buku Panduan
        </button>
      </div>

      {/* Grid 4 kolom */}
      <div className="grid grid-cols-4 gap-6">
        {levels.map((level) => (
          <div
            key={level.id}
            onClick={() => setActiveLevel(level)}
            className={`cursor-pointer w-24 h-24 flex flex-col items-center justify-center rounded-2xl shadow-md transition-all duration-200 hover:scale-105
              ${
                level.unlocked
                  ? "bg-gradient-to-br from-[#f0f9ff] to-[#fff8e6] border-2 border-[#ffbb00]"
                  : "bg-gray-200 border-2 border-gray-300 opacity-70"
              }`}
          >
            {/* Nomor Level */}
            <span
              className={`text-lg font-bold ${
                level.unlocked ? "text-gray-800" : "text-gray-500"
              }`}
            >
              {level.id}
            </span>

            {/* Bintang */}
            <div className="flex mt-1 space-x-1">
              {[...Array(3)].map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${
                    i < level.stars ? "text-[#ffbb00]" : "text-gray-400"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>

            {/* Lock Icon */}
            {!level.unlocked && (
              <span className="text-gray-500 text-sm mt-1">🔒</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
