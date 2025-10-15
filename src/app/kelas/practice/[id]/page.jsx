"use client";

import { useEffect, useState, useMemo } from "react";
import SibiAlphabetQuizCamera from "@/components/camera/SibiAlphabetQuizCamera";
import SibiNumberQuizCamera from "@/components/camera/SibiNumberQuizCamera";
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
      setQuiz(parsed.data || parsed);
    }
    async function fetchDictionary() {
      try {
        const res = await api.get("/public/kamus");
        if (res.data?.success && Array.isArray(res.data.data)) {
          setDictionaryList(res.data.data);
        }
      } catch {}
    }
    fetchDictionary();
  }, []);

  const total = quiz?.total_questions || 0;
  const question = quiz?.questions?.[idx];

  const dictionaryItem = useMemo(() => {
    if (!dictionaryList.length || !question) return null;
    return dictionaryList.find(d => d.id === question.dictionary_id);
  }, [dictionaryList, question]);

  const currentQuestionType = question?.tipe_soal;

  // Logika baru untuk membuat opsi pilihan ganda
  const options = useMemo(() => {
    if (!dictionaryList.length || !question) return [];

    const correctDict = dictionaryList.find(d => d.id === question.dictionary_id);
    const randomOptions = getRandomOptions(dictionaryList, question.dictionary_id, 3);
    
    // Gabungkan jawaban yang benar dengan 3 jawaban acak
    const allOptions = [...randomOptions, correctDict].filter(Boolean);
    
    // Acak urutan opsi agar jawaban benar tidak selalu di posisi yang sama
    return allOptions.sort(() => 0.5 - Math.random());
  }, [dictionaryList, question]);

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
      } catch {}
    }
    if (finished && quiz) kirimHasil();
  }, [finished, quiz, correct, total]);

  if (!quiz || !question) {
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
      } catch {}
    }

    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-green-600 mb-2">Quiz Selesai!</h2>
          <div className="text-lg text-black">
            <div>Benar: {result.correct_answers} / {result.total_questions}</div>
            <div>Score: {result.total_score}</div>
          </div>
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
        
        {/* TIPE SOAL OPEN_CAMERA */}
        {currentQuestionType === "OPEN_CAMERA" && (
            <>
                <div className="rounded-lg bg-muted p-3 mb-2">
                    <p className="text-sm font-medium text-black">
                        Target: <span className="font-bold">{question.dictionary_word}</span>
                    </p>
                    <p className="text-sm text-muted-foreground text-black">
                        {question.dictionary_definition}
                    </p>
                </div>
                {question.dictionary_category === "ALPHABET" && (
                    <SibiAlphabetQuizCamera
                        targetWord={question.dictionary_word}
                        onFinish={() => handleAnswer(true)}
                        onWrong={() => setTries(tries + 1)}
                    />
                )}
                {question.dictionary_category === "NUMBERS" && (
                    <SibiNumberQuizCamera
                        targetAnswer={question.answer}
                        onFinish={() => handleAnswer(true)}
                        onWrong={() => setTries(tries + 1)}
                    />
                )}
            </>
        )}

        {/* TIPE SOAL TEBAK_GAMBAR */}
        {currentQuestionType === "TEBAK_GAMBAR" && (
            <>
                <div className="flex justify-center mb-4">
                    <img
                        src={`${question.image_url}`}
                        alt="Gambar isyarat"
                        className="rounded-lg border w-48 h-48 object-cover bg-gray-100"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    {options.map((dict) => (
                        <button
                            key={dict.id}
                            className="border rounded-lg p-4 text-lg text-black font-bold hover:bg-green-50 transition"
                            onClick={() => handleAnswer(dict.word_text === question.answer)}
                        >
                            {dict.word_text}
                        </button>
                    ))}
                </div>
            </>
        )}

        {/* TIPE SOAL PILIHAN_GANDA */}
        {currentQuestionType === "PILIHAN_GANDA" && (
            <div className="grid grid-cols-2 text-black gap-4 mt-4">
                {options.map((dict) => {
                    const isAnswerAnImage = question.answer && question.answer.includes('://');

                    if (isAnswerAnImage) {
                        return (
                            <button
                                key={dict.id}
                                className="border rounded-lg overflow-hidden hover:shadow-lg transition"
                                onClick={() => handleAnswer(`${dict.image_url_ref}` === question.answer)}
                            >
                                <img
                                    src={`${dict.image_url_ref || "/images/default.jpg"}`}
                                    alt={dict.word_text}
                                    className="w-full h-32 object-cover"
                                />
                            </button>
                        );
                    } else {
                        return (
                            <button
                                key={dict.id}
                                className="border rounded-lg p-4 text-sm text-black font-bold hover:bg-green-50 transition"
                                onClick={() => handleAnswer(dict.definition === question.answer)}
                            >
                                {dict.definition}
                            </button>
                        );
                    }
                })}
            </div>
        )}

        {/* TIPE SOAL MATEMATIKA */}
        {currentQuestionType === "MATEMATIKA" && (
            <>
                <div className="rounded-lg bg-blue-50 p-6 mb-4">
                    <h2 className="text-4xl text-black font-bold text-center">
                        {question.question}
                    </h2>
                </div>
                <SibiNumberQuizCamera
                    targetAnswer={question.answer}
                    onFinish={() => handleAnswer(true)}
                    onWrong={() => setTries(tries + 1)}
                />
            </>
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