'use client'

import { useState } from 'react'
import { X, Ruler, ChevronRight, RotateCcw } from 'lucide-react'
import { findProductChart, ProductChart, ALL_SIZES } from '@/lib/sizeChart'

type Props = {
  productName: string
  onClose: () => void
}

type Measurements = {
  busto: string
  cintura: string
  quadril: string
}

// Minimum ease (folga) for a jaleco to fit without tightness
const MIN_EASE = { busto: 6, cintura: 4, quadril: 6 }
// Ideal ease center — used to score how well a size fits
const IDEAL_EASE = { busto: 14, cintura: 12, quadril: 16 }

type AreaResult = {
  area: 'busto' | 'cintura' | 'quadril'
  label: string
  body: number
  garment: number
  ease: number  // garment - body; positive = room, negative = too tight
}

type Recommendation = {
  size: string
  score: number
  areas: AreaResult[]
  verdict: string
  color: string
}

const AREA_LABELS = { busto: 'Busto / Costas', cintura: 'Cintura', quadril: 'Quadril / Quadris' }

function parseMeasure(v: string): number {
  return parseFloat(v.replace(',', '.'))
}

function easeLabel(ease: number): { text: string; color: string } {
  if (ease < 0)  return { text: `Apertará muito (faltam ${Math.abs(ease).toFixed(0)}cm)`, color: 'text-red-600' }
  if (ease < 6)  return { text: `Ficará apertado (+${ease.toFixed(0)}cm de folga)`,        color: 'text-red-500' }
  if (ease < 10) return { text: 'Justo, confortável',                                       color: 'text-amber-500' }
  if (ease <= 20) return { text: 'Caimento ideal',                                           color: 'text-emerald-600' }
  if (ease <= 26) return { text: `Um pouco folgado (+${ease.toFixed(0)}cm)`,                color: 'text-amber-500' }
  return              { text: `Muito folgado (+${ease.toFixed(0)}cm)`,                      color: 'text-amber-600' }
}

function verdictFromAreas(areas: AreaResult[]): { verdict: string; color: string } {
  const tight = areas.filter(a => a.ease < MIN_EASE[a.area])
  const veryLoose = areas.filter(a => a.ease > 26)
  if (tight.length === 0 && veryLoose.length === 0) {
    const allIdeal = areas.every(a => a.ease >= 10 && a.ease <= 20)
    return allIdeal
      ? { verdict: 'Caimento perfeito', color: 'text-emerald-600' }
      : { verdict: 'Bom caimento', color: 'text-emerald-600' }
  }
  if (tight.length > 0 && veryLoose.length === 0) {
    return { verdict: tight.length === areas.length ? 'Muito apertado' : 'Levemente apertado', color: 'text-red-500' }
  }
  if (veryLoose.length > 0 && tight.length === 0) {
    return { verdict: veryLoose.length === areas.length ? 'Muito folgado' : 'Levemente folgado', color: 'text-amber-500' }
  }
  return { verdict: 'Ajuste misto', color: 'text-amber-500' }
}

function analyzeWithChart(
  busto: number | null, cintura: number, quadril: number | null,
  chart: ProductChart,
): Recommendation[] {
  return ALL_SIZES
    .filter(size => chart[size] !== undefined)
    .map(size => {
      const entry = chart[size]!
      const areas: AreaResult[] = []

      if (busto !== null) {
        areas.push({ area: 'busto', label: AREA_LABELS.busto, body: busto, garment: entry.busto, ease: entry.busto - busto })
      }
      areas.push({ area: 'cintura', label: AREA_LABELS.cintura, body: cintura, garment: entry.cintura, ease: entry.cintura - cintura })
      if (quadril !== null && entry.quadril !== undefined) {
        areas.push({ area: 'quadril', label: AREA_LABELS.quadril, body: quadril, garment: entry.quadril, ease: entry.quadril - quadril })
      }

      const score = areas.reduce((sum, a) => sum + Math.abs(a.ease - IDEAL_EASE[a.area]), 0)
      const { verdict, color } = verdictFromAreas(areas)
      return { size, score, areas, verdict, color }
    })
}

function getBestSize(recs: Recommendation[]): Recommendation {
  const noTight = recs.filter(r => r.areas.every(a => a.ease >= MIN_EASE[a.area]))
  const pool = noTight.length > 0 ? noTight : recs
  return pool.reduce((a, b) => a.score < b.score ? a : b)
}

