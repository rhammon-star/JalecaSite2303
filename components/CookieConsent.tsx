'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('jaleca-cookie-consent')
    if (!consent) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('jaleca-cookie-consent', 'accepted')
    setVisible(false)
  }

  function reject() {
    localStorage.setItem('jaleca-cookie-consent', 'rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[150] bg-foreground text-background p-4 md:p-5 shadow-2xl">
      <div className="container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <p className="text-sm leading-relaxed max-w-2xl">
            Utilizamos cookies para melhorar sua experiência, personalizar conteúdo e analisar o tráfego do site.
            Ao continuar, você concorda com nossa{' '}
            <Link href="#" className="underline underline-offset-2 hover:text-white/80 transition-colors">
              Política de Privacidade
            </Link>.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={reject}
              className="text-xs font-semibold tracking-widest uppercase text-background/70 hover:text-background transition-colors underline underline-offset-2"
            >
              Rejeitar
            </button>
            <button
              onClick={accept}
              className="bg-background text-foreground px-5 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-background/90 transition-colors active:scale-95"
            >
              Aceitar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
