"use client";

import React, { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    identifier: "", // email atau username
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login submitted:", form);
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

        {/* Submit Button */}
        <button
          type="submit"
          onClick={() => router.push("/kelas")}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 rounded-2xl shadow-[0_3px_0_#b45309] transition active:translate-y-0.5 cursor-pointer"
        >
          MASUK
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
