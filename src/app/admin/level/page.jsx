"use client"

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import Modal from "@/components/Modal";

export default function LevelAdminPage() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", tujuan: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchLevels();
  }, []);

  async function fetchLevels() {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/levels/");
      setLevels(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      let res;
      if (editingId) {
        res = await api.put(`/api/admin/levels/${editingId}`, form);
      } else {
        res = await api.post(`/api/admin/levels/`, form);
      }
      setForm({ name: "", description: "", tujuan: "" });
      setShowForm(false);
      setEditingId(null);
      fetchLevels();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan level");
    }
  }

  function startEdit(l) {
    setEditingId(l.id);
    setForm({ name: l.name || "", description: l.description || "", tujuan: l.tujuan || "" });
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!confirm("Hapus level ini?")) return;
    try {
      const res = await api.delete(`/api/admin/levels/${id}`);
      fetchLevels();
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus level");
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#ffbb00]">Manajemen Level</h1>
        <div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", description: "", tujuan: "" }); }}
            className="bg-[#ffbb00] text-white px-4 py-2 rounded-lg"
          >
            Tambah Level
          </button>
        </div>
      </div>

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditingId(null); }} title={editingId ? "Edit Level" : "Tambah Level"}>
        <form onSubmit={(e) => { handleSubmit(e); }}>
          <div className="grid grid-cols-1 gap-3">
            <label className="flex flex-col">
              <span className="font-medium">Nama</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-1 p-2 border rounded" />
            </label>
            <label className="flex flex-col">
              <span className="font-medium">Deskripsi</span>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 p-2 border rounded" />
            </label>
            <label className="flex flex-col">
              <span className="font-medium">Tujuan</span>
              <input value={form.tujuan} onChange={(e) => setForm({ ...form, tujuan: e.target.value })} className="mt-1 p-2 border rounded" />
            </label>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 rounded border">Batal</button>
              <button type="submit" className="px-4 py-2 rounded bg-[#ffbb00] text-white">Simpan</button>
            </div>
          </div>
        </form>
      </Modal>

      <div className="bg-white rounded-lg shadow overflow-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="px-4 py-3 border-b font-medium">#</th>
              <th className="px-4 py-3 border-b font-medium">Nama</th>
              <th className="px-4 py-3 border-b font-medium">Total SubLevel</th>
              <th className="px-4 py-3 border-b font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={4} className="p-4">Loading...</td></tr>
            )}
            {!loading && levels.length === 0 && (
              <tr><td colSpan={4} className="p-4">Tidak ada data</td></tr>
            )}
            {levels.map((l, idx) => (
              <tr key={l.id} className="odd:bg-gray-50">
                <td className="px-4 py-3 border-b">{idx + 1}</td>
                <td className="px-4 py-3 border-b">{l.name}</td>
                <td className="px-4 py-3 border-b">{l.total_sublevels ?? 0}</td>
                <td className="px-4 py-3 border-b">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(l)} className="px-3 py-1 rounded border">Edit</button>
                    <button onClick={() => handleDelete(l.id)} className="px-3 py-1 rounded bg-red-600 text-white">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
