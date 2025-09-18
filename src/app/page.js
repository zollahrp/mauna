"use client";

import React, { useRef, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// Komponen Lottie dengan kontrol visibility
function LottieWithVisibility({ src, loop, autoplay, ...props }) {
  const lottieRef = useRef(null);

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        lottieRef.current?.play();
      } else {
        lottieRef.current?.pause();
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <DotLottieReact
      src={src}
      loop={loop}
      autoplay={autoplay}
      lottieRef={lottieRef}
      {...props}
    />
  );
}

// Komponen reusable section
function FeatureSection({ title, desc, lottieUrl, reverse }) {
  return (
    <div
      className={`container mx-auto max-w-screen-lg flex flex-col md:flex-row items-center py-16 gap-6 ${
        reverse ? "md:flex-row-reverse" : ""
      }`}
    >
      {/* Kolom 1 - Lottie */}
      <div className="flex justify-center md:w-1/2">
        <div className="w-[300px] h-[300px] md:w-[450px] md:h-[450px]">
          <LottieWithVisibility src={lottieUrl} loop autoplay />
        </div>
      </div>

      {/* Kolom 2 - Teks */}
      <div className="md:w-1/2 text-left">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-snug">
          {title}
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="w-full min-h-screen flex flex-col bg-white px-4 md:px-6">
      {/* Hero Section */}
      <section className="w-full min-h-screen flex flex-col items-center justify-center">
        <div className="container mx-auto max-w-screen-lg grid md:grid-cols-2 gap-0 items-center flex-1">
          {/* Kiri - Lottie */}
          <div className="flex justify-end md:pr-4">
            <div className="w-[450px] h-[450px] md:w-[500px] md:h-[500px]">
              <LottieWithVisibility
                src="https://lottie.host/9d11a902-ea15-4ae0-a23c-3a970aef3763/0r3Cgea1po.lottie"
                loop
                autoplay
              />
            </div>
          </div>

          {/* Kanan - Teks + Button */}
          <div className="text-left md:pl-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 leading-snug">
              Cara seru dan efektif <br /> belajar bahasa isyarat!
            </h1>
            <div className="flex flex-col gap-4 max-w-sm">
              <button className="w-full bg-[#ffbb00] hover:bg-[#e06e2d] text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors">
                Mulai
              </button>
              <button className="w-full border border-gray-300 hover:bg-gray-100 text-gray-800 font-semibold px-6 py-3 rounded-lg transition">
                Aku sudah punya akun
              </button>
            </div>
          </div>
        </div>

        {/* Separator bawah hero */}
        <div className="w-full border-t border-b border-gray-300 mt-10 py-3">
          <div className="container mx-auto max-w-screen-lg flex justify-between text-gray-700 font-semibold">
            <span>BISINDO</span>
            <span>SIBI</span>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section className="w-full flex flex-col bg-white">
        <FeatureSection
          title="gratis. inklusif. menyenangkan."
          desc="Belajar bahasa isyarat di MAUNA itu mudah dan menyenangkan! Dengan latihan singkat, kamu bisa menguasai gerakan dasar, menambah kosakata, dan berkomunikasi lebih inklusif setiap harinya."
          lottieUrl="https://lottie.host/9d11a902-ea15-4ae0-a23c-3a970aef3763/0r3Cgea1po.lottie"
          reverse
        />

        <FeatureSection
          title="didukung teknologi & komunitas"
          desc="MAUNA memadukan metode pembelajaran interaktif dengan teknologi pengenalan gerakan. Semua kursus dirancang agar efektif, praktis, dan relevan untuk kebutuhan komunikasi sehari-hari."
          lottieUrl="https://lottie.host/9d11a902-ea15-4ae0-a23c-3a970aef3763/0r3Cgea1po.lottie"
        />

        <FeatureSection
          title="tetap termotivasi"
          desc="Kami menghadirkan pengalaman belajar seperti bermain game: ada poin, level, tantangan, dan maskot ceria yang selalu menyemangati kamu untuk terus berkembang!"
          lottieUrl="https://lottie.host/9d11a902-ea15-4ae0-a23c-3a970aef3763/0r3Cgea1po.lottie"
          reverse
        />

        <FeatureSection
          title="pembelajaran yang dipersonalisasi"
          desc="MAUNA menggunakan AI untuk menyesuaikan materi sesuai kemampuanmu. Belajar jadi lebih cepat, tepat, dan sesuai dengan gaya belajarmu sendiri."
          lottieUrl="https://lottie.host/9d11a902-ea15-4ae0-a23c-3a970aef3763/0r3Cgea1po.lottie"
        />
      </section>
    </main>
  );
}
