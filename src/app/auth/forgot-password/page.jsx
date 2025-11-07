"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(false);

  useEffect(() => {
    // Jika ada token di URL, berarti ini adalah halaman reset password
    if (token) {
      setIsResetMode(true);
      verifyToken();
    }
  }, [token]);

  // ✅ Verify token when landing on reset page
  const verifyToken = async () => {
    setVerifyingToken(true);
    try {
      const response = await api.get(`/public/verify-reset-token?token=${token}`);
      
      if (response.data?.data?.valid) {
        setTokenValid(true);
        // Optional: Set email if returned
        if (response.data?.data?.email) {
          setEmail(response.data.data.email);
        }
      } else {
        toast.error("Link reset password tidak valid atau sudah kadaluarsa!");
        router.push("/auth/forgot-password");
      }
    } catch (error) {
      console.error("Token verification error:", error);
      toast.error("Link reset password tidak valid atau sudah kadaluarsa!");
      router.push("/auth/forgot-password");
    } finally {
      setVerifyingToken(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  // ✅ Request password reset (send email)
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Email harus diisi!");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Format email tidak valid!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/public/request-password-reset", {
        email: email.trim()
      });

      if (response.data?.success) {
        toast.success("Link reset password telah dikirim ke email Anda! Silakan cek inbox atau spam folder.");
        setEmail("");
      } else {
        throw new Error(response.data?.message || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          "Gagal mengirim email reset password";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Reset password with token
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!password.trim()) {
      toast.error("Password baru harus diisi!");
      return;
    }

    if (!validatePassword(password)) {
      toast.error("Password harus minimal 8 karakter!");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Konfirmasi password tidak sama!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/public/reset-password", {
        token: token,
        new_password: password.trim(),
        confirm_password: confirmPassword.trim()
      });

      if (response.data?.success) {
        toast.success("Password berhasil direset! Silakan login dengan password baru.");
        router.push("/auth/login");
      } else {
        throw new Error(response.data?.message || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          "Gagal mereset password";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isResetMode) {
    // ✅ Show loading while verifying token
    if (verifyingToken) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 font-poppins">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffbb00] mx-auto mb-4"></div>
            <p className="text-gray-600">Memverifikasi link reset password...</p>
          </div>
        </div>
      );
    }

    // ✅ Show reset form only if token is valid
    if (!tokenValid) {
      return null; // Will redirect to forgot password page
    }

    // Halaman Reset Password (dengan token valid)
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-poppins">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo_mauna.png"
                alt="Mauna Logo"
                width={120}
                height={120}
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600 text-sm">
              Masukkan password baru untuk akun Anda
            </p>
            {email && (
              <p className="text-[#ffbb00] text-sm mt-2 font-medium">
                Email: {email}
              </p>
            )}
          </div>

          {/* Form Reset Password */}
          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* Password Baru */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password Baru
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffbb00] focus:border-transparent transition-all"
                  placeholder="Masukkan password baru"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimal 8 karakter, harus mengandung huruf besar, huruf kecil, dan angka
              </p>
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffbb00] focus:border-transparent transition-all"
                  placeholder="Ulangi password baru"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ffbb00] hover:bg-yellow-500 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl shadow-[0_4px_0_#b45309] hover:shadow-[0_2px_0_#b45309] active:translate-y-0.5 transition-all disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Mereset Password...
                </div>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="text-center mt-6">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-[#ffbb00] hover:text-yellow-600 font-medium text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Halaman Forgot Password (tanpa token)
  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-poppins">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo_mauna.png"
              alt="Mauna Logo"
              width={120}
              height={120}
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Lupa Password?
          </h1>
          <p className="text-gray-600 text-sm">
            Masukkan email Anda untuk mendapatkan link reset password
          </p>
        </div>

        {/* Form Forgot Password */}
        <form onSubmit={handleForgotPassword} className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffbb00] focus:border-transparent transition-all"
                placeholder="Masukkan email Anda"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#ffbb00] hover:bg-yellow-500 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl shadow-[0_4px_0_#b45309] hover:shadow-[0_2px_0_#b45309] active:translate-y-0.5 transition-all disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Mengirim Email...
              </div>
            ) : (
              "Kirim Link Reset"
            )}
          </button>
        </form>

        {/* Links */}
        <div className="text-center mt-6 space-y-3">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-[#ffbb00] hover:text-yellow-600 font-medium text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali ke Login
          </Link>
          
          <div className="text-gray-500 text-sm">
            Belum punya akun?{" "}
            <Link
              href="/auth/register"
              className="text-[#ffbb00] hover:text-yellow-600 font-medium transition-colors"
            >
              Daftar di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}