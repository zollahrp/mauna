"use client"

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import { usePagination } from "@/components/hooks/paginationHooks";
import { Edit2, Trash2, Plus, Search, Image, Video } from "lucide-react";

export default function KamusAdminPage() {
  const [kamus, setKamus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({ 
    word_text: "", 
    definition: "", 
    category: "alphabet", 
    image_url_ref: "", 
    video_url: "" 
  });

  // Filter data berdasarkan search
  const filteredKamus = kamus.filter(k => 
    k.word_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.definition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination hook
  const {
    currentData: paginatedKamus,
    currentPage,
    totalPages,
    totalItems,
    goToPage
  } = usePagination(filteredKamus, 10);

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

  function startAdd() {
    setEditingId(null);
    setForm({ 
      word_text: "", 
      definition: "", 
      category: "alphabet", 
      image_url_ref: "", 
      video_url: "" 
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

  const getCategoryColor = (category) => {
    switch (category) {
      case 'alphabet': return 'bg-blue-100 text-blue-800';
      case 'numbers': return 'bg-green-100 text-green-800';
      case 'imbuhan': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'alphabet': return 'Alphabet';
      case 'numbers': return 'Angka';
      case 'imbuhan': return 'Imbuhan';
      default: return category;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manajemen Kamus</h1>
              <p className="text-gray-600 mt-1">Kelola kata-kata dalam kamus sistem pembelajaran</p>
            </div>
            <button 
              onClick={startAdd}
              className="inline-flex items-center gap-2 bg-[#ffbb00] hover:bg-yellow-500 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus size={20} />
              Tambah Kamus
            </button>
          </div>
        </div>

        {/* Search & Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari kata, definisi, atau kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffbb00] focus:border-transparent"
              />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span>Total: {kamus.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span>Ditampilkan: {filteredKamus.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Form */}
        <Modal 
          open={showForm} 
          onClose={() => { setShowForm(false); setEditingId(null); }} 
          title={editingId ? "Edit Kamus" : "Tambah Kamus Baru"}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Kata */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kata <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  value={form.word_text} 
                  onChange={(e) => setForm({ ...form, word_text: e.target.value })} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffbb00] focus:border-transparent"
                  placeholder="Masukkan kata"
                />
              </div>

              {/* Definisi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Definisi <span className="text-red-500">*</span>
                </label>
                <textarea 
                  value={form.definition} 
                  onChange={(e) => setForm({ ...form, definition: e.target.value })} 
                  required 
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffbb00] focus:border-transparent resize-none"
                  placeholder="Masukkan definisi kata"
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select 
                  value={form.category} 
                  onChange={(e) => setForm({ ...form, category: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffbb00] focus:border-transparent"
                >
                  <option value="alphabet">Alphabet</option>
                  <option value="numbers">Angka</option>
                  <option value="imbuhan">Imbuhan</option>
                </select>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Image size={16} />
                    URL Gambar (Referensi)
                  </div>
                </label>
                <input 
                  type="url"
                  value={form.image_url_ref} 
                  onChange={(e) => setForm({ ...form, image_url_ref: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffbb00] focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Video size={16} />
                    URL Video (Opsional)
                  </div>
                </label>
                <input 
                  type="url"
                  value={form.video_url} 
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffbb00] focus:border-transparent"
                  placeholder="https://example.com/video.mp4"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
              <button 
                type="button" 
                onClick={() => { setShowForm(false); setEditingId(null); }} 
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="px-6 py-3 bg-[#ffbb00] hover:bg-yellow-500 text-white rounded-lg transition-colors font-medium shadow-sm"
              >
                {editingId ? "Perbarui" : "Simpan"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-16">#</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Kata</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Definisi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Kategori</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Media</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-3 text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ffbb00]"></div>
                        <span>Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                )}
                
                {!loading && filteredKamus.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <div className="text-4xl mb-3">📚</div>
                        <div className="text-lg font-medium mb-1">Tidak ada data kamus</div>
                        <div className="text-sm">
                          {searchTerm ? "Coba ubah kata kunci pencarian" : "Mulai dengan menambah kata baru"}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                
                {!loading && paginatedKamus.map((k, idx) => (
                  <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {(currentPage - 1) * 10 + idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{k.word_text}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {k.definition}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(k.category)}`}>
                        {getCategoryLabel(k.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {k.image_url_ref && (
                          <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            <Image size={12} />
                            <span>Gambar</span>
                          </div>
                        )}
                        {k.video_url && (
                          <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                            <Video size={12} />
                            <span>Video</span>
                          </div>
                        )}
                        {!k.image_url_ref && !k.video_url && (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => startEdit(k)} 
                          className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(k.id)} 
                          className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredKamus.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={10}
                onPageChange={goToPage}
                showPageInfo={true}
                maxVisiblePages={5}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}