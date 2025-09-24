"use client";

import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA]">
      <DotLottieReact
        src="https://lottie.host/16987012-0090-4e15-8386-265c2cba1342/0cd3JKUAHq.lottie"
        loop
        autoplay
        style={{ width: 220, height: 220 }} // 👈 kecilin ukuran animasi
      />
    </div>
  );
}
