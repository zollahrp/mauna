"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import Image from "next/image"
import {
  Share2,
  LinkIcon,
  Heart,
  HeartOff,
  Download,
  ImageIcon,
  VideoIcon,
  RefreshCw,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import api from "@/lib/axios"

const fetcher = async (url) => {
  const r = await api.get(url, { cache: "no-store" })
  if (!r.data || !r.data.success) throw new Error("Gagal memuat data")
  return r.data.data
}

export default function DictionaryDetail({ params }) {
  const { id } = React.use(params)
  const apiBase = process.env.NEXT_PUBLIC_API_URL
  const endpoint = id && apiBase ? `${apiBase}/public/kamus/${id}` : null

  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher)

  const [tab, setTab] = useState("video")
  const [liked, setLiked] = useState(false)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((title, desc, type = "success") => {
    setToast({ title, desc, type })
    const t = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!id) return
    const raw = localStorage.getItem(`fav_${id}`)
    setLiked(raw === "1")
  }, [id])

  const onToggleLike = useCallback(() => {
    setLiked((prev) => {
      const next = !prev
      if (next) localStorage.setItem(`fav_${id}`, "1")
      else localStorage.removeItem(`fav_${id}`)
      showToast(next ? "Ditambahkan ke Favorit" : "Dihapus dari Favorit", data?.word_text ?? "Item")
      return next
    })
  }, [id, data?.word_text, showToast])

  const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/storage/` + (data?.image_url && data.image_url !== "" ? data.image_url : undefined)

  useEffect(() => {
    if (data && !data.video_url) setTab("image")
  }, [data])

  const createdAt = useMemo(() => {
    if (!data?.created_at) return "-"
    try {
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(data.created_at))
    } catch {
      return "-"
    }
  }, [data?.created_at])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      showToast("Tautan disalin", "")
    } catch {
      showToast("Gagal menyalin", "", "error")
    }
  }

  const shareLink = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: data?.word_text ?? "Kamus Isyarat",
          url: window.location.href,
        })
        showToast("Berhasil dibagikan", "")
      } else {
        await copyLink()
      }
    } catch {
      showToast("Gagal membagikan", "", "error")
    }
  }

  const downloadImage = async () => {
    try {
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${data?.word_text ?? "gambar"}.jpg`
      a.click()
      URL.revokeObjectURL(url)
      showToast("Gambar diunduh", "")
    } catch {
      showToast("Gagal mengunduh", "", "error")
    }
  }

  if (isLoading)
    return (
      <div className="animate-pulse text-gray-400 text-center py-10">
        Memuat data...
      </div>
    )

  if (error || !data)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-500">Gagal memuat detail kamus.</p>
        <button
          onClick={() => mutate()}
          className="mt-3 px-4 py-2 bg-[#ffbb00] text-white rounded-md hover:bg-[#e5a800] transition cursor-pointer"
        >
          <RefreshCw className="inline size-4 mr-2" /> Coba Lagi
        </button>
      </div>
    )

  return (
    <div className="min-h-screen bg-white px-6 py-10 font-poppins  transition-all duration-300">
      {/* Tombol kembali */}
      <Link href="/kelas/dictionary">
        <div className="inline-flex items-center text-sm text-gray-600 hover:text-[#ffbb00] transition cursor-pointer">
          <ArrowLeft className="size-4 mr-2" /> Kembali ke Kamus
        </div>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kolom media */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setTab("video")}
              disabled={!data.video_url}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition cursor-pointer ${tab === "video"
                ? "bg-[#ffbb00] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } ${!data.video_url && "opacity-50 cursor-not-allowed"}`}
            >
              <VideoIcon className="size-4" /> Video
            </button>
            <button
              onClick={() => setTab("image")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition cursor-pointer ${tab === "image"
                ? "bg-[#ffbb00] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              <ImageIcon className="size-4" /> Gambar
            </button>
          </div>

          {/* Konten media */}
          {tab === "video" && data.video_url ? (
            <video
              src={data.video_url}
              controls
              className="rounded-lg w-full aspect-video bg-gray-100"
            />
          ) : (
            imageUrl && (
              <div
                className="relative group cursor-pointer"
                onClick={() => setZoomOpen(true)}
              >
                <Image
                  src={imageUrl}
                  alt={data.word_text}
                  width={1280}
                  height={720}
                  className="rounded-lg h-full object-fit"
                  unoptimized
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition">
                  <span className="text-white text-sm opacity-0 group-hover:opacity-100">
                    Klik untuk perbesar
                  </span>
                </div>
              </div>
            )
          )}

          {/* Tombol aksi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
            <Button onClick={copyLink}>
              <LinkIcon /> Salin
            </Button>
            <Button onClick={shareLink}>
              <Share2 /> Bagikan
            </Button>
            {imageUrl && (
              <Button onClick={downloadImage}>
                <Download /> Unduh
              </Button>
            )}
          </div>
        </div>

        {/* Kolom detail */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-3">
          <h1 className="text-2xl font-semibold text-gray-900">{data.word_text}</h1>
          <p className="text-gray-600 leading-relaxed">{data.definition}</p>
          <div className="grid grid-cols-2 lg:grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <InfoItem label="Kategori" value={data.category || "-"} />
            <InfoItem label="Tanggal" value={createdAt} />
            {data.total_soal && <InfoItem label="Total Soal" value={data.total_soal} />}
          </div>
        </div>
      </div>

      {/* Zoom modal */}
      {zoomOpen && imageUrl && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 cursor-pointer"
          onClick={() => setZoomOpen(false)}
        >
          <Image
            src={imageUrl}
            alt={data.word_text}
            width={1600}
            height={900}
            className="max-h-[90vh] w-auto rounded-lg shadow-lg"
            unoptimized
          />
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-lg shadow-md text-sm ${toast.type === "error"
            ? "bg-red-50 text-red-600 border border-red-200"
            : "bg-white text-gray-700 border border-gray-200"
            }`}
        >
          {toast.title}
        </div>
      )}
    </div>
  )
}

function InfoItem({ label, value }) {
  return (
    <div className="border border-gray-100 rounded-lg bg-gray-50 px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  )
}

function Button({ children, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer ${active
        ? "bg-[#ffbb00] text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
    >
      {children}
    </button>
  )
}
