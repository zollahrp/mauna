"use client";

import React, { useRef, useEffect, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Lottie from "react-lottie-player";
import mauna from "../../public/mauna.json";

// Komponen Lottie dengan kontrol visibility + scroll
function LottieWithVisibility({ src, loop, autoplay, className, ...props }) {
  const [show, setShow] = React.useState(true);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    let isIntersecting = false;

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

    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      document.removeEventListener("visibilitychange", handleTabVisibility);
      if (containerRef.current) observer.unobserve(containerRef.current);
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
        play={false}          // 🚫 jangan autoplay
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
      className={`container mx-auto max-w-screen-lg bg-[#FAFAFA] flex flex-col md:flex-row items-center py-14 gap-0 ${
        reverse ? "md:flex-row-reverse" : ""
      }`}
    >
      {/* Kolom 1 - Lottie */}
      <div className="flex justify-center md:w-1/2">
        <div className="w-[450px] h-[450px] md:w-[450px] md:h-[450px]">
          <LottieWithVisibility
            src={lottieUrl}
            loop
            autoplay
            className="w-full h-full object-contain" // 🔥 biar proporsional
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
  return (
    <main className="w-full min-h-screen flex flex-col bg-[#FAFAFA] px-4 md:px-6">
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
      <section className="h-[200vh] flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold mb-6">
          Scroll biar animasi jalan ⬇️
        </h2>
        <ScrollLottie animationData={mauna} />
      </section>
    </main>
  );
}
