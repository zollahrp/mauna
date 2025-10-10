"use client";

import React, { useState } from "react";
import { Eye, EyeOff, ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    nama: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      validatePassword(value);
    }
  };

  // 🔐 Fungsi validasi password
  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8)
      errors.push("Password minimal 8 karakter");
    if (!/[A-Z]/.test(password))
      errors.push("Harus mengandung huruf besar (A-Z)");
    if (!/[a-z]/.test(password))
      errors.push("Harus mengandung huruf kecil (a-z)");
    if (!/\d/.test(password))
      errors.push("Harus mengandung angka (0-9)");

    setPasswordErrors(errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordErrors.length > 0) {
      toast.error("Periksa kembali kata sandi kamu:\n" + passwordErrors.join("\n"), {
        duration: 4000,
      });
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        username: form.username,
        email: form.email,
        password: form.password,
        nama: form.nama,
      });

      console.log("Register success:", res.data);

      if (res.data.success) {
        toast.success("Akun berhasil dibuat! Silakan login.", {
          duration: 3000,
        });
        router.push("/auth/login");
      }
      else {
        toast.error(res.data.message || "Terjadi kesalahan saat registrasi.", {
          duration: 4000,
        });
      }
    } catch (err) {
      console.error("Register error:", err.response?.data);
      toast.error(err.response?.data?.message || "Gagal mendaftar. Coba lagi nanti.", {
        duration: 4000,
      });
    }
  };

  return (
    <div className="min-h-screen relative bg-white font-poppins flex flex-col items-center justify-center px-4">
      {/* Header absolute */}
      <div className="absolute top-8 left-6 right-10 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center text-gray-400 hover:text-yellow-500 transition"
        >
          <ArrowLeft size={24} />
        </Link>

        <Link
          href="/auth/login"
          className="bg-white border border-gray-300 hover:bg-gray-50 text-yellow-500 font-semibold px-5 py-2 rounded-2xl shadow-[0_3px_0_#d1d5db] transition active:translate-y-0.5 text-center cursor-pointer"
        >
          MASUK
        </Link>
      </div>

      <h2 className="text-center text-xl md:text-2xl font-extrabold text-gray-800 mb-8 mt-10">
        Buat profilmu
      </h2>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-3"
      >
        {/* Nama */}
        <input
          type="text"
          name="nama"
          placeholder="Nama"
          value={form.nama}
          onChange={handleChange}
          className="w-full p-3 bg-gray-100 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-semibold text-base"
        />

        {/* Username */}
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full p-3 bg-gray-100 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-semibold text-base"
          required
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
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
            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
          </span>
        </div>

        {/* ✅ Daftar Syarat Password */}
        {form.password.length > 0 && (
          <div className="text-sm mt-1 space-y-1">
            <p className="font-semibold text-gray-600 mb-1">Syarat Kata Sandi:</p>
            <ul className="space-y-1">
              <PasswordRule
                valid={form.password.length >= 8}
                text="Minimal 8 karakter"
              />
              <PasswordRule
                valid={/[A-Z]/.test(form.password)}
                text="Mengandung huruf besar (A-Z)"
              />
              <PasswordRule
                valid={/[a-z]/.test(form.password)}
                text="Mengandung huruf kecil (a-z)"
              />
              <PasswordRule
                valid={/\d/.test(form.password)}
                text="Mengandung angka (0-9)"
              />
            </ul>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={passwordErrors.length > 0}
          className={`w-full py-3 rounded-2xl font-semibold shadow-[0_3px_0_#b45309] transition active:translate-y-0.5 cursor-pointer ${passwordErrors.length > 0
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-yellow-400 hover:bg-yellow-500 text-white"
            }`}
        >
          BUAT AKUN
        </button>
      </form>

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

// ✅ Komponen kecil untuk tiap aturan password
function PasswordRule({ valid, text }) {
  return (
    <li className={`flex items-center gap-2 ${valid ? "text-green-600" : "text-red-500"}`}>
      {valid ? <Check size={16} /> : <X size={16} />}
      <span>{text}</span>
    </li>
  );
}
