'use client'

import { useState, useRef } from 'react'
import { X, Sparkles, Upload, Loader2, RotateCcw, Download } from 'lucide-react'

type Props = {
  productName: string
  garmentImageUrl: string
  onClose: () => void
}

type Status = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

export default function VirtualTryOnModal({ productName, garmentImageUrl, onClose }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      // Resize to max 1024px and compress to JPEG before sending
      const img = new Image()
      img.onload = () => {
        const MAX = 1024
        const scale = Math.min(1, MAX / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        setPreview(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  async function handleTryOn() {
    if (!preview) return
    setStatus('uploading')
    setErrorMsg('')

    try {
      // Start try-on
      const res = await fetch('/api/try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_image: preview,          // base64 data URL
          garment_image: garmentImageUrl, // WooCommerce product image URL
        }),
      })

      const { id, error } = await res.json()
      if (error || !id) throw new Error(error ?? 'Erro ao iniciar')

      setStatus('processing')

      // Poll for result
      let attempts = 0
      const maxAttempts = 40 // ~60s timeout

      while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 1500))
        const poll = await fetch(`/api/try-on/status?id=${id}`)
        const data = await poll.json()

        if (data.status === 'completed') {
          const output = Array.isArray(data.output) ? data.output[0] : data.output
          setResult(output)
          setStatus('done')
          return
        }

        if (data.status === 'failed' || data.error) {
          throw new Error(data.error ?? 'Processamento falhou')
        }

        attempts++
      }

      throw new Error('Tempo limite atingido. Tente novamente.')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro desconhecido')
      setStatus('error')
    }
  }

  function reset() {
    setStatus('idle')
    setPreview(null)
    setResult(null)
    setErrorMsg('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-background w-full max-w-lg pointer-events-auto animate-fade-up shadow-2xl max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-secondary" />
              <span className="font-display text-lg font-semibold">Provador Virtual</span>
            </div>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors active:scale-95">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6">

            {/* Result */}
            {status === 'done' && result && (
              <div className="space-y-4">
                <p className="text-sm text-center text-muted-foreground">Veja como o jaleco fica em você!</p>
                <div className="relative overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result} alt="Resultado do provador virtual" className="w-full object-cover" />
                </div>
                <div className="flex gap-3">
                  <a
                    href={result}
                    download="provador-jaleca.png"
                    className="flex-1 inline-flex items-center justify-center gap-2 border border-border py-3 text-xs font-semibold tracking-wide uppercase hover:bg-muted transition-colors"
                  >
                    <Download size={14} /> Salvar imagem
                  </a>
                  <button
                    onClick={reset}
                    className="flex-1 inline-flex items-center justify-center gap-2 border border-border py-3 text-xs font-semibold tracking-wide uppercase hover:bg-muted transition-colors"
                  >
                    <RotateCcw size={14} /> Tentar outra foto
                  </button>
                </div>
              </div>
            )}

            {/* Processing */}
            {status === 'processing' || status === 'uploading' ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 size={36} className="text-primary animate-spin" />
                <p className="text-sm text-muted-foreground text-center">
                  {status === 'uploading' ? 'Enviando imagem…' : 'A IA está vestindo o jaleco em você…'}
                  <br />
                  <span className="text-xs">Isso pode levar alguns segundos</span>
                </p>
              </div>
            ) : null}

            {/* Upload + idle/error */}
            {(status === 'idle' || status === 'error') && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* Garment preview */}
                  <div>
                    <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">Produto</p>
                    <div className="aspect-[3/4] overflow-hidden rounded-xl bg-secondary/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={garmentImageUrl} alt={productName} className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* User photo upload */}
                  <div>
                    <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">Sua foto</p>
                    <div
                      className="aspect-[3/4] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                      onClick={() => inputRef.current?.click()}
                      onDrop={onDrop}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt="Sua foto" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <div className="text-center p-3">
                          <Upload size={20} className="text-muted-foreground mx-auto mb-2" />
                          <p className="text-[11px] text-muted-foreground leading-relaxed">Arraste ou clique para adicionar sua foto</p>
                        </div>
                      )}
                    </div>
                    <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                  </div>
                </div>

                {status === 'error' && (
                  <p className="text-xs text-red-500 text-center">{errorMsg}</p>
                )}

                <p className="text-[11px] text-muted-foreground text-center">
                  Use uma foto de corpo inteiro com fundo claro para melhor resultado
                </p>

                <button
                  onClick={handleTryOn}
                  disabled={!preview}
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 text-xs font-semibold tracking-widest uppercase transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Sparkles size={14} />
                  Experimentar Agora
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
