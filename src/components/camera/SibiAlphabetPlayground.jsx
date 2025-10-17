// src/components/camera/SibiAlphabetPlayground.js
"use client";
import api from "@/lib/axios";
import { useRef, useState, useEffect } from "react";

// --- FEATURE EXTRACTION LOGIC (Diambil dari SibiAlphabetQuizCamera) ---
const extractHandVectorAdvanced = (landmarks) => {
    // [CODE DARI SibiAlphabetQuizCamera.js - ADVANCED FEATURES]
    const pts = landmarks.map(lm => [lm.x, lm.y, lm.z]);
    const base = pts[0];
    const rel = pts.map(p => [p[0] - base[0], p[1] - base[1], p[2] - base[2]]);
    
    const palmSize = Math.sqrt(Math.pow(rel[0][0] - rel[9][0], 2) + Math.pow(rel[0][1] - rel[9][1], 2) + Math.pow(rel[0][2] - rel[9][2], 2)) + 1e-6;
    
    const dThumb = [8, 12, 16, 20].map(i => {
      const dist = Math.sqrt(Math.pow(rel[4][0] - rel[i][0], 2) + Math.pow(rel[4][1] - rel[i][1], 2) + Math.pow(rel[4][2] - rel[i][2], 2));
      return dist / palmSize;
    });
    
    const fingerLen = [4, 8, 12, 16, 20].map(i => {
      const dist = Math.sqrt(Math.pow(rel[0][0] - rel[i][0], 2) + Math.pow(rel[0][1] - rel[i][1], 2) + Math.pow(rel[0][2] - rel[i][2], 2));
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
      angle(rel[2], rel[3], rel[4]), angle(rel[5], rel[6], rel[8]), angle(rel[9], rel[10], rel[12]),
      angle(rel[13], rel[14], rel[16]), angle(rel[17], rel[18], rel[20])
    ];
    
    return [...dThumb, ...fingerLen, ...angs];
};

export default function SibiAlphabetPlayground() {
    const [predictedLabel, setPredictedLabel] = useState("---");
    const [confidence, setConfidence] = useState(0);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const videoRef = useRef(null);
    const handsRef = useRef(null);
    const cameraRef = useRef(null);
    const lastSentRef = useRef(0);
    const isHandsLoaded = useRef(false);

    const predictionEndpoint = "/predict/alphabet";
    
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
            
            const predicted = data.label?.toString()?.toUpperCase() ?? "---";
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

        const vector = extractHandVectorAdvanced(landmarks);
        sendVectorToServer(vector);
    };

    // === 1. Setup Mediapipe Hands (Inisialisasi) ===
    useEffect(() => {
        if (typeof window === "undefined" || isHandsLoaded.current) return;
        isHandsLoaded.current = true;

        let isMounted = true;
        
        // Bersihkan state saat mode berubah
        setPredictedLabel("---");
        setConfidence(0);
        setError(null);
        setIsLoading(true);

        const loadScript = (src) => {
            return new Promise((resolve, reject) => {
                // Check if script already exists
                const existingScript = document.querySelector(`script[src="${src}"]`);
                if (existingScript) {
                    if (existingScript.getAttribute('data-loaded') === 'true') {
                        resolve();
                        return;
                    }
                    // Wait for existing script to load
                    existingScript.addEventListener('load', resolve);
                    existingScript.addEventListener('error', reject);
                    return;
                }

                const script = document.createElement("script");
                script.src = src;
                script.crossOrigin = "anonymous";
                script.onload = () => {
                    script.setAttribute('data-loaded', 'true');
                    console.log(`✅ Loaded: ${src}`);
                    resolve();
                };
                script.onerror = (err) => {
                    console.error(`❌ Failed to load: ${src}`, err);
                    reject(err);
                };
                document.head.appendChild(script);
            });
        };

        const init = async () => {
            try {
                // Load scripts with proper order
                console.log("📦 Loading MediaPipe scripts (Alphabet Playground)...");
                await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3/camera_utils.js");
                await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/hands.js");
                
                // Wait for global objects to be available
                let attempts = 0;
                while ((!window.Hands || !window.Camera) && attempts < 50) {
                    await new Promise(r => setTimeout(r, 100));
                    attempts++;
                }

                if (!isMounted) return;

                if (!window.Hands || !window.Camera) {
                    throw new Error("MediaPipe tidak dapat dimuat setelah 5 detik");
                }

                console.log("✅ MediaPipe loaded, initializing Hands...");

                const hands = new window.Hands({
                    locateFile: (file) => {
                        const url = `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${file}`;
                        console.log(`🔗 Loading: ${url}`);
                        return url;
                    },
                });

                await hands.setOptions({
                    maxNumHands: 1,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.7,
                    minTrackingConfidence: 0.7,
                });

                hands.onResults(onResults);
                
                if (!isMounted) return;
                handsRef.current = hands;

                // Initialize hands properly
                await hands.initialize();
                
                if (!isMounted) return;
                console.log("✅ Hands initialized");

                // Start camera
                if (videoRef.current) {
                    const camera = new window.Camera(videoRef.current, {
                        onFrame: async () => {
                            if (!isMounted || !handsRef.current) return;
                            try {
                                if (videoRef.current && videoRef.current.readyState === 4) {
                                    await handsRef.current.send({ image: videoRef.current });
                                }
                            } catch (err) {
                                if (!err.message?.includes('aborted')) {
                                    console.warn("⚠️ Frame processing error:", err);
                                }
                            }
                        },
                        width: 640,
                        height: 480,
                    });
                    
                    await camera.start();
                    
                    if (!isMounted) {
                        camera.stop();
                        return;
                    }
                    
                    cameraRef.current = camera;
                    console.log("✅ Camera started (Alphabet)");
                }

                if (isMounted) {
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("❌ Error initializing MediaPipe:", err);
                if (isMounted) {
                    setError(`Gagal memuat MediaPipe: ${err.message}. Coba refresh halaman.`);
                    isHandsLoaded.current = false;
                    setIsLoading(false);
                }
            }
        };

        init();

        return () => {
            isMounted = false;
            if (cameraRef.current) {
                cameraRef.current.stop();
                cameraRef.current = null;
            }
            if (handsRef.current) {
                handsRef.current.close();
                handsRef.current = null;
            }
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
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
                        <p className="text-white text-lg">Memuat model Huruf...</p>
                    </div>
                )}
                {error && <div className="absolute inset-0 flex items-center justify-center bg-red-800/80"><p className="text-white text-lg">{error}</p></div>}
            </div>

            <div className="bg-yellow-500 text-white p-4 rounded-xl shadow-lg w-full max-w-lg text-center">
                <p className="text-4xl font-extrabold mb-1">
                    {predictedLabel}
                </p>
                <p className="text-sm font-semibold">
                    {confidence > 0 ? `Keyakinan: ${confidence}%` : 'Menunggu Isyarat...'}
                </p>
            </div>

            <div className="text-sm text-gray-500 mt-4 text-center">
                <p>Mode Deteksi: HURUF (A-Z).</p>
                <p>Prediksi diperbarui setiap 0.4 detik.</p>
            </div>
        </div>
    );
}