// ─── InputField defined OUTSIDE to avoid React remount on each keystroke ──────
type InputFieldProps = {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  unit?: string
  hint?: string
  required?: boolean
}

function InputField({ label, value, onChange, unit = 'cm', hint, required }: InputFieldProps) {
  return (
    <div>
      <label className="block text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">
        {label} <span className="font-normal normal-case tracking-normal">({unit})</span>
        {hint && <span className="ml-1 text-[10px] font-normal normal-case tracking-normal text-muted-foreground/70">— {hint}</span>}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={onChange}
        placeholder="0"
        className="w-full border border-border bg-background px-3 py-3 text-base focus:outline-none focus:border-primary transition-colors"
      />
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────────

export default function SizeAdvisorModal({ productName, onClose }: Props) {
  const [step, setStep] = useState<'form' | 'result'>('form')
  const [measurements, setMeasurements] = useState<Measurements>({
    busto: '', cintura: '', quadril: '',
  })

  const isMasculine = productName.toLowerCase().includes('masculino')

  const set = (k: keyof Measurements) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setMeasurements(prev => ({ ...prev, [k]: e.target.value }))

  const canSubmit = isMasculine
    ? measurements.cintura.trim() !== ''
    : measurements.busto.trim() !== '' && measurements.cintura.trim() !== ''

  const productChart: ProductChart | null = findProductChart(productName)

  const recommendations: Recommendation[] = (() => {
    if (step !== 'result') return []
    const busto   = measurements.busto.trim()   ? parseMeasure(measurements.busto)   : null
    const cintura = measurements.cintura.trim() ? parseMeasure(measurements.cintura) : null
    const quadril = measurements.quadril.trim() ? parseMeasure(measurements.quadril) : null
    if (!cintura) return []

    if (productChart) {
      return analyzeWithChart(busto, cintura, quadril, productChart)
    }

    // Fallback: generic body measurement ranges
    type GenericEntry = { size: string; busto: [number,number]; cintura: [number,number]; quadril: [number,number] }
    const GENERIC: GenericEntry[] = [
      { size: 'PP',  busto: [82, 86],   cintura: [64, 68],   quadril: [88, 92] },
      { size: 'P',   busto: [86, 90],   cintura: [68, 72],   quadril: [92, 96] },
      { size: 'M',   busto: [90, 94],   cintura: [72, 76],   quadril: [96, 100] },
      { size: 'G',   busto: [94, 100],  cintura: [76, 82],   quadril: [100, 106] },
      { size: 'GG',  busto: [100, 106], cintura: [82, 88],   quadril: [106, 112] },
      { size: 'XGG', busto: [106, 112], cintura: [88, 94],   quadril: [112, 118] },
    ]
    return GENERIC.map(entry => {
      const bustoCenter   = (entry.busto[0]   + entry.busto[1])   / 2
      const cinturaCenter = (entry.cintura[0] + entry.cintura[1]) / 2
      const areas: AreaResult[] = []
      let score = 0
      if (busto !== null) {
        areas.push({ area: 'busto', label: AREA_LABELS.busto, body: busto, garment: bustoCenter, ease: bustoCenter - busto })
        score += Math.abs(busto - bustoCenter)
      }
      areas.push({ area: 'cintura', label: AREA_LABELS.cintura, body: cintura, garment: cinturaCenter, ease: cinturaCenter - cintura })
      score += Math.abs(cintura - cinturaCenter)
      const { verdict, color } = verdictFromAreas(areas)
      return { size: entry.size, score, areas, verdict, color }
    })
  })()

  const best = recommendations.length > 0 ? getBestSize(recommendations) : null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-background w-full max-w-md pointer-events-auto animate-fade-up shadow-2xl max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <Ruler size={16} className="text-secondary" />
              <span className="font-display text-lg font-semibold">Qual é o seu tamanho?</span>
            </div>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors active:scale-95">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">

            {/* FORM */}
            {step === 'form' && (
              <div className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  Informe suas medidas corporais e te diremos qual tamanho do{' '}
                  <strong className="text-foreground">{productName}</strong> é ideal para você.
                </p>

                <div className="bg-muted/50 border border-border p-4 text-xs text-muted-foreground leading-relaxed">
                  📏 Meça com uma fita métrica passando pela parte mais larga de cada região, sem apertar.
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {!isMasculine && (
                    <InputField label="Busto" value={measurements.busto} onChange={set('busto')} hint="parte mais larga" required />
                  )}
                  <InputField label="Cintura" value={measurements.cintura} onChange={set('cintura')} hint="parte mais estreita" required />
                  <InputField label="Quadril" value={measurements.quadril} onChange={set('quadril')} hint="opcional" />
                </div>

                <p className="text-[10px] text-muted-foreground/70">
                  * {isMasculine ? 'Cintura obrigatória' : 'Busto e cintura obrigatórios'}
                </p>

                <button
                  onClick={() => setStep('result')}
                  disabled={!canSubmit}
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 text-xs font-semibold tracking-widest uppercase transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                >
                  Ver meu tamanho ideal <ChevronRight size={14} />
                </button>
              </div>
            )}

            {/* RESULT */}
            {step === 'result' && best && (
              <div className="space-y-6">

                {/* Best size highlight */}
                <div className="border-2 border-primary bg-primary/5 p-5 text-center">
                  <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">Tamanho recomendado</p>
                  <p className="font-display text-5xl font-semibold text-primary mb-2">{best.size}</p>
                  <p className={`text-sm font-medium ${best.color}`}>{best.verdict}</p>
                  {productChart && (
                    <p className="text-[10px] text-muted-foreground mt-1">Baseado nas medidas oficiais do produto</p>
                  )}
                </div>

                {/* Area breakdown */}
                <div>
                  <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">
                    {productChart ? `Ajuste no tamanho ${best.size}` : 'Detalhamento por área'}
                  </p>
                  <div className="space-y-3">
                    {best.areas.map(area => {
                      const { text, color } = easeLabel(area.ease)
                      return (
                        <div key={area.area} className="flex items-start justify-between py-2 border-b border-border last:border-0 gap-2">
                          <div>
                            <p className="text-sm font-medium">{area.label}</p>
                            {productChart ? (
                              <p className="text-xs text-muted-foreground">
                                Seu corpo: {area.body}cm · Jaleco {best.size}: {area.garment}cm · Folga: {area.ease >= 0 ? '+' : ''}{area.ease.toFixed(0)}cm
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                Sua medida: {area.body}cm
                              </p>
                            )}
                          </div>
                          <span className={`text-xs font-semibold ${color} text-right shrink-0`}>{text}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Size comparison table */}
                <div>
                  <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">Comparativo de tamanhos</p>
                  <div className="space-y-1.5">
                    {recommendations.map(rec => (
                      <div
                        key={rec.size}
                        className={`flex items-center justify-between px-3 py-2 text-sm ${rec.size === best.size ? 'bg-primary/10 border border-primary/30' : 'bg-muted/30'}`}
                      >
                        <span className={`font-semibold w-10 ${rec.size === best.size ? 'text-primary' : ''}`}>{rec.size}</span>
                        <span className={`text-xs flex-1 ${rec.color}`}>{rec.verdict}</span>
                        {rec.size === best.size && (
                          <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 font-bold">IDEAL</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Product garment measurements table (when available) */}
                {productChart && (
                  <div>
                    <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">
                      Medidas do jaleco — {productName}
                    </p>
                    <div className="overflow-hidden border border-border text-xs">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="py-2 px-3 text-left font-semibold">Tam.</th>
                            <th className="py-2 px-3 text-left font-semibold">Busto</th>
                            <th className="py-2 px-3 text-left font-semibold">Cintura</th>
                            <th className="py-2 px-3 text-left font-semibold">Quadril</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ALL_SIZES.filter(s => productChart[s]).map(size => {
                            const entry = productChart[size]!
                            return (
                              <tr
                                key={size}
                                className={`border-t border-border ${size === best.size ? 'bg-primary/10 font-semibold' : ''}`}
                              >
                                <td className="py-2 px-3">{size}{size === best.size ? ' ✓' : ''}</td>
                                <td className="py-2 px-3 text-muted-foreground">{entry.busto}cm</td>
                                <td className="py-2 px-3 text-muted-foreground">{entry.cintura}cm</td>
                                <td className="py-2 px-3 text-muted-foreground">{entry.quadril ? `${entry.quadril}cm` : '—'}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">* Medidas do jaleco, não do corpo.</p>
                  </div>
                )}

                <button
                  onClick={() => setStep('form')}
                  className="w-full inline-flex items-center justify-center gap-2 border border-border py-3 text-xs font-semibold tracking-wide uppercase hover:bg-muted transition-colors"
                >
                  <RotateCcw size={13} /> Refazer com outras medidas
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
