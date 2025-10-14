"use client";

import { useEffect, useState } from "react";
import QuizKamera from "@/components/quizKamera";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

// Helper untuk random dictionary selain yang benar
function getRandomOptions(dictionaryList, correctId, count = 3) {
  const filtered = dictionaryList.filter((d) => d.id !== correctId);
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default function PracticePage() {
  const [quiz, setQuiz] = useState(null);
  const [dictionaryList, setDictionaryList] = useState([]);
  const [idx, setIdx] = useState(0);
  const [tries, setTries] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const quizData = localStorage.getItem("current_quiz");
    if (quizData) {
      const parsed = JSON.parse(quizData);
      setQuiz(parsed);
    }
    async function fetchDictionary() {
      try {
        const res = await api.get("/public/kamus");
        if (res.data?.success && Array.isArray(res.data.data)) {
          setDictionaryList(res.data.data);
        }
      } catch { }
    }
    fetchDictionary();
  }, []);

  const total = quiz?.questions?.length || 0;
  const question = quiz?.questions?.[idx];

  // Untuk PILIH_GAMBAR
  const gambarOptions = question?.tipe_soal === "PILIH_GAMBAR"
    ? (() => {
      if (!dictionaryList.length || !question) return [];
      const correctDict = dictionaryList.find(d => d.id === question.dictionary_id);
      const randomDicts = getRandomOptions(dictionaryList, question.dictionary_id, 3);
      const options = [...randomDicts, correctDict].filter(Boolean);
      return options.sort(() => 0.5 - Math.random());
    })()
    : [];

  // Untuk TEBAK_GAMBAR
  const kataOptions = question?.tipe_soal === "TEBAK_GAMBAR"
    ? (() => {
      if (!dictionaryList.length || !question) return [];
      const correctDict = dictionaryList.find(d => d.id === question.dictionary_id);
      const randomDicts = getRandomOptions(dictionaryList, question.dictionary_id, 3);
      const options = [...randomDicts, correctDict].filter(Boolean);
      return options.sort(() => 0.5 - Math.random());
    })()
    : [];

  function handleAnswer(isCorrect) {
    if (isCorrect) {
      setCorrect((c) => c + 1);
    }
    if (idx + 1 < total) {
      setIdx(idx + 1);
      setTries(0);
    } else {
      setFinished(true);
    }
  }

  useEffect(() => {
    async function kirimHasil() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;
        const result = {
          sublevel_id: quiz?.sublevel_id,
          correct_answers: correct,
          total_score: correct * 10,
          total_questions: total,
        };
        await api.post(`/api/user/soal/sublevel/${quiz?.sublevel_id}/finish`, result, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch { }
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
    const safeCorrect = Math.min(correct, total);
    const result = {
      sublevel_id: quiz?.sublevel_id,
      correct_answers: safeCorrect,
      total_score: safeCorrect * 10,
      total_questions: total,
    };

    async function handleFinishQuiz() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;
        await api.post(`/api/user/soal/sublevel/${quiz?.sublevel_id}/finish`, result, {
          headers: { Authorization: `Bearer ${token}` },
        });
        router.push("/kelas");
      } catch { }
    }

    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-green-600 mb-2">Quiz Selesai!</h2>
          <div className="text-lg text-black">
            <div>Benar: {result.correct_answers} / {result.total_questions}</div>
            <div>Score: {result.total_score}</div>
          </div>
          {/* <pre className="bg-gray-100 text-black rounded p-4 mt-4 text-left text-xs">
            {JSON.stringify(result, null, 2)}
          </pre> */}
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

        {/* PILIH_GAMBAR */}
        {question.tipe_soal === "PILIH_GAMBAR" && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {gambarOptions.map((dict) => (
              <button
                key={dict.id}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition"
                onClick={() => handleAnswer(dict.id === question.dictionary_id)}
              >
                <img
                  src={dict.image_url_ref || "/images/default.jpg"}
                  alt={dict.word_text}
                  className="w-full h-32 object-cover"
                />
                <div className="p-2 text-center font-semibold">{dict.word_text}</div>
              </button>
            ))}
          </div>
        )}

        {/* TEBAK_GAMBAR */}
        {question.tipe_soal === "TEBAK_GAMBAR" && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {kataOptions.map((dict) => (
              <button
                key={dict.id}
                className="border rounded-lg p-4 text-lg font-bold hover:bg-green-50 transition"
                onClick={() => handleAnswer(dict.id === question.dictionary_id)}
              >
                {dict.word_text}
              </button>
            ))}
          </div>
        )}

        {/* OPEN_CAMERA */}
        {question.tipe_soal === "OPEN_CAMERA" && (
          <QuizKamera
            targetWord={question.dictionary_word}
            predictUrl={api.defaults.baseURL + "/predict"}
            onFinish={() => handleAnswer(true)}
            onWrong={() => handleAnswer(false)}
            tries={tries}
            showToast={false} // pastikan komponen QuizKamera tidak menampilkan toast
          />
        )}

        {/* Tombol Finish Quiz manual */}
        <button
          type="button"
          className="mt-6 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow transition w-full"
          onClick={() => setFinished(true)}
        >
          Finish Quiz
        </button>
      </div>
    </section>
  );
}