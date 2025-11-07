"use client";

import React, { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/axios"; 
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [form, setForm] = useState({
    identifier: "", // email atau username
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.identifier || !form.password) {
      toast.error("Harap isi semua kolom!", { duration: 3000 });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/api/auth/login`, {
        email_or_username: form.identifier,
        password: form.password,
      });

      console.log("Login response:", res.data);

      if (res.data.success) {
        toast.success("Kamu berhasil masuk, selamat belajar...", { duration: 3000 });

        const token = res.data.access_token;

        // Simpan ke localStorage dengan format yang benar
        localStorage.setItem("token", token);
        localStorage.setItem(
          "ProfileInfo",
          JSON.stringify({
            AccessToken: token,
            user: res.data.data,
          })
        );

        // Arahkan ke halaman kelas
        setTimeout(() => router.push("/kelas"), 1200);
      } else {
        toast.error(res.data.message || "Login gagal. Coba lagi.", { duration: 4000 });
      }
    } catch (err) {
      console.error("Login error:", err.response?.data);
      toast.error(err.response?.data?.message || "Terjadi kesalahan server.", { duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    toast.success("Masuk sebagai Guest berhasil!", { duration: 2000 });
    
    // Redirect ke halaman kelas
    setTimeout(() => router.push("/kelas"), 1000);
  };

  return (
    <div className="min-h-screen relative bg-white font-poppins flex flex-col items-center justify-center px-4">
      {/* Header absolute */}
      <div className="absolute top-8 left-6 right-10 flex items-center justify-between">
        {/* Back Button */}
        <Link
          href="/"
          className="flex items-center text-gray-400 hover:text-yellow-500 transition"
        >
          <ArrowLeft size={24} />
        </Link>

        {/* Daftar Button */}
        <Link
          href="/auth/register"
          className="bg-white border border-gray-300 hover:bg-gray-50 text-yellow-500 font-semibold px-5 py-2 rounded-2xl shadow-[0_3px_0_#d1d5db] transition active:translate-y-0.5 text-center cursor-pointer"
        >
          DAFTAR
        </Link>
      </div>

      {/* Title */}
      <h2 className="text-center text-xl md:text-2xl font-extrabold text-gray-800 mb-8 mt-10">
        Masuk
      </h2>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-3"
      >
        {/* Email or Username */}
        <input
          type="text"
          name="identifier"
          placeholder="Email atau Username"
          value={form.identifier}
          onChange={handleChange}
          className="w-full p-3 bg-gray-100 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-semibold text-base"
          required
        />

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Kata sandi"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 bg-gray-100 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-semibold text-base pr-10"
            required
          />
          <span
            className="absolute inset-y-0 right-3 flex items-center text-yellow-500 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        {/* Forgot Password Link */}
        <Link 
          href="/auth/forgot-password" 
          className="text-sm text-yellow-500 font-medium hover:underline self-start -mt-1 mb-2"
        >
          Lupa kata sandi?
        </Link>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-2xl shadow-[0_3px_0_#b45309] transition active:translate-y-0.5 cursor-pointer"
        >
          {loading ? "MEMPROSES..." : "MASUK"}
        </button>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-sm text-gray-500 font-medium">atau</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Guest Login Button */}
        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-2xl shadow-[0_3px_0_#9ca3af] transition active:translate-y-0.5 cursor-pointer border border-gray-300"
        >
          MASUK SEBAGAI GUEST
        </button>
      </form>

      {/* Bottom text */}
      <p className="mt-6 text-[11px] text-gray-500 text-center max-w-sm leading-relaxed">
        Dengan masuk ke <span className="font-bold">MAUNA</span>, kamu menyetujui{" "}
        <a href="#" className="text-yellow-500 font-medium hover:underline">
          Ketentuan
        </a>{" "}
        dan{" "}
        <a href="#" className="text-yellow-500 font-medium hover:underline">
          Kebijakan Privasi
        </a>{" "}
        kami.
        <br /> <br />
        Situs ini dilindungi oleh reCAPTCHA Enterprise, dan{" "}
        <a href="#" className="text-yellow-500 font-medium hover:underline">
          Kebijakan Privasi
        </a>{" "}
        serta{" "}
        <a href="#" className="text-yellow-500 font-medium hover:underline">
          Ketentuan Layanan
        </a>{" "}
        Google berlaku.
      </p>
    </div>
  );
}