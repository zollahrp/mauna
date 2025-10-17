"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SibiAlphabetQuizCamera from "@/components/camera/SibiAlphabetQuizCamera";
import SibiNumberQuizCamera from "@/components/camera/SibiNumberQuizCamera";
import SibiSpellingQuizCamera from "@/components/camera/SibiSpellingQuizCamera";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// Helper untuk opsi acak
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
  const [flashColor, setFlashColor] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();

  // Ambil quiz dan kamus
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
  const currentQuestionType = question?.tipe_soal;

  const dictionaryItem = useMemo(() => {
    if (!dictionaryList.length || !question) return null;
    return dictionaryList.find((d) => d.id === question.dictionary_id);
  }, [dictionaryList, question]);

  const options = useMemo(() => {
    if (!dictionaryList.length || !question) return [];
    const correctDict = dictionaryList.find((d) => d.id === question.dictionary_id);
    const randomOptions = getRandomOptions(dictionaryList, question.dictionary_id, 3);
    const allOptions = [...randomOptions, correctDict].filter(Boolean);
    return allOptions.sort(() => 0.5 - Math.random());
  }, [dictionaryList, question]);

  // Flash sesuai hasil jawaban
  function handleAnswer(isCorrect) {
    if (isCorrect) {
      setCorrect((c) => c + 1);
      setFlashColor("green");
      setTimeout(() => {
        setFlashColor(null);
        if (idx + 1 < total) {
          setIdx(idx + 1);
          setTries(0);
        } else {
          setFinished(true);
          setTimeout(() => setShowAlert(true), 500);
        }
      }, 400);
    } else {
      setFlashColor("red");
      if (currentQuestionType === "OPEN_CAMERA") {
        setTimeout(() => setFlashColor(null), 400);
        return;
      }
      setTimeout(() => {
        setFlashColor(null);
        if (idx + 1 < total) {
          setIdx(idx + 1);
          setTries(0);
        } else {
          setFinished(true);
          setTimeout(() => setShowAlert(true), 500);
        }
      }, 400);
    }
  }

  function handleSkip() {
    setFlashColor("red");
    setTimeout(() => {
      setFlashColor(null);
      if (idx + 1 < total) {
        setIdx(idx + 1);
        setTries(0);
      } else {
        setFinished(true);
        setTimeout(() => setShowAlert(true), 500);
      }
    }, 400);
  }

  // Kirim hasil ke backend
  useEffect(() => {
    async function kirimHasil() {
      try {
        const token = localStorage.getItem("token");
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
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500 text-lg">
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
    // Calculate stars based on percentage
    // Determine message based on score
    const percentage = (safeCorrect / total) * 100;
    let message = "Good Job!";
    if (percentage === 100) {
      message = "Perfect!";
    } else if (percentage >= 80) {
      message = "Good Job!";
    } else if (percentage >= 60) {
      message = "Nice Try!";
    } else {
      message = "Keep Trying!";
    }

    async function handleFinishQuiz() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        await api.post(`/api/user/soal/sublevel/${quiz?.sublevel_id}/finish`, result, {
          headers: { Authorization: `Bearer ${token}` },
        });
        router.push("/kelas");
      } catch {}
    }

    return (
      <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[80vh] flex flex-col items-center justify-center"
      >

      <div className="max-w-3xl w-full text-center space-y-6 bg-[#FCFBFE] shadow-xl rounded-2xl p-8 border ">
        <div className="flex justify-center">
          <DotLottieReact
          src="https://lottie.host/56e5ab76-50c6-4c97-b4c6-32e8e90dc5b2/8246JlaQBQ.lottie" 
          loop
          preload="auto"
          autoplay
          className="md:w-52 md:h-52 w-40 h-40"
        />
        </div>

        {/* Stars */}
        {(() => {
        const pct = Math.max(
          0,
          Math.round(
          result.total_questions
            ? (result.correct_answers / result.total_questions) * 100
            : 0
          )
        );
        const starsCount = pct >= 70 ? 3 : pct >= 50 ? 2 : pct >= 35 ? 1 : 0;
        const starVariants = {
          hidden: { scale: 0, rotate: -180, opacity: 0 },
          show: (i) => ({
          scale: 1,
          rotate: 0,
          opacity: 1,
          transition: { 
            delay: 0.3 * i, 
            type: "spring", 
            stiffness: 200, 
            damping: 15 
          },
          }),
          shine: (i) => ({
          scale: [1, 1.2, 1],
          filter: [
            "brightness(1) drop-shadow(0 0 0px #FFD600)",
            "brightness(1.5) drop-shadow(0 0 15px #FFD600)",
            "brightness(1) drop-shadow(0 0 0px #FFD600)"
          ],
          transition: { 
            delay: 0.3 * i + 0.4,
            duration: 0.6,
            ease: "easeOut"
          },
          })
        };
        return (
          <motion.div
          initial="hidden"
          animate="show"
          className="flex items-center justify-center gap-3 mb-4"
          >
          {[0, 1, 2].map((i) => {
            const filled = i < starsCount;
            return (
            <motion.span
              key={i}
              custom={i}
              variants={starVariants}
              initial="hidden"
              animate={filled ? ["show", "shine"] : "show"}
              whileHover={filled ? { scale: 1.1, rotate: 10 } : {}}
              className="inline-flex"
            >
              {filled ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-12 h-12 text-[#FFD600]"
                fill="currentColor"
              >
                <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.556L19.336 24 12 19.897 4.664 24l1.636-8.694L.6 9.75l7.732-1.732L12 .587z" />
              </svg>
              ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-12 h-12 text-gray-300"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.556L19.336 24 12 19.897 4.664 24l1.636-8.694L.6 9.75l7.732-1.732L12 .587z" />
              </svg>
              )}
            </motion.span>
            );
          })}
          </motion.div>
        );
        })()}

        {/* Title */}
        <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-2xl md:text-3xl font-bold text-gray-900"
        >
        {message}
        </motion.div>

        {/* Stats boxes: jumlah soal, jawaban benar, skor (%) */}
        {(() => {
        const pct = Math.max(
          0,
          Math.round(
          result.total_questions
            ? (result.correct_answers / result.total_questions) * 100
            : 0
          )
        );
        const stats = [
          { label: "Jumlah Soal", value: result.total_questions ?? 0 },
          { label: "Jawaban Benar", value: result.correct_answers ?? 0 },
          { label: "Skor (%)", value: `${pct}%` },
        ];
        return (
          <div className="grid grid-cols-3 gap-3 w-full mt-2">
          {stats.map((s, i) => (
            <motion.div
            key={s.label}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.08 * i }}
            className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center"
            >
            <div className="text-sm text-gray-500">{s.label}</div>
            <div className="text-xl font-semibold text-gray-900 mt-1">
              {s.value}
            </div>
            </motion.div>
          ))}
          </div>
        );
        })()}

        {/* Finish button */}
        <div className="pt-4">
        <button
          onClick={handleFinishQuiz}
          className="px-6 py-3 rounded-xl bg-[#ffbb00] hover:bg-[#e6a800] text-white font-semibold shadow-md"
        >
          Selesai
        </button>
        </div>
      </div>
      </motion.div>
    );
  }

  return (
    <motion.section
      className="max-w-3xl mx-auto px-6 py-12 rounded-xl"
      animate={
        flashColor
          ? {
              backgroundColor:
                flashColor === "green"
                  ? ["#ffffff", "#dcfce7", "#ffffff"]
                  : ["#ffffff", "#fee2e2", "#ffffff"],
            }
          : {}
      }
      transition={{ duration: 0.4 }}
    >
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <motion.div
          className="bg-[#ffbb00] h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((idx + 1) / total) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{quiz.sublevel_name}</h1>
          <p className="text-sm text-gray-500">{quiz.level_name}</p>
        </div>
        <div className="text-sm font-medium text-gray-600">
          Soal {idx + 1} / {total}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          <p className="text-xl font-semibold text-gray-900 leading-relaxed">
            {question.question}
          </p>

          {/* Kamera */}
          {currentQuestionType === "OPEN_CAMERA" && (
            <div className="space-y-4">
              <div className="border rounded-xl p-5 bg-gray-50 shadow-sm">
                <p className="text-sm text-gray-700">
                  Target:{" "}
                  <span className="font-semibold text-gray-900">
                    {question.dictionary_word}
                  </span>
                </p>
                <p className="text-sm text-gray-500">{question.dictionary_definition}</p>
              </div>

              {(question.dictionary_category === "ALPHABET") && (
                <SibiAlphabetQuizCamera
                  targetWord={question.dictionary_word}
                  onFinish={() => handleAnswer(true)}
                  onWrong={() => handleAnswer(false)}
                />
              )}
              {question.dictionary_category === "KOSAKATA" && (
                <SibiSpellingQuizCamera
                  targetWord={question.dictionary_word}
                  onFinish={() => handleAnswer(true)}
                  onWrong={() => handleAnswer(false)}
                />
              )}
              {question.dictionary_category === "NUMBERS" && (
                <SibiNumberQuizCamera
                  targetAnswer={question.answer}
                  onFinish={() => handleAnswer(true)}
                  onWrong={() => handleAnswer(false)}
                />
              )}
            </div>
          )}

          {currentQuestionType === "TEBAK_GAMBAR" && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${question.image_url}`}
                  alt="Gambar isyarat"
                  className="rounded-xl border w-48 h-48 object-fit shadow-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {options.map((dict) => (
                  <button
                    key={dict.id}
                    className="rounded-xl border border-gray-300 py-3 px-4 text-gray-800 font-semibold hover:border-[#ffbb00] hover:bg-[#fff5d1] transition-all shadow-sm"
                    onClick={() => handleAnswer(dict.word_text === question.answer)}
                  >
                    {dict.word_text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pilihan Ganda */}
          {currentQuestionType === "PILIHAN_GANDA" && (
            <div className="grid grid-cols-2 gap-4">
              {options.map((dict) => {
                const isAnswerImage = question.answer && question.answer.startsWith("kamus/");
                const isAnswerVideo = question.answer && question.answer.includes(".webm");
                if (isAnswerImage) {
                  return (
                    <button
                      key={dict.id}
                      className="border rounded-xl overflow-hidden hover:shadow-md transition-all"
                      onClick={() =>
                        handleAnswer(`${process.env.NEXT_PUBLIC_API_URL}/storage/${dict.image_url_ref}` === `${process.env.NEXT_PUBLIC_API_URL}/storage/${question.answer}`)
                      }
                    >
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${dict.image_url_ref || "/images/default.jpg"}`}
                        alt={dict.word_text}
                        className="w-full h-full object-fit"
                      />
                    </button>
                  );
                } else if (isAnswerVideo) {
                  return (
                    <button
                      key={dict.id}
                      className="border rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col items-center"
                      onClick={() =>
                        handleAnswer(question.dictionary_video_url === question.answer)
                      }
                    >
                      <video
                        src={question.dictionary_video_url}
                        loop 
                        autoPlay 
                        muted
                        className="w-full h-32 object-fit"
                      />
                      <span className="mt-2 text-sm text-gray-700">{dict.word_text}</span>
                    </button>
                  );
                } else {
                  return (
                    <button
                      key={dict.id}
                      className="rounded-xl border border-gray-300 py-3 px-4 text-gray-800 font-medium hover:border-[#ffbb00] hover:bg-[#fff5d1] transition-all shadow-sm"
                      onClick={() =>
                        handleAnswer(dict.definition === question.answer)
                      }
                    >
                      {dict.definition}
                    </button>
                  );
                }
              })}
            </div>
          )}
          {currentQuestionType === "MATEMATIKA" && (
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-center text-gray-900">
                {question.question}
              </h2>
              <SibiNumberQuizCamera
                targetAnswer={question.answer}
                onFinish={() => handleAnswer(true)}
                onWrong={() => handleAnswer(false)}
              />
            </div>
          )}

          {/* Tombol */}
          <div className="pt-6 flex gap-4">
            <button
              className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-800 font-semibold hover:border-[#ffbb00] hover:bg-[#fff5d1] transition-all shadow-sm"
              onClick={handleSkip}
            >
              Skip Soal
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
}

