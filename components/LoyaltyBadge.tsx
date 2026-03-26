'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getPointsDiscount } from '@/lib/loyalty-utils'
import { Star } from 'lucide-react'

export default function LoyaltyBadge() {
  const { user, isLoggedIn } = useAuth()
  const [points, setPoints] = useState<number | null>(null)

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setPoints(null)
      return
    }
    fetch(`/api/loyalty?customerId=${user.id}`)
      .then(r => r.json())
      .then((data: { points?: number }) => {
        if (typeof data.points === 'number') setPoints(data.points)
      })
      .catch(() => {})
  }, [isLoggedIn, user])

  if (!isLoggedIn || points === null) return null

  const discount = getPointsDiscount(points)

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground" title={`${points} pontos = R$${discount} de desconto`}>
      <Star size={12} className="text-yellow-500 fill-yellow-400" />
      <span className="font-medium tabular-nums">{points} pts</span>
    </div>
  )
}
