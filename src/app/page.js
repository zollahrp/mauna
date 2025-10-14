"use client";

import React, { useRef, useEffect, useState } from "react";
// import { DotLottieReact } from "@lottiefiles/dotlottie-react";
// import Lottie from "react-lottie-player";
import mauna from "../../public/mauna.json";
// import communication from "../../public/communication.json";
import { useRouter } from "next/navigation";
import Link from "next/link";

import dynamic from "next/dynamic";

// Lazy load DotLottieReact
const DotLottieReact = dynamic(
  () =>
    import("@lottiefiles/dotlottie-react").then((mod) => mod.DotLottieReact),
  { ssr: false }
);

// Lazy load react-lottie-player
const Lottie = dynamic(() => import("react-lottie-player"), { ssr: false });

// Komponen Lottie dengan kontrol visibility + scroll
function LottieWithVisibility({ src, loop, autoplay, className, ...props }) {
  const [show, setShow] = React.useState(true);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    let isIntersecting = false;
    const node = containerRef.current; // simpan referensi node

    function handleTabVisibility() {
      if (isIntersecting && document.visibilityState === "visible") {
        setShow(true);
      } else {
        setShow(false);
      }
    }

    document.addEventListener("visibilitychange", handleTabVisibility);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        handleTabVisibility();
      },
      { threshold: 0.2 }
    );

    if (node) observer.observe(node);

    return () => {
      document.removeEventListener("visibilitychange", handleTabVisibility);
      if (node) observer.unobserve(node); // gunakan node, bukan containerRef.current
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      {show && (
        <DotLottieReact
          src={src}
          loop={loop}
          autoplay={autoplay}
          className={className}
          {...props}
        />
      )}
    </div>
  );
}

// src: animasi JSON, bukan URL .lottie!
function ScrollLottie({ className, animationData }) {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    function onScroll() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const start = windowHeight;
      const end = -rect.height;

      const percent = Math.max(
        0,
        Math.min(1, (rect.top - end) / (start - end))
      );

      setProgress(percent);
    }

    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!animationData) return null;

  return (
    <div ref={containerRef} className={className}>
      <Lottie
        animationData={animationData}
        play={false} // 🚫 jangan autoplay
        loop={false}
        goTo={progress * 100} // 🚀 pakai goTo, range 0–100
        style={{ width: 400, height: 400 }}
      />
    </div>
  );
}

