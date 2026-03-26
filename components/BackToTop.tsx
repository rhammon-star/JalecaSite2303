'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 right-6 z-40 w-11 h-11 bg-foreground/90 text-background flex items-center justify-center shadow-lg hover:bg-foreground transition-colors active:scale-95 backdrop-blur-sm"
      aria-label="Voltar ao topo"
    >
      <ArrowUp size={18} />
    </button>
  )
}
