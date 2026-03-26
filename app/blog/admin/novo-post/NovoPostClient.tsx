'use client'

import { useState, useRef } from 'react'
import {
  Loader2, CheckCircle2, XCircle, AlertCircle, RefreshCw,
  Eye, EyeOff, Sparkles, BookOpen, Image as ImageIcon, Plus, Trash2, Upload,
} from 'lucide-react'
import type { SEOAnalysis } from '@/lib/ai-content'

// ─── Types ───────────────────────────────────────────────────────────────────

type ContentType = 'blog' | 'lookbook' | null

type GenerationStep = {
  id: number
  label: string
  status: 'pending' | 'loading' | 'done' | 'error'
}

type GeneratedResult = {
  title: string
  content: string
  excerpt: string
  metaDescription: string
  slug: string
  suggestedKeywords: string[]
  seoScore: number
  seoAnalysis: SEOAnalysis
  imageUrl: string | null
  imageAuthor: { name: string; link: string } | null
}

type LookProduct = { name: string; slug: string; price: string }

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS: GenerationStep[] = [
  { id: 1, label: 'Gerando conteúdo...', status: 'pending' },
  { id: 2, label: 'Humanizando texto...', status: 'pending' },
  { id: 3, label: 'Analisando SEO...', status: 'pending' },
  { id: 4, label: 'Buscando imagem...', status: 'pending' },
  { id: 5, label: 'Concluído!', status: 'pending' },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function SEOScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
  const textColor = score >= 80 ? 'text-green-700' : score >= 60 ? 'text-yellow-700' : 'text-red-700'
  const bgColor = score >= 80 ? 'bg-green-50' : score >= 60 ? 'bg-yellow-50' : 'bg-red-50'
  return (
    <div className={`p-4 border ${bgColor} mb-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Score SEO</span>
        <span className={`text-2xl font-bold ${textColor}`}>{score}/100</span>
      </div>
      <div className="h-2 bg-secondary/30 w-full">
        <div className={`h-2 ${color} transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

function SEOItem({ label, value, issues }: { label: string; value: string; issues: string[] }) {
  const hasIssues = issues.length > 0
  return (
    <div className="flex items-start gap-2 py-2 border-b border-border last:border-0">
      {hasIssues
        ? <AlertCircle size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />
        : <CheckCircle2 size={14} className="text-green-500 mt-0.5 flex-shrink-0" />}
      <div className="min-w-0">
        <p className="text-xs font-medium">{label}</p>
        <p className="text-[11px] text-muted-foreground">{value}</p>
        {issues.map((issue, i) => (
          <p key={i} className="text-[11px] text-yellow-600 mt-0.5">— {issue}</p>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NovoPostClient() {
  const [contentType, setContentType] = useState<ContentType>(null)

  // ── Blog state ──
  const [step, setStep] = useState<'config' | 'generating' | 'review'>('config')
  const [topic, setTopic] = useState('')
  const [keywords, setKeywords] = useState('')
  const [publishDirectly, setPublishDirectly] = useState(false)
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>(STEPS)
  const [result, setResult] = useState<GeneratedResult | null>(null)
  const [error, setError] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editMeta, setEditMeta] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [showPreview, setShowPreview] = useState(true)
  const [improvingSEO, setImprovingSEO] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveError, setSaveError] = useState('')
  const [saveLink, setSaveLink] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  // ── Lookbook state ──
  const [lookTitle, setLookTitle] = useState('')
  const [lookDescription, setLookDescription] = useState('')
  const [lookProducts, setLookProducts] = useState<LookProduct[]>([
    { name: '', slug: '', price: '' },
  ])
  const [lookImageFile, setLookImageFile] = useState<File | null>(null)
  const [lookImagePreview, setLookImagePreview] = useState('')
  const [lookImageUrl, setLookImageUrl] = useState('')
  const [lookGenerating, setLookGenerating] = useState(false)
  const [lookSaving, setLookSaving] = useState(false)
  const [lookSaved, setLookSaved] = useState(false)
  const [lookError, setLookError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ─── Blog handlers ────────────────────────────────────────────────────────

  function updateStep(id: number, status: GenerationStep['status']) {
    setGenerationSteps(prev => prev.map(s => (s.id === id ? { ...s, status } : s)))
  }

  async function handleGenerate() {
    if (!topic.trim()) return
    setError('')
    setStep('generating')
    setGenerationSteps(STEPS.map(s => ({ ...s, status: 'pending' })))

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          keywords: keywords.trim() ? keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
          publishDirectly,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao gerar conteúdo')
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('Stream não disponível')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() || ''

        for (const event of events) {
          const lines = event.split('\n')
          const eventType = lines.find(l => l.startsWith('event:'))?.replace('event: ', '').trim()
          const dataLine = lines.find(l => l.startsWith('data:'))?.replace('data: ', '').trim()

          if (!eventType || !dataLine) continue
          const data = JSON.parse(dataLine)

          if (eventType === 'progress') {
            const stepId = data.step as number
            for (let i = 1; i < stepId; i++) updateStep(i, 'done')
            updateStep(stepId, 'loading')
          } else if (eventType === 'complete') {
            setGenerationSteps(STEPS.map(s => ({ ...s, status: 'done' })))
            const generated = data as GeneratedResult
            setResult(generated)
            setEditTitle(generated.title)
            setEditContent(generated.content)
            setEditMeta(generated.metaDescription)
            setEditSlug(generated.slug)
            setTimeout(() => setStep('review'), 500)
          } else if (eventType === 'error') {
            throw new Error(data.message)
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setError((err as Error).message || 'Erro ao gerar conteúdo')
      setStep('config')
    }
  }

  async function handleImproveSEO() {
    if (!result || !editContent) return
    setImprovingSEO(true)
    try {
      const res = await fetch('/api/blog/improve-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editContent,
          title: editTitle,
          metaDescription: editMeta,
          slug: editSlug,
          suggestions: result.seoAnalysis?.suggestions ?? [],
          keywords: result.suggestedKeywords ?? [],
        }),
      })
      if (!res.ok) throw new Error('Erro ao otimizar')
      const data = await res.json()
      setEditContent(data.content)
      setResult(prev => prev ? { ...prev, seoScore: data.seoScore, seoAnalysis: data.seoAnalysis } : prev)
    } catch {
      // silently fail
    } finally {
      setImprovingSEO(false)
    }
  }

  async function handleSave(status: 'draft' | 'publish') {
    if (!result) return
    setSaveStatus('saving')
    setSaveError('')
    try {
      const res = await fetch('/api/blog/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          excerpt: result.excerpt,
          metaDescription: editMeta,
          slug: editSlug,
          imageUrl: result.imageUrl,
          status,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar post')
      }
      setSaveStatus('saved')
      setSaveLink(data.link ?? '')
    } catch (err) {
      setSaveStatus('error')
      setSaveError((err as Error).message || 'Erro ao salvar post')
    }
  }

  // ─── Lookbook handlers ─────────────────────────────────────────────────────

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLookImageFile(file)
    setLookImagePreview(URL.createObjectURL(file))
    setLookImageUrl('')
  }

  async function handleGenerateDescription() {
    if (!lookTitle.trim()) return
    setLookGenerating(true)
    try {
      const productNames = lookProducts.map(p => p.name).filter(Boolean)
      const res = await fetch('/api/blog/generate-look-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: lookTitle, products: productNames }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setLookDescription(data.description)
    } catch {
      setLookError('Erro ao gerar descrição')
    } finally {
      setLookGenerating(false)
    }
  }

  function addProduct() {
    setLookProducts(prev => [...prev, { name: '', slug: '', price: '' }])
  }

  function removeProduct(idx: number) {
    setLookProducts(prev => prev.filter((_, i) => i !== idx))
  }

  function updateProduct(idx: number, field: keyof LookProduct, value: string) {
    setLookProducts(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p))
  }

  async function handleSaveLook() {
    if (!lookTitle.trim()) { setLookError('Título obrigatório'); return }
    if (!lookImageFile && !lookImageUrl) { setLookError('Foto obrigatória'); return }
    setLookError('')
    setLookSaving(true)

    try {
      let imageUrl = lookImageUrl

      // Upload photo if local file selected
      if (lookImageFile) {
        const form = new FormData()
        form.append('file', lookImageFile)
        const upRes = await fetch('/api/lookbook/upload', { method: 'POST', body: form })
        if (!upRes.ok) throw new Error('Erro ao fazer upload da foto')
        const upData = await upRes.json()
        imageUrl = upData.url
      }

      const id = `look-${lookTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`
      const res = await fetch('/api/lookbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title: lookTitle,
          description: lookDescription,
          image: imageUrl,
          products: lookProducts.filter(p => p.name.trim()),
        }),
      })
      if (!res.ok) throw new Error('Erro ao salvar look')
      setLookSaved(true)
    } catch (err) {
      setLookError((err as Error).message || 'Erro ao salvar')
    } finally {
      setLookSaving(false)
    }
  }

  function resetLookbook() {
    setLookTitle('')
    setLookDescription('')
    setLookProducts([{ name: '', slug: '', price: '' }])
    setLookImageFile(null)
    setLookImagePreview('')
    setLookImageUrl('')
    setLookSaved(false)
    setLookError('')
  }

  // ─── Type selector ────────────────────────────────────────────────────────

  if (!contentType) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-2xl font-semibold mb-2">Novo Conteúdo com IA</h1>
        <p className="text-sm text-muted-foreground mb-10">O que você quer criar hoje?</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <button
            onClick={() => setContentType('blog')}
            className="group border border-border p-8 text-left hover:border-foreground transition-all hover:bg-secondary/10"
          >
            <BookOpen size={32} className="text-muted-foreground mb-4 group-hover:text-foreground transition-colors" />
            <h2 className="font-display text-lg font-semibold mb-1">Post do Blog</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Gere artigos otimizados para SEO com IA, humanização de texto e análise completa.
            </p>
          </button>

          <button
            onClick={() => setContentType('lookbook')}
            className="group border border-border p-8 text-left hover:border-foreground transition-all hover:bg-secondary/10"
          >
            <ImageIcon size={32} className="text-muted-foreground mb-4 group-hover:text-foreground transition-colors" />
            <h2 className="font-display text-lg font-semibold mb-1">Look do Lookbook</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Monte um look editorial: faça upload da foto, gere descrição com IA e vincule produtos.
            </p>
          </button>
        </div>
      </div>
    )
  }

  // ─── Lookbook form ────────────────────────────────────────────────────────

  if (contentType === 'lookbook') {
    if (lookSaved) {
      return (
        <div className="max-w-lg text-center py-16">
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-semibold mb-2">Look publicado!</h2>
          <p className="text-sm text-muted-foreground mb-8">
            O look <strong>{lookTitle}</strong> foi adicionado ao Lookbook.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={resetLookbook}
              className="border border-border px-6 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-secondary/20 transition-all"
            >
              Criar outro look
            </button>
            <a
              href="/lookbook"
              target="_blank"
              className="bg-foreground text-background px-6 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-foreground/90 transition-all"
            >
              Ver lookbook
            </a>
          </div>
        </div>
      )
    }

    return (
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl font-semibold">Novo Look</h1>
          <button
            onClick={() => setContentType(null)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar
          </button>
        </div>

        {lookError && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <XCircle size={16} className="flex-shrink-0" />
            {lookError}
          </div>
        )}

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold tracking-widests uppercase text-muted-foreground mb-1.5">
              Nome do Look *
            </label>
            <input
              type="text"
              value={lookTitle}
              onChange={e => setLookTitle(e.target.value)}
              placeholder="Ex: Clínica Elegante, Plantão com Estilo..."
              className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold tracking-widests uppercase text-muted-foreground">
                Descrição
              </label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={!lookTitle.trim() || lookGenerating}
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-40"
              >
                {lookGenerating
                  ? <Loader2 size={12} className="animate-spin" />
                  : <Sparkles size={12} />}
                Gerar com IA
              </button>
            </div>
            <textarea
              value={lookDescription}
              onChange={e => setLookDescription(e.target.value)}
              rows={2}
              placeholder="Descrição inspiradora do look..."
              className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors resize-none"
            />
            <p className="text-[10px] text-muted-foreground mt-1">{lookDescription.length}/120 caracteres recomendados</p>
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-xs font-semibold tracking-widests uppercase text-muted-foreground mb-1.5">
              Foto do Look *
            </label>

            {lookImagePreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lookImagePreview}
                  alt="Preview"
                  className="w-full max-h-80 object-cover border border-border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setLookImageFile(null)
                    setLookImagePreview('')
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="absolute top-2 right-2 bg-background border border-border p-1.5 hover:bg-secondary/20 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border py-10 flex flex-col items-center gap-3 hover:border-foreground/40 transition-colors"
                >
                  <Upload size={24} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Clique para fazer upload da foto</span>
                  <span className="text-xs text-muted-foreground">JPG, PNG, WEBP até 10MB</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <div className="mt-2">
                  <p className="text-[10px] text-muted-foreground mb-1">Ou cole uma URL de imagem:</p>
                  <input
                    type="url"
                    value={lookImageUrl}
                    onChange={e => setLookImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Products */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold tracking-widests uppercase text-muted-foreground">
                Produtos (Shop the look)
              </label>
              <button
                type="button"
                onClick={addProduct}
                disabled={lookProducts.length >= 4}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
              >
                <Plus size={12} /> Adicionar
              </button>
            </div>

            <div className="space-y-3">
              {lookProducts.map((product, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={product.name}
                      onChange={e => updateProduct(idx, 'name', e.target.value)}
                      placeholder="Nome"
                      className="border border-border bg-background px-2 py-2 text-xs focus:outline-none focus:border-foreground transition-colors"
                    />
                    <input
                      type="text"
                      value={product.slug}
                      onChange={e => updateProduct(idx, 'slug', e.target.value)}
                      placeholder="slug-produto"
                      className="border border-border bg-background px-2 py-2 text-xs focus:outline-none focus:border-foreground transition-colors"
                    />
                    <input
                      type="text"
                      value={product.price}
                      onChange={e => updateProduct(idx, 'price', e.target.value)}
                      placeholder="R$ 0,00"
                      className="border border-border bg-background px-2 py-2 text-xs focus:outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                  {lookProducts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProduct(idx)}
                      className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground">
                Nome · Slug do produto no WooCommerce · Preço
              </p>
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSaveLook}
            disabled={lookSaving || !lookTitle.trim() || (!lookImageFile && !lookImageUrl)}
            className="w-full bg-foreground text-background py-3.5 text-xs font-semibold tracking-widest uppercase hover:bg-foreground/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {lookSaving ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : 'Publicar no Lookbook'}
          </button>
        </div>
      </div>
    )
  }

  // ─── Blog: config ─────────────────────────────────────────────────────────

  if (step === 'config') {
    return (
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl font-semibold">Novo Post com IA</h1>
          <button
            onClick={() => setContentType(null)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <XCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold tracking-widests uppercase text-muted-foreground mb-1.5">
              Tema / Título do conteúdo *
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              required
              placeholder="Ex: Como escolher o jaleco ideal para enfermeiros"
              className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widests uppercase text-muted-foreground mb-1.5">
              Palavras-chave (opcional, separadas por vírgula)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              placeholder="jaleco feminino, uniforme médico, moda clínica"
              className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={publishDirectly}
              onChange={e => setPublishDirectly(e.target.checked)}
              className="w-4 h-4 accent-foreground"
            />
            <span className="text-sm">Publicar diretamente no WordPress</span>
          </label>

          <button
            onClick={handleGenerate}
            disabled={!topic.trim()}
            className="w-full bg-foreground text-background py-3.5 text-xs font-semibold tracking-widest uppercase hover:bg-foreground/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            Gerar com IA
          </button>
        </div>
      </div>
    )
  }

  // ─── Blog: generating ─────────────────────────────────────────────────────

  if (step === 'generating') {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <h2 className="font-display text-xl font-semibold mb-8">Gerando seu conteúdo...</h2>
        <div className="space-y-4 text-left">
          {generationSteps.map(s => (
            <div key={s.id} className="flex items-center gap-3 py-2">
              {s.status === 'loading' && <Loader2 size={18} className="animate-spin text-primary flex-shrink-0" />}
              {s.status === 'done' && <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />}
              {s.status === 'pending' && <div className="w-[18px] h-[18px] rounded-full border-2 border-border flex-shrink-0" />}
              {s.status === 'error' && <XCircle size={18} className="text-red-500 flex-shrink-0" />}
              <span
                className={`text-sm ${
                  s.status === 'loading' ? 'text-foreground font-medium'
                  : s.status === 'done' ? 'text-muted-foreground line-through'
                  : 'text-muted-foreground'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─── Blog: review ─────────────────────────────────────────────────────────

  if (step === 'review' && result) {
    const seo = result.seoAnalysis

    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl font-semibold">Revisar e Publicar</h1>
          <button
            onClick={() => { setStep('config'); setResult(null) }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw size={14} /> Gerar novamente
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Main form */}
          <div className="space-y-5">
            {result.imageUrl && (
              <div>
                <label className="block text-xs font-semibold tracking-widests uppercase text-muted-foreground mb-2">
                  Imagem Destacada
                </label>
                <div className="aspect-[16/9] max-w-md overflow-hidden bg-secondary/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result.imageUrl} alt="Imagem destacada sugerida" className="w-full h-full object-cover" />
                </div>
                {result.imageAuthor && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Foto por{' '}
                    <a href={result.imageAuthor.link} target="_blank" rel="noopener noreferrer" className="underline">
                      {result.imageAuthor.name}
                    </a>{' '}
                    no Unsplash
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold tracking-widests uppercase text-muted-foreground mb-1.5">Título</label>
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
              />
              <p className="text-[10px] text-muted-foreground mt-1">{editTitle.length} caracteres (ideal: 40-60)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widests uppercase text-muted-foreground mb-1.5">Slug</label>
              <div className="flex items-center border border-border bg-background">
                <span className="pl-3 pr-1 text-sm text-muted-foreground">/blog/</span>
                <input
                  type="text"
                  value={editSlug}
                  onChange={e => setEditSlug(e.target.value)}
                  className="flex-1 px-1 py-2.5 text-sm focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widests uppercase text-muted-foreground mb-1.5">Meta Description</label>
              <textarea
                value={editMeta}
                onChange={e => setEditMeta(e.target.value)}
                rows={2}
                className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors resize-none"
              />
              <p className={`text-[10px] mt-1 ${editMeta.length > 160 ? 'text-red-600' : 'text-muted-foreground'}`}>
                {editMeta.length}/160 caracteres
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold tracking-widests uppercase text-muted-foreground">Conteúdo HTML</label>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
                  {showPreview ? 'Editar' : 'Preview'}
                </button>
              </div>

              {showPreview ? (
                <div
                  className="border border-border p-4 prose prose-sm max-w-none min-h-[300px] overflow-auto
                    prose-headings:font-display prose-headings:font-semibold
                    prose-p:text-muted-foreground prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: editContent }}
                />
              ) : (
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={16}
                  className="w-full border border-border bg-background px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-foreground transition-colors resize-y"
                />
              )}
            </div>

            {saveStatus === 'saved' && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>
                  Post salvo com sucesso!{' '}
                  {saveLink && (
                    <a href={saveLink} target="_blank" rel="noopener noreferrer" className="underline font-medium">Ver no WordPress →</a>
                  )}
                </span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                <XCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{saveError || 'Erro ao salvar. Tente novamente.'}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => handleSave('draft')}
                disabled={saveStatus === 'saving'}
                className="border border-border px-5 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-secondary/20 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saveStatus === 'saving' && <Loader2 size={14} className="animate-spin" />}
                Salvar Rascunho
              </button>
              <button
                onClick={() => handleSave('publish')}
                disabled={saveStatus === 'saving'}
                className="bg-foreground text-background px-5 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-foreground/90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saveStatus === 'saving' && <Loader2 size={14} className="animate-spin" />}
                Publicar
              </button>
            </div>
          </div>

          {/* SEO panel */}
          <div>
            <h2 className="font-display text-base font-semibold mb-4">Análise SEO</h2>
            <SEOScoreBar score={result.seoScore} />

            {seo && (
              <div className="border border-border p-4 space-y-0">
                <SEOItem
                  label="Title Tag"
                  value={`${seo.titleAnalysis.length} chars${seo.titleAnalysis.hasKeyword ? ' · tem keyword' : ' · sem keyword'}`}
                  issues={seo.titleAnalysis.issues}
                />
                <SEOItem
                  label="Meta Description"
                  value={`${seo.metaDescriptionAnalysis.length} chars${seo.metaDescriptionAnalysis.hasKeyword ? ' · tem keyword' : ''}`}
                  issues={seo.metaDescriptionAnalysis.issues}
                />
                <SEOItem
                  label="Headings"
                  value={`H1: ${seo.headingsAnalysis.h1} · H2: ${seo.headingsAnalysis.h2} · H3: ${seo.headingsAnalysis.h3}`}
                  issues={seo.headingsAnalysis.issues}
                />
                <SEOItem
                  label="Legibilidade"
                  value={`${seo.readability.score}/100 — ${seo.readability.level}`}
                  issues={[]}
                />
                <SEOItem
                  label="Links Internos"
                  value={`${seo.internalLinksCount} link(s)`}
                  issues={seo.internalLinksCount === 0 ? ['Adicione links internos'] : []}
                />
                <SEOItem
                  label="Escaneabilidade"
                  value={[
                    seo.scannability.bulletPoints ? 'listas ✓' : 'sem listas',
                    seo.scannability.boldText ? 'negrito ✓' : '',
                    seo.scannability.shortParagraphs ? 'parágrafos curtos ✓' : '',
                  ].filter(Boolean).join(' · ')}
                  issues={[]}
                />
              </div>
            )}

            {seo?.suggestions?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold tracking-widests uppercase text-muted-foreground mb-2">Sugestões</p>
                <ul className="space-y-1.5 mb-3">
                  {seo.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="text-primary mt-0.5">→</span>
                      {s}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleImproveSEO}
                  disabled={improvingSEO}
                  className="w-full border border-primary text-primary px-3 py-2 text-xs font-semibold tracking-widest uppercase hover:bg-primary/5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {improvingSEO
                    ? <><Loader2 size={12} className="animate-spin" /> Otimizando...</>
                    : <><Sparkles size={12} /> Aplicar melhorias de SEO</>}
                </button>
              </div>
            )}

            {result.suggestedKeywords?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold tracking-widests uppercase text-muted-foreground mb-2">Palavras-chave</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.suggestedKeywords.map(kw => (
                    <span key={kw} className="text-[10px] px-2 py-0.5 border border-border text-muted-foreground">{kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
