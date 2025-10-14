"use client"

export default function AdminDashboard() {
  // Dummy data, ganti dengan data asli dari API jika perlu
  const stats = [
    { label: "Total User", value: 120 },
    { label: "Total Kamus", value: 340 },
    { label: "Total Soal", value: 87 },
    { label: "Total Item Toko", value: 12 },
    { label: "Soal Terjawab Hari Ini", value: 56 },
  ];

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6 text-[#00bfff]">Admin Dashboard</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b font-semibold">Kategori</th>
              <th className="py-2 px-4 border-b font-semibold">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat) => (
              <tr key={stat.label}>
                <td className="py-2 px-4 border-b">{stat.label}</td>
                <td className="py-2 px-4 border-b font-bold text-[#00bfff]">{stat.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}