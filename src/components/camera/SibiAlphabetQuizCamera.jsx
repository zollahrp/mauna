"use client";
import { useRef, useState, useEffect } from "react";
import api from "@/lib/axios"; // Pastikan ini diimpor

export default function SibiAlphabetQuizCamera({ targetWord, onFinish, onWrong }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(Array(targetWord.length).fill("_"));
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const lastSentRef = useRef(0);
  const currentIndexRef = useRef(0);

  // === 1. Setup Mediapipe Hands (load from CDN) ===
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadMediaPipe = async () => {
      try {
        const loadScript = (src) => {
          return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        };

        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");

        const hands = new window.Hands({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7,
        });

        hands.onResults(onResults);
        handsRef.current = hands;

        if (videoRef.current) {
          const camera = new window.Camera(videoRef.current, {
            onFrame: async () => {
              if (handsRef.current && videoRef.current) {
                await handsRef.current.send({ image: videoRef.current });
              }
            },
            width: 400,
            height: 300,
          });
          camera.start();
          cameraRef.current = camera;
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error loading MediaPipe:", err);
        setError("Gagal memuat MediaPipe. Coba refresh halaman.");
        setIsLoading(false);
      }
    };

    loadMediaPipe();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, []);

  // === 2. Extract advanced features (same as Python training) ===
  const extractHandVectorAdvanced = (landmarks) => {
    const pts = landmarks.map(lm => [lm.x, lm.y, lm.z]);
    const base = pts[0];
    const rel = pts.map(p => [p[0] - base[0], p[1] - base[1], p[2] - base[2]]);
    
    const palmSize = Math.sqrt(
      Math.pow(rel[0][0] - rel[9][0], 2) + 
      Math.pow(rel[0][1] - rel[9][1], 2) + 
      Math.pow(rel[0][2] - rel[9][2], 2)
    ) + 1e-6;
    
    const dThumb = [8, 12, 16, 20].map(i => {
      const dist = Math.sqrt(
        Math.pow(rel[4][0] - rel[i][0], 2) +
        Math.pow(rel[4][1] - rel[i][1], 2) +
        Math.pow(rel[4][2] - rel[i][2], 2)
      );
      return dist / palmSize;
    });
    
    const fingerLen = [4, 8, 12, 16, 20].map(i => {
      const dist = Math.sqrt(
        Math.pow(rel[0][0] - rel[i][0], 2) +
        Math.pow(rel[0][1] - rel[i][1], 2) +
        Math.pow(rel[0][2] - rel[i][2], 2)
      );
      return dist / palmSize;
    });
    
    const angle = (a, b, c) => {
      const ba = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
      const bc = [c[0] - b[0], c[1] - b[1], c[2] - b[2]];
      const dot = ba[0]*bc[0] + ba[1]*bc[1] + ba[2]*bc[2];
      const magBa = Math.sqrt(ba[0]**2 + ba[1]**2 + ba[2]**2);
      const magBc = Math.sqrt(bc[0]**2 + bc[1]**2 + bc[2]**2);
      const cosAng = dot / (magBa * magBc + 1e-6);
      return Math.acos(Math.max(-1, Math.min(1, cosAng)));
    };
    
    const angs = [
      angle(rel[2], rel[3], rel[4]),
      angle(rel[5], rel[6], rel[8]),
      angle(rel[9], rel[10], rel[12]),
      angle(rel[13], rel[14], rel[16]),
      angle(rel[17], rel[18], rel[20])
    ];
    
    return [...dThumb, ...fingerLen, ...angs];
  };

  // === 3. Proses hasil Mediapipe ===
  const onResults = (results) => {
    if (!results.multiHandLandmarks || 
        results.multiHandLandmarks.length === 0 || 
        !results.multiHandLandmarks[0] ||
        isFinished ||
        isProcessing) {
      return;
    }

    const now = Date.now();
    if (now - lastSentRef.current < 1000) return;
    lastSentRef.current = now;

    const landmarks = results.multiHandLandmarks[0];
    
    if (!Array.isArray(landmarks) || landmarks.length === 0) {
      return;
    }

    const vector = extractHandVectorAdvanced(landmarks);
    sendVectorToServer(vector);
  };

  // === 4. Kirim ke FastAPI ===
  const sendVectorToServer = async (vector) => {
    if (isProcessing) return;

    try {
      const res = await api.post("/predict/alphabet", {
        vector,
      });

      const data = await res.data;

      if (data.error) {
        console.error("Server error:", data.error);
        setError(data.error);
        return;
      }

      const predicted = data.label?.toUpperCase() ?? "_";
      const confidence = data.confidence ?? 0;
      const currentIdx = currentIndexRef.current;
      const targetLetter = targetWord[currentIdx];

      console.log(`Prediksi: ${predicted} (${confidence.toFixed(2)}) | Target: ${targetLetter} | Index: ${currentIdx}`);

      if (predicted === targetLetter && confidence > 0.6) {
        setIsProcessing(true);
        
        // Update progress
        setProgress(prev => {
          const updated = [...prev];
          updated[currentIdx] = predicted;
          return updated;
        });

        setMessage(`✅ Huruf ${predicted} benar!`);
        
        // Pindah ke huruf berikutnya tanpa delay
        const nextIndex = currentIdx + 1;
        if (nextIndex < targetWord.length) {
            currentIndexRef.current = nextIndex;
            setCurrentIndex(nextIndex);
            setMessage(`Tunjukkan huruf: ${targetWord[nextIndex]}`);
            setIsProcessing(false);
        } else {
            setIsFinished(true);
            setMessage(`🎉 Kata lengkap: ${targetWord}`);
            onFinish(); // Selesai
        }
      } else {
        setMessage(`Tunjukkan huruf: ${targetLetter}`);
        onWrong(); // Panggil onWrong jika salah
      }
    } catch (err) {
      console.error("Prediction error:", err);
      setError("Gagal mengirim data ke server. Pastikan backend berjalan.");
    }
  };

  // === 5. Tampilan UI sederhana ===
  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-white min-h-screen">
      <h1 className="text-2xl font-bold text-black mb-2">SIBI Quiz - Tebak Kata</h1>
      <h2 className="text-xl text-black font-semibold mb-2">
        Kata Target: {targetWord}
      </h2>

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

      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          width={400}
          height={300}
          className="rounded-lg border border-gray-400 shadow-md"
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg">
            <p className="text-white text-lg">Loading MediaPipe...</p>
          </div>
        )}
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-black text-lg font-medium">{message}</p>}

      {isFinished && (
        <button
          onClick={() => {
            currentIndexRef.current = 0;
            setCurrentIndex(0);
            setProgress(Array(targetWord.length).fill("_"));
            setIsFinished(false);
            setIsProcessing(false);
            setMessage(`Tunjukkan huruf: ${targetWord[0]}`);
          }}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Ulangi Kuis 🔁
        </button>
      )}
    </div>
  );
}