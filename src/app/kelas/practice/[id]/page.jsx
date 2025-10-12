"use client";

import { useEffect, useState } from "react";
import QuizKamera from "@/components/quizKamera";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
// ...existing code...

export default function PracticePage() {
  const [quiz, setQuiz] = useState(null);
  const [idx, setIdx] = useState(0);
  const [tries, setTries] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const quizData = localStorage.getItem("current_quiz");
    if (quizData) setQuiz(JSON.parse(quizData));
  }, []);

  const total = quiz?.questions?.length || 0;
  const question = quiz?.questions?.[idx];

  function handleCorrect() {
    setCorrect((c) => c + 1);
    setTries(0);
    if (idx + 1 < total) {
      setIdx(idx + 1);
    } else {
      setFinished(true);
    }
  }

  function handleWrong() {
    if (tries + 1 >= 3) {
      setTries(0);
      if (idx + 1 < total) {
        setIdx(idx + 1);
      } else {
        setFinished(true);
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
        console.log("Hasil quiz terkirim:", res.data);
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
            Target: <span className="font-bold">{question.dictionary_word}</span>
          </p>
          <p className="text-sm text-muted-foreground text-black">
            {question.dictionary_definition}
          </p>
        </div>
        <div>
          <QuizKamera
            targetWord={question.dictionary_word}
            predictUrl={api.defaults.baseURL + "/predict"}
            onFinish={handleCorrect}
            onWrong={handleWrong}
            tries={tries}
          />
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