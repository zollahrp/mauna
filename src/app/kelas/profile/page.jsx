// src/app/kelas/profile/page.jsx

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Phone, Edit3, Clock, X, Upload } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import AvatarUploader from "@/components/AvatarUploader";

import { Award } from "lucide-react"; // Tambahkan icon badge

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null); // State baru untuk file avatar
  const router = useRouter();
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [userBadges, setUserBadges] = useState([]);
  const [badgesLoading, setBadgesLoading] = useState(true);

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
        console.log('data profile', res.data);
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
    if (section === "personal") {
      setFormData({
        nama: user.nama || "",
        username: user.username || "",
        telpon: user.telpon || "",
      });
    } else if (section === "bio") {
      setFormData({
        bio: user.bio || "",
      });
    }
  };

  // ✅ Fungsi baru untuk menangani perubahan file
  // Ganti handler tombol upload avatar
  const handleAvatarUploadClick = () => {
    setShowAvatarModal(true);
  };

  // Handler saat file dipilih dari AvatarUploader
  const handleAvatarSelected = (file) => {
    setAvatarFile(file);
    setShowAvatarModal(false);
    toast.success("Foto berhasil dipilih, klik Simpan untuk mengunggah!");
  };

  // Handler tutup modal
  const handleAvatarModalClose = () => {
    setShowAvatarModal(false);
  };
  // Ambil badge user dari /api/badges/my-badges
  useEffect(() => {
    const fetchUserBadges = async () => {
      try {
        const res = await api.get("/api/badges/my-badges");
        if (res.data && Array.isArray(res.data.badges)) {
          setUserBadges(res.data.badges);
        } else {
          setUserBadges([]);
        }
      } catch {
        setUserBadges([]);
      } finally {
        setBadgesLoading(false);
      }
    };
    fetchUserBadges();
  }, []);
  const validateForm = () => {
    const errors = [];

    if (editingSection === "personal") {
      if (formData.nama && formData.nama.trim().length < 2) {
        errors.push("Nama harus minimal 2 karakter");
      }
      if (formData.nama && formData.nama.trim().length > 255) {
        errors.push("Nama maksimal 255 karakter");
      }
      if (formData.username && formData.username.trim().length < 3) {
        errors.push("Username harus minimal 3 karakter");
      }
      if (formData.username && formData.username.trim().length > 50) {
        errors.push("Username maksimal 50 karakter");
      }
      if (formData.telpon && formData.telpon.trim()) {
        const cleanedTelpon = formData.telpon.replace(/\D/g, '');
        if (cleanedTelpon.length < 10 || cleanedTelpon.length > 15) {
          errors.push("Nomor telepon harus 10-15 digit");
        }
      }
    } else if (editingSection === "bio") {
      if (formData.bio && formData.bio.trim().length > 500) {
        errors.push("Bio maksimal 500 karakter");
      }
    }

    return errors;
  };

  const handleSave = async () => {
    if (isUpdating) return;

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    setIsUpdating(true);
    try {
      // ✅ Perbaikan utama: Gunakan FormData untuk mengirim data
      const formDataToSend = new FormData();

      // Tambahkan field teks yang diubah
      let hasChanges = false;
      if (editingSection === "personal") {
        if (formData.nama !== undefined && formData.nama.trim() !== (user.nama || "")) {
          formDataToSend.append('nama', formData.nama.trim());
          hasChanges = true;
        }
        if (formData.username !== undefined && formData.username.trim() !== (user.username || "")) {
          formDataToSend.append('username', formData.username.trim());
          hasChanges = true;
        }
        if (formData.telpon !== undefined && formData.telpon.trim() !== (user.telpon || "")) {
          formDataToSend.append('telpon', formData.telpon.trim());
          hasChanges = true;
        }
      } else if (editingSection === "bio") {
        if (formData.bio !== undefined && formData.bio.trim() !== (user.bio || "")) {
          formDataToSend.append('bio', formData.bio.trim());
          hasChanges = true;
        }
      }

      // ✅ Tambahkan file avatar jika ada
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
        hasChanges = true;
      }

      // Cek apakah ada perubahan atau file yang diunggah
      if (!hasChanges) {
        toast.info("Tidak ada perubahan untuk disimpan.");
        setEditingSection(null);
        setFormData({});
        setAvatarFile(null); // Reset file state
        return;
      }

      console.log("Sending FormData:", formDataToSend);

      // Axios akan otomatis mengatur header 'Content-Type' menjadi 'multipart/form-data'
      const res = await api.patch("/api/auth/profile", formDataToSend);

      console.log("Response:", res.data);

      if (res.data?.success) {
        // Update user dengan data yang diterima dari respons
        const updatedUser = { ...user, ...res.data.data };
        setUser(updatedUser);

        localStorage.setItem(
          "ProfileInfo",
          JSON.stringify({
            AccessToken: localStorage.getItem("token"),
            user: updatedUser,
          })
        );

        toast.success(res.data.message || "Profil berhasil diperbarui!");
        setEditingSection(null);
        setFormData({});
        setAvatarFile(null); // Reset file state
      } else {
        throw new Error(res.data?.message || "Response tidak valid");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      console.error("Error response:", error.response?.data);

      const errorData = error.response?.data;
      if (errorData?.detail === "No fields to update") {
        toast.info("Tidak ada perubahan yang perlu disimpan.");
        setEditingSection(null);
        setFormData({});
        setAvatarFile(null);
        return;
      } else if (errorData?.detail === "Username already taken") {
        toast.error("Username sudah digunakan. Silakan pilih username lain.");
      } else if (errorData?.detail === "Invalid phone number format") {
        toast.error("Format nomor telepon tidak valid. Harus 10-15 digit.");
      } else {
        const errorMessage = errorData?.detail || errorData?.message || "Data yang dikirim tidak valid";
        toast.error(errorMessage);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
    setFormData({});
    setAvatarFile(null); // Reset file state saat batal
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
              src={
                avatarFile
                  ? URL.createObjectURL(avatarFile)
                  : user.avatar_url
                    ? `${process.env.NEXT_PUBLIC_API_URL}${user.avatar_url}`
                    : "/images/avatar_default.jpg"
              }
              alt="Foto Profil"
              fill
              priority
              className="object-cover rounded-full border-4 border-[#ffbb00] shadow-md"
            />
          </div>

          <div className="flex flex-col items-center md:items-start mt-3">
            <button
              type="button"
              onClick={handleAvatarUploadClick}
              className="bg-[#ffbb00] hover:bg-yellow-500 text-white font-semibold py-2 px-5 rounded-2xl shadow-[0_3px_0_#b45309] transition active:translate-y-0.5 cursor-pointer flex items-center gap-2"
            >
              <Upload size={16} /> UNGGAH FOTO KAMU
            </button>
            {/* {avatarFile && (
              <p className="text-gray-600 text-xs mt-2">
                File: {avatarFile.name}
              </p>
            )} */}
            <p className="text-gray-500 text-xs mt-4 text-center md:text-left">
              Setidaknya 800x800 px direkomendasikan.
            </p>
            <p className="text-gray-500 text-xs mt-1 text-center md:text-left">
              JPG atau PNG diperbolehkan.
            </p>
          </div>
        </div>

        {/* AvatarUploader Modal */}
        {showAvatarModal && (
          <AvatarUploader
            onFileSelected={handleAvatarSelected}
            onClose={handleAvatarModalClose}
            currentAvatarUrl={
              user.avatar_url
                ? `${process.env.NEXT_PUBLIC_API_URL}${user.avatar_url}`
                : "/images/avatar_default.jpg"
            }
          />
        )}

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
        {/* BADGES USER */}
        <div className="bg-white rounded-2xl border border-[#ffbb00]/40 p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Award className="text-[#ffbb00]" size={20} />
            <h2 className="font-semibold text-gray-800">Badge Kamu</h2>
          </div>
          {badgesLoading ? (
            <div className="text-gray-400 text-center py-6">Memuat badge...</div>
          ) : userBadges.length === 0 ? (
            <div className="text-gray-400 text-center py-6">Belum punya badge.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {userBadges.map((badge) => (
                <div
                  key={badge.badge_id}
                  className={`border rounded-xl p-4 flex flex-col items-center gap-2 shadow hover:scale-105 transition-transform duration-200 cursor-pointer ${badge.level === "EASY"
                      ? "bg-green-100 text-green-700 border-green-300"
                      : badge.level === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                        : "bg-red-100 text-red-700 border-red-300"
                    }`}
                  title={badge.nama}
                >
                  <div className="text-4xl mb-1">
                    <Image src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${badge.icon}`} alt={badge.nama} width={100} height={100} />
                  </div>
                  <div className="font-bold text-base">{badge.nama}</div>
                  <div className="text-xs text-gray-600 text-center">
                    {badge.earned_at
                      ? `Didapatkan: ${new Date(badge.earned_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}`
                      : ""}
                  </div>
                  <span className="mt-2 px-2 py-0.5 rounded-full text-xs font-semibold border">
                    {badge.level.charAt(0).toUpperCase() + badge.level.slice(1).toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
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
              <p className="font-semibold text-gray-500 text-xs">Total Poin</p>
              <p
                className={user.total_xp ? "text-green-600" : "text-red-600"}
              >
                {user.total_xp || 0}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 text-xs">Terakhir Login</p>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#ffbb00]" />
                <span>
                  {user.last_login ? new Date(user.last_login).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }) : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Edit */}
      {editingSection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">
                {editingSection === "personal"
                  ? "Edit Personal Info"
                  : "Edit Bio"}
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {editingSection === "personal" ? (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Nama Lengkap
                    <span className="text-gray-400 font-normal"> (2-255 karakter)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={formData.nama || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#ffbb00]"
                    maxLength={255}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Username
                    <span className="text-gray-400 font-normal"> (3-50 karakter)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan username"
                    value={formData.username || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#ffbb00]"
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Nomor Telepon
                    <span className="text-gray-400 font-normal"> (10-15 digit)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Masukkan nomor telepon"
                    value={formData.telpon || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, telpon: e.target.value })
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#ffbb00]"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Bio
                  <span className="text-gray-400 font-normal"> (maksimal 500 karakter)</span>
                </label>
                <textarea
                  placeholder="Tulis bio kamu di sini..."
                  value={formData.bio || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={5}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full resize-none focus:outline-none focus:ring-2 focus:ring-[#ffbb00]"
                  maxLength={500}
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {(formData.bio || "").length}/500
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 rounded-lg cursor-pointer transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="flex-1 bg-[#ffbb00] hover:bg-yellow-500 text-white font-semibold py-2 rounded-lg cursor-pointer transition disabled:opacity-50"
              >
                {isUpdating ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}