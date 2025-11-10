"use client"

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import Modal from "@/components/Modal";

export default function UserAdminPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [form, setForm] = useState({ username: "", email: "", password: "", nama: "", telpon: "", role: "user" });

    useEffect(() => { fetchUsers(); }, []);

    async function fetchUsers(q = "") {
        setLoading(true);
        try {
            const res = await api.get("/api/admin/users/", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },
                params: q ? { q } : {}
            });
            setUsers(res.data?.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    function startEdit(u) {
        setEditingId(u.id);
        setForm({ username: u.username || "", email: u.email || "", password: "", nama: u.nama || "", telpon: u.telpon || "", role: u.role || "user" });
        setShowForm(true);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/admin/users/${editingId}`, form);
            } else {
                await api.post(`/admin/users/`, form);
            }
            setForm({ username: "", email: "", password: "", nama: "", telpon: "", role: "user" });
            setEditingId(null);
            setShowForm(false);
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert("Gagal menyimpan user");
        }
    }

    async function handleDelete(id) {
        if (!confirm("Hapus user ini?")) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchUsers();
        } catch (e) {
            console.error(e);
            alert("Gagal menghapus user");
        }
    }

    async function toggleActive(u) {
        try {
            // Use update endpoint to toggle is_active
            await api.put(`/admin/users/${u.id}`, { is_active: !u.is_active });
            fetchUsers();
        } catch (e) {
            console.error(e);
            alert("Gagal mengubah status user");
        }
    }

    async function updateRole(u, newRole) {
        try {
            // Try dedicated role endpoint, fallback to put
            try {
                await api.put(`/admin/users/${u.id}/role`, { role: newRole });
            } catch (_) {
                await api.put(`/admin/users/${u.id}`, { role: newRole });
            }
            fetchUsers();
        } catch (e) {
            console.error(e);
            alert("Gagal mengubah role user");
        }
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-[#ffbb00]">Manajemen User</h1>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ username: "", email: "", password: "", nama: "", telpon: "", role: "user" }); }} className="bg-[#ffbb00] text-white px-4 py-2 rounded-lg">Tambah User</button>
                </div>
            </div>

            <Modal open={showForm} onClose={() => { setShowForm(false); setEditingId(null); }} title={editingId ? "Edit User" : "Tambah User"}>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex flex-col">
                            <span className="font-medium">Username</span>
                            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required className="mt-1 p-2 border rounded" />
                        </label>
                        <label className="flex flex-col">
                            <span className="font-medium">Email</span>
                            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required type="email" className="mt-1 p-2 border rounded" />
                        </label>
                        <label className="flex flex-col">
                            <span className="font-medium">Password {editingId ? "(kosongkan jika tidak ingin mengubah)" : ""}</span>
                            <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" className="mt-1 p-2 border rounded" />
                        </label>
                        <label className="flex flex-col">
                            <span className="font-medium">Nama</span>
                            <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="mt-1 p-2 border rounded" />
                        </label>
                        <label className="flex flex-col">
                            <span className="font-medium">Telpon</span>
                            <input value={form.telpon} onChange={(e) => setForm({ ...form, telpon: e.target.value })} className="mt-1 p-2 border rounded" />
                        </label>
                        <label className="flex flex-col">
                            <span className="font-medium">Role</span>
                            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="mt-1 p-2 border rounded">
                                <option value="user">User</option>
                                <option value="moderator">Moderator</option>
                                <option value="admin">Admin</option>
                            </select>
                        </label>
                    </div>
                    <div className="flex gap-2 justify-end mt-3">
                        <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 rounded border">Batal</button>
                        <button type="submit" className="px-4 py-2 rounded bg-[#ffbb00] text-white">Simpan</button>
                    </div>
                </form>
            </Modal>

            <div className="bg-white rounded-lg shadow overflow-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="px-4 py-3 border-b">#</th>
                            <th className="px-4 py-3 border-b">Username</th>
                            <th className="px-4 py-3 border-b">Email</th>
                            <th className="px-4 py-3 border-b">Role</th>
                            <th className="px-4 py-3 border-b">Status</th>
                            <th className="px-4 py-3 border-b">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={6} className="p-4">Loading...</td></tr>}
                        {!loading && users.length === 0 && <tr><td colSpan={6} className="p-4">Tidak ada data</td></tr>}
                        {users.map((u, idx) => (
                            <tr key={u.id} className="odd:bg-gray-50">
                                <td className="px-4 py-3 border-b">{idx + 1}</td>
                                <td className="px-4 py-3 border-b">{u.username}</td>
                                <td className="px-4 py-3 border-b">{u.email}</td>
                                <td className="px-4 py-3 border-b">
                                    <select value={u.role} onChange={(e) => updateRole(u, e.target.value)} className="p-1 border rounded">
                                        <option value="user">User</option>
                                        <option value="moderator">Moderator</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="px-4 py-3 border-b">{u.is_active ? <span className="text-green-600 font-semibold">Active</span> : <span className="text-gray-500">Inactive</span>}</td>
                                <td className="px-4 py-3 border-b">
                                    <div className="flex gap-2">
                                        <button onClick={() => startEdit(u)} className="px-3 py-1 rounded border">Edit</button>
                                        <button onClick={() => toggleActive(u)} className="px-3 py-1 rounded bg-yellow-500">Toggle</button>
                                        <button onClick={() => handleDelete(u.id)} className="px-3 py-1 rounded bg-red-600 text-white">Hapus</button>
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
