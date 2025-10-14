"use client"
import { useRef, useState, useEffect } from "react"
import axios from "axios"

export default function QuizKamera({
  targetWord = "",
  predictUrl = "http://127.0.0.1:8000/predict",
  onFinish, // () => void
  onWrong,  // () => void
  tries = 0,
  showToast = true, // default true, bisa diatur dari parent
}) {
  const [cameraOn, setCameraOn] = useState(true)
  const [message, setMessage] = useState("")
  const [error, setError] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    async function enableCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) videoRef.current.srcObject = stream
        streamRef.current = stream
      } catch (err) {
        setError("Gagal mengakses kamera. Pastikan izin diaktifkan.")
      }
    }
    if (cameraOn) enableCamera()
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [cameraOn])

  useEffect(() => {
    if (!cameraOn) return
    const interval = setInterval(() => {
      captureAndPredict()
    }, 1000)
    return () => clearInterval(interval)
  }, [cameraOn, targetWord, tries])

  const captureAndPredict = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(async (blob) => {
      const formData = new FormData()
      formData.append("file", blob, "frame.jpg")

      try {
        const res = await axios.post(predictUrl, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })

        const predicted = String(res.data.predicted_label || "").toUpperCase()
        const target = String(targetWord).toUpperCase()

        if (predicted === target) {
          if (showToast) setMessage(`Jawaban benar: ${predicted}`)
          else setMessage("")
          if (typeof onFinish === "function") onFinish()
        } else if (predicted) {
          if (showToast) setMessage(`Prediksi: ${predicted} (belum sesuai)`)
          else setMessage("")
          if (typeof onWrong === "function") onWrong()
        }
      } catch (err) {
        // Tidak tampilkan error ke user jika showToast=false
        if (showToast) setError("Gagal mengirim ke server.")
        else setError(null)
        console.error(err)
      }
    }, "image/jpeg")
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => setCameraOn((v) => !v)}
        className={`px-3 py-2 rounded-md text-white ${cameraOn ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
      >
        {cameraOn ? "Matikan Kamera" : "Nyalakan Kamera"}
      </button>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        width={400}
        height={300}
        className="rounded-lg border border-gray-400 shadow-md bg-black"
      />
      <canvas ref={canvasRef} width={400} height={300} className="hidden" />
      {error && showToast && <p className="text-red-600">{error}</p>}
      {message && showToast && <p className="text-black">{message}</p>}
    </div>
  )
}