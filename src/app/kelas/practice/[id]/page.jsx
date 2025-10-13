"use client";

import { useEffect, useState } from "react";
import QuizKamera from "@/components/quizKamera";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function PracticePage() {
  const [quiz, setQuiz] = useState(null);
  const [idx, setIdx] = useState(0); // soal index
  const [wordIdx, setWordIdx] = useState(0); // index kata pada soal
  const [tries, setTries] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loadingWord, setLoadingWord] = useState(true);
  const [wordProgress, setWordProgress] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const quizData = localStorage.getItem("current_quiz");
    if (quizData) setQuiz(JSON.parse(quizData));
  }, []);

  useEffect(() => {
    // Jeda 1 detik sebelum mulai kata baru
    setLoadingWord(true);
    const timer = setTimeout(() => {
      setLoadingWord(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [idx, wordIdx]);

  useEffect(() => {
    // Reset progress kata saat pindah soal
    if (quiz) {
      const question = quiz.questions[idx];
      const words = question?.dictionary_word?.split(" ") || [];
      setWordProgress(Array(words.length).fill(false));
      setWordIdx(0);
    }
  }, [idx, quiz]);

  const total = quiz?.questions?.length || 0;
  const question = quiz?.questions?.[idx];
  const words = question?.dictionary_word?.split(" ") || [];
  const currentWord = words[wordIdx] || "";

  function handleWordCorrect() {
    // Tandai kata sudah benar
    const newProgress = [...wordProgress];
    newProgress[wordIdx] = true;
    setWordProgress(newProgress);

    if (wordIdx + 1 < words.length) {
      setWordIdx(wordIdx + 1);
      setTries(0);
    } else {
      // Semua kata sudah benar, lanjut ke soal berikutnya
      setCorrect((c) => c + 1);
      setTries(0);
      if (idx + 1 < total) {
        setIdx(idx + 1);
      } else {
        setFinished(true);
      }
    }
  }

  function handleWordWrong() {
    if (tries + 1 >= 3) {
      setTries(0);
      if (wordIdx + 1 < words.length) {
        setWordIdx(wordIdx + 1);
      } else {
        if (idx + 1 < total) {
          setIdx(idx + 1);
        } else {
          setFinished(true);
        }
      }
    } else {
      setTries(tries + 1);
      toast.error(`Percobaan ke-${tries + 1} salah. Maksimal 3x percobaan.`);
    }
  }

  useEffect(() => {
    async function kirimHasil() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          toast.error("Anda harus login terlebih dahulu.");
          return;
        }
        const result = {
          sublevel_id: quiz.sublevel_id,
          correct_answers: correct,
          total_score: correct * 10,
          total_questions: total,
        };
        const res = await api.post(`/api/user/soal/sublevel/${quiz.sublevel_id}/finish`, result, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 200) {
          toast.success("Hasil quiz berhasil dikirim.");
        } else {
          toast.error("Gagal mengirim hasil quiz.");
        }
      } catch {
        toast.error("Terjadi kesalahan. Silakan coba lagi.");
      }
    }
    if (finished && quiz) kirimHasil();
  }, [finished, quiz, correct, total]);

  if (!quiz) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-muted-foreground">
        Quiz tidak ditemukan.
      </div>
    );
  }

  if (finished) {
    const result = {
      sublevel_id: quiz.sublevel_id,
      correct_answers: correct,
      total_score: correct * 10,
      total_questions: total,
    };

    async function handleFinishQuiz() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          toast.error("Anda harus login terlebih dahulu.");
          return;
        }
        const res = await api.post(`/api/user/soal/sublevel/${quiz.sublevel_id}/finish`, result, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 200) {
          toast.success("Hasil quiz berhasil dikirim.");
          router.push("/kelas");
        } else {
          toast.error("Gagal mengirim hasil quiz.");
        }
      } catch (error) {
        toast.error("Terjadi kesalahan. Silakan coba lagi.");
        console.error(error);
      }
    }

    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-green-600 mb-2">Quiz Selesai!</h2>
          <div className="text-lg text-black">
            <div>Benar: {result.correct_answers} / {result.total_questions}</div>
            <div>Score: {result.total_score}</div>
          </div>
          <pre className="bg-gray-100 text-black rounded p-4 mt-4 text-left text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
          <button
            type="button"
            className="mt-4 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow transition"
            onClick={handleFinishQuiz}
          >
            Finish Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl text-black font-bold">{quiz.sublevel_name}</h1>
          <p className="text-sm text-black text-muted-foreground">{quiz.level_name}</p>
        </div>
        <div className="text-sm text-black font-medium">
          Soal {idx + 1} / {total}
        </div>
      </div>
      <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
        <p className="text-lg text-black font-semibold">{question.question}</p>
        <div className="rounded-lg bg-muted p-3 mb-2">
          <p className="text-sm font-medium text-black">
            Target:{" "}
            <span className="font-bold">
              {question.dictionary_word}
            </span>
          </p>
          <p className="text-sm text-muted-foreground text-black">
            {question.dictionary_definition}
          </p>
        </div>
        <div className="flex justify-center gap-2 mb-4">
          {words.map((w, i) => (
            <span
              key={i}
              className={`text-xl font-bold px-3 py-2 rounded-lg border
                ${wordProgress[i] ? "bg-green-200 border-green-400 text-green-700" : i === wordIdx ? "bg-yellow-100 border-yellow-400 text-yellow-700" : "bg-gray-100 border-gray-300 text-gray-400"}
              `}
            >
              {wordProgress[i] ? w : "_".repeat(w.length)}
            </span>
          ))}
        </div>
        <div>
          {loadingWord ? (
            <div className="text-center text-sm text-muted-foreground py-6">Menyiapkan kata berikutnya...</div>
          ) : (
            <QuizKamera
              targetWord={currentWord}
              predictUrl={api.defaults.baseURL + "/predict"}
              onFinish={handleWordCorrect}
              onWrong={handleWordWrong}
              tries={tries}
            />
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Percobaan: {tries + 1} / 3
          </p>
          <button
            type="button"
            className="mt-4 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow transition"
            onClick={() => setFinished(true)}
          >
            Finish Quiz
          </button>
        </div>
      </div>
    </section>
  );
}