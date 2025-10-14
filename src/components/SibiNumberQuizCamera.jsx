"use client";
import { useRef, useState, useEffect, useMemo } from "react";

export default function SibiNumberQuizCamera() {
  // Generate random arithmetic question
  const generateQuestion = () => {
    const operations = ['+', '-', 'x'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer;
    
    // Ensure answer is always 0-9
    do {
      switch(op) {
        case '+':
          num1 = Math.floor(Math.random() * 5) + 1; // 1-5
          num2 = Math.floor(Math.random() * 5) + 1; // 1-5
          answer = num1 + num2;
          break;
        case '-':
          num1 = Math.floor(Math.random() * 9) + 1; // 1-9
          num2 = Math.floor(Math.random() * num1); // 0 to num1-1
          answer = num1 - num2;
          break;
        case 'x':
          num1 = Math.floor(Math.random() * 3) + 2; // 2-4
          num2 = Math.floor(Math.random() * 3) + 1; // 1-3
          answer = num1 * num2;
          break;
      }
    } while (answer > 9 || answer < 0);
    
    return {
      question: `${num1} ${op} ${num2}`,
      answer: answer.toString()
    };
  };

  const initialQuestion = useMemo(() => generateQuestion(), []);
  const [currentQuestion, setCurrentQuestion] = useState(initialQuestion);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const videoRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const lastSentRef = useRef(0);
  const targetAnswerRef = useRef(initialQuestion.answer);

  // Update ref when question changes
  useEffect(() => {
    targetAnswerRef.current = currentQuestion.answer;
  }, [currentQuestion]);

  // === 1. Setup Mediapipe Hands ===
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
        isCorrect) {
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
    if (isCorrect) return;
    
    try {
      const res = await fetch("http://127.0.0.1:8000/predict/number", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vector }),
      });

      const data = await res.json();
      
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
        setIsCorrect(true);
        setScore(score + 1);
        setTotalQuestions(totalQuestions + 1);
        setMessage(`✅ Benar! Jawabannya ${targetAnswer}`);
        
        // Next question after 2 seconds
        setTimeout(() => {
          const newQuestion = generateQuestion();
          setCurrentQuestion(newQuestion);
          setIsCorrect(false);
          setMessage("");
        }, 2000);
      } else {
        setMessage(`Tunjukkan jawabannya dengan bahasa isyarat`);
      }
    } catch (err) {
      console.error("Prediction error:", err);
      setError("Gagal mengirim data ke server. Pastikan backend berjalan.");
    }
  };

  // === 5. UI ===
  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-white min-h-screen">
      <h1 className="text-2xl font-bold text-black mb-2">SIBI Quiz - Angka</h1>
      
      <div className="bg-blue-50 rounded-lg p-6 mb-4">
        <h2 className="text-4xl text-black font-bold text-center">
          {currentQuestion.question} = ?
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

      <div className="bg-gray-50 rounded-lg px-4 py-2 mt-4">
        <p className="text-lg text-black font-semibold">
          Skor: {score} / {totalQuestions}
        </p>
      </div>

      <div className="text-sm text-gray-500 mt-4 text-center">
        <p>Tunjukkan angka jawaban dengan bahasa isyarat</p>
        <p>Prediksi akan dilakukan setiap 1 detik</p>
      </div>
    </div>
  );
}