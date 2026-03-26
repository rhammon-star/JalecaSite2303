'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const messages = [
  { text: '🚚 Frete grátis nas compras acima de R$ 299', href: '/produtos', cta: 'Comprar agora' },
  { text: '💚 Nova Coleção Outono/Inverno chegou!', href: '/produtos?novidades=true', cta: 'Ver novidades' },
  { text: '⭐ Ganhe pontos de fidelidade em cada compra', href: '/minha-conta', cta: 'Saiba mais' },
]

export default function AnnouncementBar() {
  const [current, setCurrent] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % messages.length)
        setFade(true)
      }, 300)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const msg = messages[current]

  return (
    <div className="bg-[hsl(var(--foreground))] text-[hsl(var(--background))] py-2.5 text-center text-[11px] font-medium tracking-wider">
      <div
        className="flex items-center justify-center gap-3 transition-opacity duration-300"
        style={{ opacity: fade ? 1 : 0 }}
      >
        <span>{msg.text}</span>
        <Link
          href={msg.href}
          className="underline underline-offset-2 opacity-70 hover:opacity-100 transition-opacity whitespace-nowrap"
        >
          {msg.cta} →
        </Link>
      </div>
    </div>
  )
}
