'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'

type Props = {
  productId: string
  productName: string
}

export default function BackInStockButton({ productId, productName }: Props) {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'subscribed' | 'error'>('idle')

  async function handleClick() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('error')
      return
    }

    setStatus('requesting')

    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('error')
        return
      }

      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // For a real implementation, VAPID public key would come from env
      // Here we save a minimal subscription object
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
        'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          productId,
          productName,
        }),
      })

      setStatus('subscribed')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'subscribed') {
    return (
      <p className="text-sm text-green-600 font-medium flex items-center gap-1.5">
        <Bell size={14} />
        Você será notificada quando chegar!
      </p>
    )
  }

  if (status === 'error') {
    return (
      <p className="text-sm text-muted-foreground">
        Notificações não suportadas. Entre em contato conosco.
      </p>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === 'requesting'}
      className="inline-flex items-center gap-2 border border-border bg-background px-5 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-secondary/20 transition-colors disabled:opacity-60"
    >
      <Bell size={14} />
      {status === 'requesting' ? 'Aguarde...' : 'Avise-me quando chegar'}
    </button>
  )
}

