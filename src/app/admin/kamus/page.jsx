"use client"

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import Modal from "@/components/Modal";

export default function KamusAdminPage() {
  const [kamus, setKamus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ word_text: "", definition: "", category: "alphabet", image_url_ref: "", video_url: "" });

  useEffect(() => {
    fetchKamus();
  }, []);

  async function fetchKamus() {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/kamus/");
      setKamus(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(k) {
    setEditingId(k.id);
    setForm({
      word_text: k.word_text || "",
      definition: k.definition || "",
      category: k.category || "alphabet",
      image_url_ref: k.image_url_ref || "",
      video_url: k.video_url || ""
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/admin/kamus/${editingId}`, form);
      } else {
        await api.post(`/api/admin/kamus/`, form);
      }
      setForm({ word_text: "", definition: "", category: "alphabet", image_url_ref: "", video_url: "" });
      setEditingId(null);
      setShowForm(false);
      fetchKamus();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan kamus");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Hapus kamus ini?")) return;
    try {
      await api.delete(`/admin/kamus/${id}`);
      fetchKamus();
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus kamus");
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#ffbb00]">Manajemen Kamus</h1>
        <div>
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ word_text: "", definition: "", category: "alphabet", image_url_ref: "", video_url: "" }); }} className="bg-[#ffbb00] text-white px-4 py-2 rounded-lg">Tambah Kamus</button>
        </div>
      </div>

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditingId(null); }} title={editingId ? "Edit Kamus" : "Tambah Kamus"}>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-3">
            <label className="flex flex-col">
              <span className="font-medium">Kata</span>
              <input value={form.word_text} onChange={(e) => setForm({ ...form, word_text: e.target.value })} required className="mt-1 p-2 border rounded" />
            </label>

            <label className="flex flex-col">
              <span className="font-medium">Definisi</span>
              <textarea value={form.definition} onChange={(e) => setForm({ ...form, definition: e.target.value })} required className="mt-1 p-2 border rounded" />
            </label>

            <label className="flex flex-col">
              <span className="font-medium">Kategori</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 p-2 border rounded">
                <option value="alphabet">Alphabet</option>
                <option value="numbers">Numbers</option>
                <option value="imbuhan">Imbuhan</option>
              </select>
            </label>

            <label className="flex flex-col">
              <span className="font-medium">Image URL (ref)</span>
              <input value={form.image_url_ref} onChange={(e) => setForm({ ...form, image_url_ref: e.target.value })} className="mt-1 p-2 border rounded" />
            </label>

            <label className="flex flex-col">
              <span className="font-medium">Video URL (opsional)</span>
              <input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} className="mt-1 p-2 border rounded" />
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
              <th className="px-4 py-3 border-b font-medium">Kata</th>
              <th className="px-4 py-3 border-b font-medium">Kategori</th>
              <th className="px-4 py-3 border-b font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4} className="p-4">Loading...</td></tr>}
            {!loading && kamus.length === 0 && <tr><td colSpan={4} className="p-4">Tidak ada data</td></tr>}
            {kamus.map((k, idx) => (
              <tr key={k.id} className="odd:bg-gray-50">
                <td className="px-4 py-3 border-b">{idx + 1}</td>
                <td className="px-4 py-3 border-b">{k.word_text}</td>
                <td className="px-4 py-3 border-b">{k.category_display || k.category}</td>
                <td className="px-4 py-3 border-b">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(k)} className="px-3 py-1 rounded border">Edit</button>
                    <button onClick={() => handleDelete(k.id)} className="px-3 py-1 rounded bg-red-600 text-white">Hapus</button>
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
