"use client"

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import Modal from "@/components/Modal";

export default function SubLevelAdminPage() {
  const [sublevels, setSublevels] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", tujuan: "", level_id: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([api.get("/admin/sublevels"), api.get("/admin/levels")]);
      setSublevels(a.data?.data || []);
      setLevels(b.data?.data || []);
    } catch (e) {
      console.error(e);
      alert("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/sublevels/${editingId}`, form);
      } else {
        await api.post(`/admin/sublevels`, form);
      }
      setShowForm(false);
      setEditingId(null);
      fetchAll();
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan data");
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({ name: item.name || "", description: item.description || "", tujuan: item.tujuan || "", level_id: item.level_id || item.level_id || "" });
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!confirm("Hapus sublevel ini?")) return;
    try {
      await api.delete(`/admin/sublevels/${id}`);
      fetchAll();
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus sublevel");
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#ffbb00]">Manajemen Sub Level</h1>
        <div>
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", description: "", tujuan: "", level_id: "" }); }} className="bg-[#ffbb00] text-white px-4 py-2 rounded-lg">Tambah Sub Level</button>
        </div>
      </div>

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditingId(null); }} title={editingId ? "Edit Sub Level" : "Tambah Sub Level"}>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-3">
            <label className="flex flex-col">
              <span className="font-medium">Nama</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-1 p-2 border rounded" />
            </label>
            <label className="flex flex-col">
              <span className="font-medium">Level</span>
              <select value={form.level_id} onChange={(e) => setForm({ ...form, level_id: e.target.value })} required className="mt-1 p-2 border rounded">
                <option value="">-- pilih level --</option>
                {levels.map((lv) => <option key={lv.id} value={lv.id}>{lv.name}</option>)}
              </select>
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
              <th className="px-4 py-3 border-b font-medium">Level</th>
              <th className="px-4 py-3 border-b font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4} className="p-4">Loading...</td></tr>}
            {!loading && sublevels.length === 0 && <tr><td colSpan={4} className="p-4">Tidak ada data</td></tr>}
            {sublevels.map((s, idx) => (
              <tr key={s.id} className="odd:bg-gray-50">
                <td className="px-4 py-3 border-b">{idx + 1}</td>
                <td className="px-4 py-3 border-b">{s.name}</td>
                <td className="px-4 py-3 border-b">{s.level_name || s.level?.name || "-"}</td>
                <td className="px-4 py-3 border-b">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(s)} className="px-3 py-1 rounded border">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="px-3 py-1 rounded bg-red-600 text-white">Hapus</button>
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
