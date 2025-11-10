"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import Modal from "@/components/Modal";

export default function SoalAdminPage() {
	const [soal, setSoal] = useState([]);
	const [sublevels, setSublevels] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showForm, setShowForm] = useState(false);
	const [form, setForm] = useState({ pertanyaan: "", jawaban_benar: "", dictionary_id: "", sublevel_id: "", video_url: "" });
	const [editingId, setEditingId] = useState(null);

	useEffect(() => {
		fetchAll();
	}, []);
	async function fetchAll() {
		setLoading(true);
		try {
			const [soalRes, subRes] = await Promise.all([api.get("/api/admin/soal/list"), api.get("/api/admin/sublevels/")]);
			setSoal(soalRes.data?.data || []);
			setSublevels(subRes.data?.data || []);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}

	async function handleSubmit(e) {
		e.preventDefault();
		try {
			const payload = { ...form, sublevel_id: Number(form.sublevel_id), dictionary_id: form.dictionary_id ? Number(form.dictionary_id) : null };
			if (editingId) {
				await api.patch(`/api/admin/soal/${editingId}`, payload);
			} else {
				await api.post(`/api/admin/soal/create`, payload);
			}
			setForm({ pertanyaan: "", jawaban_benar: "", dictionary_id: "", sublevel_id: "", video_url: "" });
			setShowForm(false);
			setEditingId(null);
			fetchAll();
		} catch (err) {
			console.error(err);
			alert("Gagal menyimpan soal");
		}
	}

	function startEdit(s) {
		setEditingId(s.id);
		setForm({ pertanyaan: s.pertanyaan || "", jawaban_benar: s.jawaban_benar || "", dictionary_id: s.dictionary_id || "", sublevel_id: s.sublevel_id || "", video_url: s.video_url || "" });
		setShowForm(true);
	}

	async function handleDelete(id) {
		if (!confirm("Hapus soal ini?")) return;
		try {
			await api.delete(`/admin/soal/${id}`);
			fetchAll();
		} catch (e) {
			console.error(e);
			alert("Gagal menghapus soal");
		}
	}

	return (
		<div className="max-w-4xl mx-auto">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-bold text-[#ffbb00]">Manajemen Soal</h1>
					<div>
						<button onClick={() => { setShowForm(true); setEditingId(null); setForm({ pertanyaan: "", jawaban_benar: "", dictionary_id: "", sublevel_id: "", video_url: "" }); }} className="bg-[#ffbb00] text-white px-4 py-2 rounded-lg">Tambah Soal</button>
					</div>
				</div>

				<Modal open={showForm} onClose={() => { setShowForm(false); setEditingId(null); }} title={editingId ? "Edit Soal" : "Tambah Soal"}>
					<form onSubmit={handleSubmit}>
						<div className="grid grid-cols-1 gap-3">
							<label className="flex flex-col">
								<span className="font-medium">Pertanyaan</span>
								<textarea value={form.pertanyaan} onChange={(e) => setForm({ ...form, pertanyaan: e.target.value })} required className="mt-1 p-2 border rounded" />
							</label>
							<label className="flex flex-col">
								<span className="font-medium">Jawaban Benar</span>
								<input value={form.jawaban_benar} onChange={(e) => setForm({ ...form, jawaban_benar: e.target.value })} required className="mt-1 p-2 border rounded" />
							</label>
							<label className="flex flex-col">
								<span className="font-medium">SubLevel</span>
								<select value={form.sublevel_id} onChange={(e) => setForm({ ...form, sublevel_id: e.target.value })} required className="mt-1 p-2 border rounded">
									<option value="">-- pilih sublevel --</option>
									{sublevels.map((s) => <option key={s.id} value={s.id}>{s.name} {s.level_name ? `(${s.level_name})` : ''}</option>)}
								</select>
							</label>
							<label className="flex flex-col">
								<span className="font-medium">Dictionary ID (opsional)</span>
								<input value={form.dictionary_id} onChange={(e) => setForm({ ...form, dictionary_id: e.target.value })} className="mt-1 p-2 border rounded" />
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
							<th className="px-4 py-3 border-b font-medium">Pertanyaan</th>
							<th className="px-4 py-3 border-b font-medium">SubLevel</th>
							<th className="px-4 py-3 border-b font-medium">Aksi</th>
						</tr>
					</thead>
					<tbody>
						{loading && <tr><td colSpan={4} className="p-4">Loading...</td></tr>}
						{!loading && soal.length === 0 && <tr><td colSpan={4} className="p-4">Tidak ada data</td></tr>}
						{soal.map((s, idx) => (
							<tr key={s.id} className="odd:bg-gray-50">
								<td className="px-4 py-3 border-b">{idx + 1}</td>
								<td className="px-4 py-3 border-b">{s.pertanyaan}</td>
								<td className="px-4 py-3 border-b">{s.sublevel_name || s.sublevel?.name || "-"}</td>
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

