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
  Play,
  ImageIcon,
  VideoIcon,
  RefreshCw,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import api from "@/lib/axios"

// SWR fetcher untuk API yang mengembalikan { success, data }
const fetcher = async (url) => {
  const r = await api.get(url, { cache: "no-store" })
  if (!r.data || !r.data.success) throw new Error("Gagal memuat data")
  return r.data.data
}

export default function DictionaryDetail({ params }) {
  // Perbaikan: gunakan React.use() untuk unwrap params
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
    const t = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!id) return
    try {
      const raw = localStorage.getItem(`fav_${id}`)
      setLiked(raw === "1")
    } catch { }
  }, [id])

  const onToggleLike = useCallback(() => {
    setLiked((prev) => {
      const next = !prev
      try {
        if (next) localStorage.setItem(`fav_${id}`, "1")
        else localStorage.removeItem(`fav_${id}`)
      } catch { }
      showToast(next ? "Ditambahkan ke Favorit" : "Dihapus dari Favorit", data?.word_text ?? "Item")
      return next
    })
  }, [id, data?.word_text, showToast])

  // Gunakan langsung image_url dari API
  const imageUrl = data?.image_url && data.image_url !== "" ? data.image_url : undefined;


  useEffect(() => {
    if (data && !data.video_url) setTab("image")
  }, [data])

  // Format tanggal jika ada (tidak ada di contoh json, jadi fallback)
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
      showToast("Tautan disalin", "URL halaman telah disalin ke clipboard.")
    } catch {
      showToast("Gagal menyalin", "Silakan coba lagi.", "error")
    }
  }

  const shareLink = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: data?.word_text ?? "Kamus Isyarat",
          url: window.location.href,
        })
        showToast("Dibagikan", "Berhasil membuka dialog bagikan.")
      } else {
        await copyLink()
      }
    } catch {
      showToast("Gagal membagikan", "Silakan coba lagi.", "error")
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
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      showToast("Unduhan dimulai", "Gambar sedang diunduh.")
    } catch {
      showToast("Gagal mengunduh", "Silakan coba lagi.", "error")
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-card p-3">
          <div className="aspect-video w-full rounded-md bg-muted/60 animate-pulse" />
          <div className="mt-3 h-8 w-56 rounded bg-muted/60 animate-pulse" />
        </div>
        <div className="space-y-3">
          <div className="h-8 w-72 rounded bg-muted/60 animate-pulse" />
          <div className="h-20 w-full rounded bg-muted/60 animate-pulse" />
          <div className="h-4 w-40 rounded bg-muted/60 animate-pulse" />
          <div className="h-4 w-48 rounded bg-muted/60 animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border bg-card p-6 flex flex-col items-center justify-center text-center gap-3">
        <p className="text-muted-foreground">Gagal memuat detail kamus.</p>
        <button
          onClick={() => mutate()}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm bg-background hover:bg-accent transition-colors"
        >
          <RefreshCw className="size-4" /> Coba lagi
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tombol Kembali */}
      <div>
        <Link href="/kelas/dictionary" className="inline-flex">
          <button
            className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm bg-background hover:bg-accent transition-colors"
            title="Kembali ke Kamus"
          >
            <ArrowLeft className="size-4" /> Kembali
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6">
        {/* Kolom Media */}
        <div className="rounded-lg border bg-card p-3">
          <div className="inline-flex rounded-md border bg-muted/40 p-0.5">
            <button
              type="button"
              onClick={() => setTab("video")}
              disabled={!data.video_url}
              title={data.video_url ? "Tampilkan Video" : "Video tidak tersedia"}
              className={
                "inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors " +
                (tab === "video"
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground") +
                (!data.video_url ? " opacity-50 cursor-not-allowed" : "")
              }
              aria-pressed={tab === "video"}
            >
              <VideoIcon className="size-4" />
              <span className="hidden sm:inline">Video</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("image")}
              className={
                "inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors " +
                (tab === "image"
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground")
              }
              aria-pressed={tab === "image"}
            >
              <ImageIcon className="size-4" />
              <span className="hidden sm:inline">Gambar</span>
            </button>
          </div>

          {/* Konten Video */}
          {tab === "video" && data.video_url && (
            <div className="mt-3 relative rounded-lg overflow-hidden">
              <video src={data.video_url} controls className="w-full aspect-video bg-foreground/10 rounded-lg" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="hidden sm:flex items-center gap-2 rounded-full bg-foreground/60 text-background px-3 py-1.5">
                  <Play className="size-4" />
                  <span className="text-sm">Putar / Jeda</span>
                </div>
              </div>
            </div>
          )}


          {/* Konten Gambar */}
          {tab === "image" && imageUrl && (
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="group w-full focus:outline-none mt-3"
              title="Klik untuk perbesar"
            >
              <div className="relative w-full rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={data.word_text}
                  width={1280}
                  height={720}
                  className="w-full h-auto object-cover aspect-video"
                  unoptimized
                />
                <div className="absolute inset-0 grid place-items-center bg-foreground/0 group-hover:bg-foreground/10 transition-colors">
                  <span className="text-background text-sm hidden sm:block">Klik untuk perbesar</span>
                </div>
              </div>
            </button>
          )}

          {/* Action Bar */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={onToggleLike}
              className={
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors " +
                (liked
                  ? "bg-primary text-primary-foreground border border-primary"
                  : "border bg-background hover:bg-accent")
              }
              title={liked ? "Hapus dari Favorit" : "Tambah ke Favorit"}
            >
              {liked ? <Heart className="size-4" /> : <HeartOff className="size-4" />}
              {liked ? "Favorit" : "Bukan Favorit"}
            </button>

            <button
              onClick={copyLink}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm bg-background hover:bg-accent transition-colors"
              title="Salin tautan"
            >
              <LinkIcon className="size-4" />
              Salin
            </button>

            <button
              onClick={shareLink}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm bg-background hover:bg-accent transition-colors"
              title="Bagikan"
            >
              <Share2 className="size-4" />
              Bagikan
            </button>

            <button
              onClick={downloadImage}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm bg-background hover:bg-accent transition-colors"
              title="Unduh gambar"
            >
              <Download className="size-4" />
              Unduh
            </button>
          </div>
        </div>

        {/* Kolom Detail */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h1 className="text-3xl text-black font-semibold text-balance">{data.word_text}</h1>
          <p className="text-muted-foreground text-black leading-relaxed">{data.definition}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
            <InfoItem label="Kategori" value={data.category || "-"} />
            <InfoItem label="Dibuat" value={createdAt} />
            <InfoItem label="Total Soal" value={typeof data.total_soal === "number" ? String(data.total_soal) : "-"} />
          </div>


          {/* Gambar kecil sebagai pratinjau jika tab video aktif */}
          {tab === "video" && imageUrl && (
            <button
              type="button"
              onClick={() => setTab("image")}
              className="group inline-flex items-center text-black gap-2 rounded-lg border p-2 hover:bg-accent transition-colors"
              title="Lihat gambar referensi"
            >
              <div className="relative size-12 overflow-hidden rounded">
                <Image
                  src={imageUrl}
                  alt={data.word_text}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
              <span className="text-sm text-muted-foreground text-black group-hover:text-foreground">Lihat gambar referensi</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal Zoom Gambar */}
      {zoomOpen && imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-foreground/70 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setZoomOpen(false)}
        >
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={imageUrl}
              alt={data.word_text}
              width={1600}
              height={900}
              className="w-full h-auto rounded-lg object-contain"
              unoptimized
            />
            <button
              className="absolute top-3 right-3 rounded-md border bg-background/90 px-3 py-1.5 text-sm hover:bg-accent transition-colors"
              onClick={() => setZoomOpen(false)}
              aria-label="Tutup"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Toast sederhana */}
      {toast && (
        <div
          className={
            "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-md border px-4 py-2 text-sm shadow bg-background/95 " +
            (toast.type === "error" ? "border-destructive text-destructive" : "border-border")
          }
          role="status"
          aria-live="polite"
        >
          <div className="font-medium">{toast.title}</div>
          {toast.desc ? <div className="text-muted-foreground">{toast.desc}</div> : null}
        </div>
      )}
    </div>
  )
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-lg text-black border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}