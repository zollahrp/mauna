"use client";

import { useState } from "react";
import Image from "next/image";

export default function LeaderboardPage() {
  // simulasi jumlah pelajaran yang sudah diselesaikan user
  const [lessonsCompleted, setLessonsCompleted] = useState(1);
  const requiredLessons = 10;

  const isUnlocked = lessonsCompleted >= requiredLessons;

  // data dummy leaderboard
  const leaderboard = [
    { id: 1, name: "Zolla", xp: 1280, avatar: "/avatars/1.png" },
    { id: 2, name: "Alya", xp: 990, avatar: "/avatars/2.png" },
    { id: 3, name: "Rafi", xp: 870, avatar: "/avatars/3.png" },
    { id: 4, name: "Dimas", xp: 820, avatar: "/avatars/4.png" },
    { id: 5, name: "Citra", xp: 790, avatar: "/avatars/5.png" },
    { id: 6, name: "Lina", xp: 760, avatar: "/avatars/6.png" },
    { id: 7, name: "Rara", xp: 740, avatar: "/avatars/7.png" },
    { id: 8, name: "Bima", xp: 700, avatar: "/avatars/8.png" },
    { id: 9, name: "Tono", xp: 650, avatar: "/avatars/9.png" },
    { id: 10, name: "Nina", xp: 610, avatar: "/avatars/10.png" },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-16">
      {!isUnlocked ? (
        <>
          <div className="flex flex-col items-center text-center max-w-md">
            <Image
              src="/icons/score.png"
              alt="Score Icon"
              width={100}
              height={100}
            />
            <h2 className="text-2xl font-bold text-gray-800 mt-4">
              Buka Papan Skor!
            </h2>
            <p className="text-gray-600 mt-2">
              Selesaikan{" "}
              <span className="text-[#ffbb00] font-semibold">
                {requiredLessons - lessonsCompleted} pelajaran lagi
              </span>{" "}
              untuk mulai berkompetisi
            </p>
            <button
              onClick={() => setLessonsCompleted(lessonsCompleted + 1)}
              className="mt-6 bg-[#ffbb00] hover:bg-yellow-500 text-white font-semibold px-6 py-3 rounded-xl shadow transition cursor-pointer"
            >
              MULAI PELAJARAN
            </button>
          </div>

          {/* efek blur leaderboard dummy */}
          <div className="mt-16 w-full max-w-xl opacity-40 blur-sm select-none">
            {leaderboard.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border-b border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="w-24 h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="w-10 h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Papan Skor Mingguan 🏆
          </h2>
          <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-xl">
            {leaderboard.map((user, index) => (
              <div
                key={user.id}
                className="flex items-center justify-between py-3 border-b last:border-none border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <span className="text-gray-600 font-semibold w-5 text-center">
                    {index + 1}
                  </span>
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <span className="font-medium text-gray-800">{user.name}</span>
                </div>
                <span className="font-semibold text-[#ffbb00]">
                  {user.xp} XP
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
