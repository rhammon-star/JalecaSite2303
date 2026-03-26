'use client'

import { useEffect } from 'react'
import { trackPurchase } from '@/components/Analytics'

type LineItem = {
  id: number
  name: string
  quantity: number
  total: string
  product_id?: number
}

type OrderData = {
  id: number | string
  number?: string
  total?: string
  line_items?: LineItem[]
}

export default function PurchaseTracker({ order, orderId }: { order: OrderData | null; orderId: string }) {
  useEffect(() => {
    if (!order) return
    const value = order.total ? parseFloat(order.total) : 0
    const items = (order.line_items ?? []).map(item => ({
      id: String(item.product_id ?? item.id),
      name: item.name,
      price: parseFloat(item.total) / item.quantity,
      quantity: item.quantity,
    }))
    trackPurchase(order.number || orderId, value, items)
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
