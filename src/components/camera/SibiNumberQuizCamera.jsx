"use client";
import api from "@/lib/axios";
import { useRef, useState, useEffect } from "react";
// import { loadMediaPipe } from "@/lib/mediapipeLoader";

// Komponen sekarang menerima `targetAnswer`, `onFinish`, `onWrong`, dan `questionText` dari props
export default function SibiNumberQuizCamera({ targetAnswer, onFinish, onWrong, questionText }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const lastSentRef = useRef(0);
  const targetAnswerRef = useRef(targetAnswer);
  const isHandsLoaded = useRef(false);


  // Sync props to ref and state on change
  useEffect(() => {
    targetAnswerRef.current = targetAnswer;
    setIsCorrect(false); // Reset status benar
    setMessage(`Tunjukkan jawabannya dengan bahasa isyarat`);
  }, [targetAnswer]);

  // === 1. Setup Mediapipe Hands (stabil + delay + single load) ===
useEffect(() => {
  if (typeof window === "undefined" || isHandsLoaded.current) return;
  isHandsLoaded.current = true;

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const loadMediaPipe = async () => {
    // pastikan urutan loading
    await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
    await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");
  };

  const init = async () => {
    try {
      await loadMediaPipe();
      await new Promise((r) => setTimeout(r, 200)); // ⏱ delay 200ms biar wasm siap

      if (!window.Hands) {
        console.error("MediaPipe Hands belum siap");
        isHandsLoaded.current = false;
        return;
      }

      const hands = new window.Hands({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      hands.onResults(onResults);
      handsRef.current = hands;

      // Kamera
      if (videoRef.current) {
        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            try {
              if (handsRef.current && videoRef.current) {
                await handsRef.current.send({ image: videoRef.current });
              }
            } catch (err) {
              console.warn("Mediapipe aborted, skip frame:", err);
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
      console.error("Error initializing MediaPipe:", err);
      setError("Gagal memuat MediaPipe. Coba refresh halaman.");
      isHandsLoaded.current = false;
      setIsLoading(false);
    }
  };

  init();

  return () => {
    if (cameraRef.current) cameraRef.current.stop();
    isHandsLoaded.current = false; // bersihkan flag
  };
}, []);


  // === 2. Extract hand vector (9 features for number model) ===
  const extractHandVectorRel = (landmarks) => {
    const pts = landmarks.map(lm => [lm.x, lm.y, lm.z]);
    const base = pts[0];
    const rel = pts.map(p => [p[0] - base[0], p[1] - base[1], p[2] - base[2]]);
    
    // Distance from thumb to other fingers
    const dThumb = [8, 12, 16, 20].map(i => {
      return Math.sqrt(
        Math.pow(rel[4][0] - rel[i][0], 2) +
        Math.pow(rel[4][1] - rel[i][1], 2) +
        Math.pow(rel[4][2] - rel[i][2], 2)
      );
    });
    
    // Finger lengths
    const fingerLen = [4, 8, 12, 16, 20].map(i => {
      return Math.sqrt(
        Math.pow(rel[0][0] - rel[i][0], 2) +
        Math.pow(rel[0][1] - rel[i][1], 2) +
        Math.pow(rel[0][2] - rel[i][2], 2)
      );
    });
    
    return [...dThumb, ...fingerLen];
  };

  // === 3. Process MediaPipe results ===
  const onResults = (results) => {
    if (!results.multiHandLandmarks || 
        results.multiHandLandmarks.length === 0 || 
        !results.multiHandLandmarks[0] ||
        isCorrect ||
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

    const vector = extractHandVectorRel(landmarks);
    sendVectorToServer(vector);
  };

  // === 4. Send to FastAPI ===
  const sendVectorToServer = async (vector) => {
    if (isProcessing) return;
    
    try {
      const res = await api.post("/predict/number", {
        vector,
      });

      const data = await res.data;
      
      if (data.error) {
        console.error("Server error:", data.error);
        setError(data.error);
        return;
      }
      
      const predicted = data.label?.toString() ?? "_";
      const confidence = data.confidence ?? 0;
      const targetAnswer = targetAnswerRef.current;

      console.log(`Prediksi: ${predicted} (${confidence.toFixed(2)}) | Target: ${targetAnswer}`);

      if (predicted === targetAnswer && confidence > 0.6) {
        setIsProcessing(true);
        setIsCorrect(true);
        setMessage(`✅ Benar! Jawabannya ${targetAnswer}`);
        
        onFinish(); // Langsung panggil onFinish
      } else {
        setMessage(`Tunjukkan jawabannya dengan bahasa isyarat`);
        onWrong(); // Panggil onWrong jika salah
      }
    } catch (err) {
      console.error("Prediction error:", err);
      setError("Gagal mengirim data ke server. Pastikan backend berjalan.");
    }
  };

  // === 5. UI ===
  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-white">
      <div className="rounded-lg bg-blue-50 p-6 mb-4">
          <h2 className="text-4xl text-black font-bold text-center">
              {questionText}
          </h2>
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

      <div className="text-sm text-gray-500 mt-4 text-center">
        <p>Tunjukkan angka jawaban dengan bahasa isyarat</p>
        <p>Prediksi akan dilakukan setiap 1 detik</p>
      </div>
    </div>
  );
}