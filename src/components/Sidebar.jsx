// src/components/Sidebar.jsx
"use client";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Menu</h2>
      <ul className="space-y-4">
        <li>
          <a href="/kelas" className="hover:text-yellow-400">Kelas</a>
        </li>
        <li>
          <a href="/kelas/progress" className="hover:text-yellow-400">Progress</a>
        </li>
        <li>
          <a href="/kelas/profil" className="hover:text-yellow-400">Profil</a>
        </li>
      </ul>
    </aside>
  );
}
