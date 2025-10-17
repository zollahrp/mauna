// src/components/camera/SibiNumberPlayground.js
"use client";
import api from "@/lib/axios";
import { useRef, useState, useEffect } from "react";

// --- FEATURE EXTRACTION LOGIC (Diambil dari SibiNumberQuizCamera) ---
const extractHandVectorRel = (landmarks) => {
    // [CODE DARI SibiNumberQuizCamera.js - RELATIVE FEATURES]
    const pts = landmarks.map(lm => [lm.x, lm.y, lm.z]);
    const base = pts[0];
    const rel = pts.map(p => [p[0] - base[0], p[1] - base[1], p[2] - base[2]]);
    
    const dThumb = [8, 12, 16, 20].map(i => {
      return Math.sqrt(Math.pow(rel[4][0] - rel[i][0], 2) + Math.pow(rel[4][1] - rel[i][1], 2) + Math.pow(rel[4][2] - rel[i][2], 2));
    });
    
    const fingerLen = [4, 8, 12, 16, 20].map(i => {
      return Math.sqrt(Math.pow(rel[0][0] - rel[i][0], 2) + Math.pow(rel[0][1] - rel[i][1], 2) + Math.pow(rel[0][2] - rel[i][2], 2));
    });
    
    return [...dThumb, ...fingerLen];
};

export default function SibiNumberPlayground() {
    const [predictedLabel, setPredictedLabel] = useState("---");
    const [confidence, setConfidence] = useState(0);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const videoRef = useRef(null);
    const handsRef = useRef(null);
    const cameraRef = useRef(null);
    const lastSentRef = useRef(0);
    const isHandsLoaded = useRef(false);

    const predictionEndpoint = "/predict/number";
    
    // Kirim ke FastAPI dan update state
    const sendVectorToServer = async (vector) => {
        try {
            const res = await api.post(predictionEndpoint, { vector });
            const data = res.data;
            
            if (data.error) {
                console.error("Server error:", data.error);
                setError(data.error);
                return;
            }
            
            const predicted = data.label?.toString() ?? "---";
            const conf = Math.floor(data.confidence * 100);
            
            if (conf >= 50) {
              setPredictedLabel(predicted);
              setConfidence(conf);
            } else if (conf < 20) {
              setPredictedLabel("---");
              setConfidence(0);
            }

        } catch (err) {
            console.error("Prediction error:", err);
            setError("Gagal mengirim data ke server. Pastikan backend berjalan.");
        }
    };
    
    const onResults = (results) => {
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            setPredictedLabel("---");
            setConfidence(0);
            return;
        }

        const now = Date.now();
        if (now - lastSentRef.current < 400) return; // Kirim setiap 400ms
        lastSentRef.current = now;

        const landmarks = results.multiHandLandmarks[0];
        if (!Array.isArray(landmarks) || landmarks.length === 0) return;

        const vector = extractHandVectorRel(landmarks);
        sendVectorToServer(vector);
    };

    // === 1. Setup Mediapipe Hands (Inisialisasi) ===
    useEffect(() => {
        if (typeof window === "undefined" || isHandsLoaded.current) return;
        
        setPredictedLabel("---");
        setConfidence(0);
        setError(null);
        setIsLoading(true);

        if (cameraRef.current) {
            cameraRef.current.stop();
            cameraRef.current = null;
        }
        
        isHandsLoaded.current = true;

        const loadScript = (src) => new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });

        const loadMediaPipe = async () => {
            await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
            await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");
        };

        const init = async () => {
            try {
                await loadMediaPipe();
                await new Promise((r) => setTimeout(r, 200));

                if (!window.Hands) return;

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
                            try {
                                if (handsRef.current && videoRef.current) {
                                    await handsRef.current.send({ image: videoRef.current });
                                }
                            } catch (err) {
                                console.warn("Mediapipe aborted, skip frame:", err);
                            }
                        },
                        width: 640,
                        height: 480,
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
            isHandsLoaded.current = false;
        };
    }, []);


    // === 5. UI Playground ===
    return (
        <div className="flex flex-col items-center space-y-6 w-full">
            <div className="relative w-full max-w-lg shadow-xl rounded-xl overflow-hidden border-4 border-gray-200">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    width={640} 
                    height={480}
                    className="w-full h-auto object-cover"
                />
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70">
                        <p className="text-white text-lg">Memuat model Angka...</p>
                    </div>
                )}
                {error && <div className="absolute inset-0 flex items-center justify-center bg-red-800/80"><p className="text-white text-lg">{error}</p></div>}
            </div>

            <div className="bg-blue-500 text-white p-4 rounded-xl shadow-lg w-full max-w-lg text-center">
                <p className="text-4xl font-extrabold mb-1">
                    {predictedLabel}
                </p>
                <p className="text-sm font-semibold">
                    {confidence > 0 ? `Keyakinan: ${confidence}%` : 'Menunggu Isyarat...'}
                </p>
            </div>

            <div className="text-sm text-gray-500 mt-4 text-center">
                <p>Mode Deteksi: ANGKA (0-9).</p>
                <p>Prediksi diperbarui setiap 0.4 detik.</p>
            </div>
        </div>
    );
}