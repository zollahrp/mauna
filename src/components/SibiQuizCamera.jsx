"use client";
import { useRef, useState, useEffect } from "react";
import axios from "axios";

export default function SibiQuizCamera() {
  const TARGET_WORD = "IRFAN";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(Array(TARGET_WORD.length).fill("_"));
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Aktifkan kamera
  useEffect(() => {
    async function enableCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        setError("Gagal mengakses kamera. Pastikan izin diaktifkan.");
      }
    }
    enableCamera();
  }, []);

  // Auto-capture setiap 1 detik
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      captureAndPredict();
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIndex, isFinished]);

  // Ambil frame & kirim ke server
  const captureAndPredict = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");

      try {
        const res = await axios.post("http://127.0.0.1:8000/predict", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const predicted = res.data.predicted_label.toUpperCase();
        const targetLetter = TARGET_WORD[currentIndex];

        if (predicted === targetLetter) {
          const updated = [...progress];
          updated[currentIndex] = predicted;
          setProgress(updated);
          setMessage(`✅ Huruf ${predicted} benar!`);
          if (currentIndex < TARGET_WORD.length - 1) {
            setCurrentIndex(currentIndex + 1);
          } else {
            setIsFinished(true);
            setMessage(`🎉 Kata lengkap: ${TARGET_WORD}`);
          }
        } else {
          setMessage(`❌ Salah, model memprediksi: ${predicted}`);
        }
      } catch (err) {
        console.error(err);
        setError("Gagal mengirim ke server.");
      }
    }, "image/jpeg");
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-white min-h-screen">
      <h1 className="text-2xl font-bold text-black mb-2">SIBI Quiz - Tebak Kata</h1>
      <h2 className="text-xl text-black font-semibold mb-2">Kata Target: {TARGET_WORD}</h2>

      <div className="flex space-x-2 text-3xl font-bold text-black">
        {progress.map((ch, i) => (
          <span
            key={i}
            className={`px-2 py-1 border-b-2 ${
              i === currentIndex ? "border-blue-500" : "border-gray-300"
            }`}
          >
            {ch}
          </span>
        ))}
      </div>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        width={400}
        height={300}
        className="rounded-lg border border-gray-400 shadow-md"
      />
      <canvas ref={canvasRef} width={400} height={300} className="hidden" />

      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-black text-lg font-medium">{message}</p>}

      {isFinished && (
        <button
          onClick={() => {
            setCurrentIndex(0);
            setProgress(Array(TARGET_WORD.length).fill("_"));
            setIsFinished(false);
            setMessage("");
          }}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Ulangi Kuis 🔁
        </button>
      )}
    </div>
  );
}
