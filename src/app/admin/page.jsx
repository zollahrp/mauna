"use client"

const stats = [
  { id: 1, label: "Total User", value: 1200, change: 8.4, spark: [5,8,7,10,9,12], icon: "users", desc: "Pengguna aktif bulan ini" },
  { id: 2, label: "Total Kamus", value: 340, change: -1.2, spark: [6,5,6,5,4,5], icon: "book", desc: "Entri terbaru & revisi" },
  { id: 3, label: "Total Soal", value: 87, change: 3.1, spark: [3,4,6,5,7,8], icon: "question", desc: "Soal tersedia untuk kuis" },
  { id: 4, label: "Total Item Toko", value: 12, change: 0, spark: [1,2,1,2,1,2], icon: "store", desc: "Item & voucher aktif" },
];

const recent = [
  { id: 1, user: "Ani", action: "Menjawab soal \"Sejarah\"", meta: "2 jam lalu", status: "success" },
  { id: 2, user: "Budi", action: "Menambah kamus: \"Kata Baru\"", meta: "6 jam lalu", status: "info" },
  { id: 3, user: "Citra", action: "Pembelian item: \"Tema Premium\"", meta: "1 hari lalu", status: "warning" },
  { id: 4, user: "Dedi", action: "Menghapus kamus (review)", meta: "2 hari lalu", status: "danger" },
];

function Icon({ name, className = "w-5 h-5" }) {
  if (name === "users")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
        <path d="M17 21v-2a4 4 0 00-3-3.87" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 21v-2a4 4 0 013-3.87" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 11a4 4 0 100-8 4 4 0 000 8z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  if (name === "book")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
        <path d="M3 19.5A2.5 2.5 0 015.5 17H20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 4v14a2 2 0 00-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2h13a2 2 0 012 2z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  if (name === "question")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
        <path d="M9.09 9a3 3 0 115.82 1c0 3-4 3-4 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 17h.01" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  if (name === "store")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
        <path d="M3 9l1-3h16l1 3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 9v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  if (name === "search")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
        <path d="M21 21l-4.35-4.35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="11" cy="11" r="6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M3 7h18M3 12h18M3 17h18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function Sparkline({ data = [], color = "text-yellow-400" }) {
  if (!data || data.length === 0) return null;
  const w = 120, h = 40;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const norm = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((d - min) / ((max - min) || 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={`inline-block ${color}`} aria-hidden>
      <polyline fill="none" stroke="currentColor" strokeWidth="1.8" points={norm} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({ item }) {
  const up = item.change > 0;
  const changeColor = up ? "text-green-600" : item.change < 0 ? "text-red-500" : "text-gray-400";
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 bg-gray-50 p-3 rounded-lg">
            <Icon name={item.icon} className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">{item.label}</div>
            <div className="text-xs text-gray-400">{item.desc}</div>
          </div>
        </div>
        <div className={`text-sm font-semibold ${changeColor} flex items-center gap-1`}>
          {item.change !== 0 && (
            <svg className={`w-4 h-4 ${up ? "" : "rotate-180"}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M5 10l5-5 5 5H5z" />
            </svg>
          )}
          <span>{Math.abs(item.change)}%</span>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-[#ffbb00]">{item.value.toLocaleString()}</div>
        <div className="text-right">
          <Sparkline data={item.spark} color="text-yellow-400" />
          <div className="text-xs text-gray-400 mt-1">Performa minggu ini</div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    success: "bg-green-100 text-green-700",
    info: "bg-blue-100 text-blue-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
  };
  return <span className={`text-xs font-medium px-2 py-1 rounded-full ${map[status] || "bg-gray-100 text-gray-700"}`}>{status}</span>;
}

function ProgressRow({ label, value, total = 100 }) {
  const perc = Math.round((value / total) * 100);
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-gray-600">{label}</div>
          <div className="text-xs text-gray-400">Target: {total}</div>
        </div>
        <div className="text-sm font-semibold text-[#ffbb00]">{value}/{total}</div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className="h-2 bg-yellow-400 transition-width" style={{ width: `${perc}%` }} />
      </div>
      <div className="text-xs text-gray-500 mt-2">{perc}% dari target</div>
    </div>
  );
}

export default function AdminDashboard() {
  const totalSoalTarget = 100;

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#ffbb00]">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Ringkasan cepat & aktivitas terbaru — pemantauan metrik kunci secara real-time</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-white rounded-md shadow-sm px-3 py-2 w-full md:w-80">
            <Icon name="search" className="w-4 h-4 text-gray-400" />
            <input aria-label="Cari" placeholder="Cari user, kamus, atau aktivitas..." className="ml-3 w-full text-sm outline-none" />
          </div>

          <div className="flex gap-2">
            <button className="bg-white border border-gray-200 text-sm px-3 py-2 rounded-md shadow-sm hover:bg-gray-50">Export</button>
            <button className="bg-[#ffbb00] text-white text-sm px-3 py-2 rounded-md shadow hover:brightness-95">Tambah</button>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => <StatCard key={s.id} item={s} />)}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Aktivitas Terbaru</h2>
              <div className="text-sm text-gray-500">Filter: Hari ini</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-gray-500 border-b">
                  <tr>
                    <th className="py-2">User</th>
                    <th className="py-2">Aktivitas</th>
                    <th className="py-2">Waktu</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">{r.user[0]}</div>
                          <div>
                            <div className="font-medium">{r.user}</div>
                            <div className="text-xs text-gray-400">ID#{1000 + r.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-700">{r.action}</td>
                      <td className="py-3 text-sm text-gray-500">{r.meta}</td>
                      <td className="py-3"><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              Untuk data real-time, hubungkan bagian ini ke endpoint aktivitas atau WebSocket.
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <ProgressRow label="Soal Terjawab Hari Ini" value={56} total={totalSoalTarget} />
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-gray-600">Ringkasan Toko</div>
                <div className="text-xs text-gray-400">Stok & penjualan singkat</div>
              </div>
              <div className="text-2xl font-semibold text-[#ffbb00]">12</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs">Pendapatan</div>
                <div className="font-medium">Rp 1.2M</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs">Transaksi</div>
                <div className="font-medium">124</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-2">Tips Admin</div>
            <ul className="text-xs text-gray-500 list-disc list-inside space-y-1">
              <li>Gunakan export untuk backup data berkala.</li>
              <li>Periksa aktivitas berstatus danger untuk review.</li>
              <li>Optimalkan kamus yang sering diakses.</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}