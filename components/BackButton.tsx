'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

export default function BackButton() {
  const router = useRouter()
  const pathname = usePathname()

  // Não mostra na página inicial
  if (pathname === '/') return null

  return (
    <button
      onClick={() => router.back()}
      className="fixed bottom-6 left-6 z-40 flex items-center gap-1.5 bg-background border border-border shadow-lg px-4 py-2.5 text-xs font-semibold tracking-wide uppercase text-foreground hover:bg-muted transition-all active:scale-95 rounded-full"
      aria-label="Voltar"
    >
      <ChevronLeft size={16} />
      Voltar
    </button>
  )
}