// Komponen reusable section
function FeatureSection({ title, desc, lottieUrl, reverse }) {
  return (
    <div
      className={`container mx-auto max-w-screen-lg bg-[#FAFAFA] flex flex-col md:flex-row items-center py-14 gap-0 ${reverse ? "md:flex-row-reverse" : ""
        }`}
    >
      {/* Kolom 1 - Lottie */}
      <div className="flex justify-center md:w-1/2">
        <div className="w-[450px] h-[450px] md:w-[450px] md:h-[450px]">
          <LottieWithVisibility
            src={lottieUrl}
            loop
            autoplay
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Kolom 2 - Teks */}
      <div className="md:w-1/2 text-left">
        <h2 className="text-3xl md:text-[2.75rem] font-fredoka text-[#ffbb00] mb-4 leading-snug tracking-wider">
          {title}
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  return (
    <main className="w-full min-h-screen flex flex-col bg-[#FAFAFA] px-4 sm:px-0">
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
              <button
                type="button"
                onClick={() => router.push("/auth/register")}
                className="w-full bg-[#ffbb00] hover:bg-[#e6a800] text-white font-semibold py-3 rounded-2xl shadow-[0_3px_0_#b45309] transition active:translate-y-0.5 cursor-pointer"
              >
                MULAI
              </button>

              <Link
                href="/auth/login"
                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-[#ffbb00] font-semibold px-5 py-3 rounded-2xl shadow-[0_3px_0_#d1d5db] transition active:translate-y-0.5 text-center cursor-pointer"
              >
                AKU SUDAH PUNYA AKUN
              </Link>
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
      <section className="w-full flex flex-col bg-[#FAFAFA] ">
        <FeatureSection
          title="gratis. seru. inklusif."
          desc="Belajar bahasa isyarat di MAUNA itu mudah dan menyenangkan! Dengan latihan singkat, kamu bisa menguasai gerakan dasar, menambah kosakata, dan berkomunikasi lebih inklusif setiap harinya."
          lottieUrl="https://lottie.host/802e7509-f131-45e9-aa8e-dc17e829b029/3ve5xmWybl.lottie"
          reverse
        />

        <FeatureSection
          title="didukung teknologi & komunitas"
          desc="MAUNA memadukan metode pembelajaran interaktif dengan teknologi pengenalan gerakan. Semua metode dirancang agar efektif, praktis, dan relevan untuk kebutuhan komunikasi sehari-hari."
          lottieUrl="https://lottie.host/75fc5bbf-0602-4eab-8a45-220acaaea357/16qAZGGhcM.lottie"
        />

        <FeatureSection
          title="tetap termotivasi"
          desc="Kami menghadirkan pengalaman belajar seperti bermain game, ada poin, level, tantangan, dan maskot ceria yang selalu menyemangati kamu untuk terus berkembang!"
          lottieUrl="https://lottie.host/f9e7fe7c-dfcd-4fd7-895f-83f208a23f5e/EOnsyHygcw.lottie"
          reverse
        />

        <FeatureSection
          title="pembelajaran yang dipersonalisasi"
          desc="MAUNA menggunakan AI untuk menyesuaikan materi sesuai kemampuanmu. Belajar jadi lebih cepat, tepat, dan sesuai dengan gaya belajarmu sendiri."
          lottieUrl="https://lottie.host/08313286-2dd7-48d0-968f-08d3cc0f5bb4/ww7seByAKD.lottie"
        />
      </section>

      {/* 🔥 Scroll-based Animation */}
      <section className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-[#FAFAFA] to-[##f3faf8] px-4">
        <div className="text-center max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-fredoka font-bold text-[#ffbb00] mb-0 leading-tight">
            Kapan pun, di mana pun ✨
          </h2>
          <p className="text-gray-600 text-lg md:text-xl mb-10">
            Belajar bahasa isyarat fleksibel tanpa batas. Akses materi sesuai
            ritme dan gaya belajarmu sendiri.
          </p>
        </div>

        <ScrollLottie animationData={mauna} />
      </section>

      {/* 👯 Belajar Bareng Section */}
      <section className="w-full bg-[#f8cf09] ">
        <div className="container mx-auto max-w-screen-lg flex flex-col md:flex-row items-center py-20 px-6 gap-10">
          {/* Kiri - Lottie */}
          <div className="flex justify-center md:w-1/2">
            <div className="w-[350px] h-[350px] md:w-[400px] md:h-[400px]">
              <DotLottieReact
                src="https://lottie.host/0efcba23-29a8-4185-9a80-9e41d406d3c5/CJ4XTCxGPj.lottie"
                loop
                autoplay
              />
            </div>
          </div>

          {/* Kanan - Teks */}
          <div className="md:w-1/2 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-fredoka font-bold text-gray-800 mb-6 leading-snug">
              Belajar bareng dengan Mauna
            </h2>
            <p className="text-gray-700 text-lg md:text-xl leading-relaxed mb-6">
              Jadikan Mauna sebagai teman belajarmu! Yuk, mulai latihan bahasa
              isyarat dengan cara yang seru, inklusif, dan mudah diakses.
            </p>
            <button
              type="button"
              onClick={() => router.push("/auth/register")}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-[#ffbb00] font-semibold px-6 py-3 rounded-2xl shadow-[0_3px_0_#d1d5db] transition active:translate-y-0.5 cursor-pointer"
            >
              MULAI SEKARANG
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
