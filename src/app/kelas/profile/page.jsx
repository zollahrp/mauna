"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    User,
    Mail,
    ShieldCheck,
    Phone,
    Award,
    CheckCircle2,
    Calendar,
    Clock,
    Edit3,
} from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Sesi login berakhir. Silakan masuk kembali.");
            router.push("/masuk");
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

    const getOrDash = (value) => (value && value !== "" ? value : "-");

    return (
        <div className="min-h-screen bg-white font-poppins px-6 py-10">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-extrabold text-gray-800">Profil Pengguna</h1>

                <button
                    onClick={() => router.push("/kelas/profile/edit")}
                    className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-xl transition-colors shadow"
                >
                    <Edit3 size={18} />
                    Edit Profil
                </button>
            </div>

            {/* Card Profil */}
            <div className="bg-[#f8fafc] rounded-3xl shadow-md p-6 flex flex-col md:flex-row items-center gap-6 border border-gray-200">
                <div className="relative w-32 h-32">
                    <Image
                        src={user.avatar || "/images/avatar_default.png"}
                        alt="User Avatar"
                        fill
                        className="object-cover rounded-full border-4 border-yellow-400"
                    />
                    {user.is_verified && (
                        <div className="absolute bottom-2 right-2 bg-yellow-400 rounded-full p-1">
                            <CheckCircle2 size={18} className="text-white" />
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-2">
                    <h2 className="text-xl font-bold text-gray-800">{getOrDash(user.nama)}</h2>
                    <p className="text-gray-600">@{getOrDash(user.username)}</p>
                    <p className="text-sm text-gray-500">{getOrDash(user.bio)}</p>

                    <div className="mt-3 space-y-1 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                            <Mail size={16} className="text-yellow-500" />
                            <span>{getOrDash(user.email)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone size={16} className="text-yellow-500" />
                            <span>{getOrDash(user.telpon)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-yellow-500" />
                            <span>{getOrDash(user.role)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistik */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl text-center">
                    <Award className="mx-auto text-yellow-500" size={28} />
                    <h3 className="font-bold text-lg mt-1">{getOrDash(user.total_badges)}</h3>
                    <p className="text-gray-600 text-sm">Lencana Diperoleh</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-center">
                    <User className="mx-auto text-blue-500" size={28} />
                    <h3 className="font-bold text-lg mt-1">{getOrDash(user.role)}</h3>
                    <p className="text-gray-600 text-sm">Peran Pengguna</p>
                </div>

                <div className="bg-green-50 border border-green-200 p-4 rounded-2xl text-center">
                    <CheckCircle2 className="mx-auto text-green-500" size={28} />
                    <h3 className="font-bold text-lg mt-1">
                        {user.is_active ? "Aktif" : "Tidak Aktif"}
                    </h3>
                    <p className="text-gray-600 text-sm">Status Akun</p>
                </div>
            </div>

            {/* Info tambahan */}
            <div className="mt-10 text-sm text-gray-500 space-y-1">
                <p>
                    <strong>ID:</strong> {getOrDash(user.unique_id)}
                </p>
                <p className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>
                        <strong>Dibuat:</strong>{" "}
                        {user.created_at
                            ? new Date(user.created_at).toLocaleString("id-ID")
                            : "-"}
                    </span>
                </p>
                <p className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>
                        <strong>Diperbarui:</strong>{" "}
                        {user.updated_at
                            ? new Date(user.updated_at).toLocaleString("id-ID")
                            : "-"}
                    </span>
                </p>
                <p className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>
                        <strong>Login Terakhir:</strong>{" "}
                        {user.last_login
                            ? new Date(user.last_login).toLocaleString("id-ID")
                            : "-"}
                    </span>
                </p>
            </div>
        </div>
    );
}
