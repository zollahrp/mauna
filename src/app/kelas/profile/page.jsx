"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Phone, Edit3, Clock, X } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({});
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Sesi login berakhir. Silakan masuk kembali.");
      router.push("/auth/login");
      return;
    }

    const savedProfile = localStorage.getItem("ProfileInfo");
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setUser(parsed.user || parsed);
      setLoading(false);
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/auth/profile");
        if (res.data?.data) {
          setUser(res.data.data);
          localStorage.setItem(
            "ProfileInfo",
            JSON.stringify({
              AccessToken: token,
              user: res.data.data,
            })
          );
        }
      } catch (error) {
        if (error.message === "Network Error") return;
        const status = error.response?.status;
        if (status === 401) {
          toast.error("Sesi kamu sudah habis, silakan login lagi.");
          localStorage.removeItem("token");
          localStorage.removeItem("ProfileInfo");
          router.push("/masuk");
        } else {
          console.warn("Gagal memuat profil dari server, gunakan cache lokal.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const getOrDash = (value) => (value && value !== "" ? value : "-");

  const handleEdit = (section) => {
    setEditingSection(section);
    setFormData({
      nama: user.nama || "",
      username: user.username || "",
      telpon: user.telpon || "",
      bio: user.bio || "",
    });
  };

  const handleSave = async () => {
    try {
      const res = await api.put("/api/auth/profile/update", formData);
      const updated = res.data?.data || { ...user, ...formData };
      setUser(updated);
      localStorage.setItem(
        "ProfileInfo",
        JSON.stringify({
          AccessToken: localStorage.getItem("token"),
          user: updated,
        })
      );
      toast.success("Profil berhasil diperbarui!");
      setEditingSection(null);
    } catch (error) {
      toast.error("Gagal memperbarui profil.");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-semibold">
        Memuat profil...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-semibold">
        Tidak ada data profil
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-poppins px-6 py-10">
      <div className="max-w-2xl mx-auto">
        {/* Avatar */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-5 mb-6">
          <div className="relative w-28 h-28 flex-shrink-0">
            <Image
              src={user.avatar || "/images/avatar_default.jpg"}
              alt="Foto Profil"
              fill
              className="object-cover rounded-full border-4 border-[#ffbb00] shadow-md"
            />
          </div>

          <div className="flex flex-col items-center md:items-start mt-3">
            <button className="bg-[#ffbb00] hover:bg-yellow-500 text-white font-semibold py-2 px-5 rounded-2xl shadow-[0_3px_0_#b45309] transition active:translate-y-0.5 cursor-pointer">
              UNGGAH FOTO KAMU
            </button>
            <p className="text-gray-500 text-xs mt-4 text-center md:text-left">
              Setidaknya 800x800 px direkomendasikan. 
            </p>
            <p className="text-gray-500 text-xs mt-1 text-center md:text-left">
              JPG atau PNG diperbolehkan.
            </p>
          </div>
        </div>

        <div className="border-t-2 border-[#ffbb00] my-8 w-full"></div>

        {/* Personal Info */}
        <div className="bg-white rounded-2xl border border-[#ffbb00]/40 p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">Informasi Personal</h2>
            <button
              onClick={() => handleEdit("personal")}
              className="flex items-center gap-1 text-sm text-[#ffbb00] hover:underline cursor-pointer"
            >
              <Edit3 size={14} /> Edit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-5 text-sm text-gray-700">
            <div>
              <p className="font-semibold text-gray-500 text-xs">Nama</p>
              <p>{getOrDash(user.nama)}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 text-xs">Username</p>
              <p>{getOrDash(user.username)}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 text-xs">Email</p>
              <p>{getOrDash(user.email)}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 text-xs">Telepon</p>
              <p>{getOrDash(user.telpon)}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 text-xs">Role</p>
              <p className="capitalize">{getOrDash(user.role)}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 text-xs">User ID</p>
              <p>{getOrDash(user.unique_id)}</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white rounded-2xl border border-[#ffbb00]/40 p-6 mb-10 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">Bio</h2>
            <button
              onClick={() => handleEdit("bio")}
              className="flex items-center gap-1 text-sm text-[#ffbb00] hover:underline cursor-pointer"
            >
              <Edit3 size={14} /> Edit
            </button>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
            {getOrDash(user.bio) !== "-"
              ? user.bio
              : "Belum ada bio. Ceritakan sedikit tentang dirimu di sini!"}
          </p>
        </div>

        {/* Status Info */}
        <div className="bg-white rounded-2xl border border-[#ffbb00]/40 p-6 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Status Akun</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
            <div>
              <p className="font-semibold text-gray-500 text-xs">Aktif</p>
              <p className={user.is_active ? "text-green-600" : "text-red-600"}>
                {user.is_active ? "Ya" : "Tidak"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 text-xs">Verified</p>
              <p
                className={user.is_verified ? "text-green-600" : "text-red-600"}
              >
                {user.is_verified ? "Ya" : "Tidak"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 text-xs">Terakhir Login</p>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#ffbb00]" />
                <span>
                  {new Date(user.last_login).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Edit */}
      {editingSection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">
                {editingSection === "personal"
                  ? "Edit Personal Info"
                  : "Edit Bio"}
              </h3>
              <button
                onClick={() => setEditingSection(null)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {editingSection === "personal" ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={formData.telpon}
                  onChange={(e) =>
                    setFormData({ ...formData, telpon: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            ) : (
              <textarea
                placeholder="Tulis bio kamu di sini..."
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={5}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full resize-none"
              />
            )}

            <button
              onClick={handleSave}
              className="w-full mt-5 bg-[#ffbb00] hover:bg-yellow-500 text-white font-semibold py-2 rounded-lg cursor-pointer"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
