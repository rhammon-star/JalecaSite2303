import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, ShoppingBag, User } from 'lucide-react'
import PurchaseTracker from './PurchaseTracker'

export const metadata: Metadata = {
  title: 'Pedido Confirmado — Jaleca',
  description: 'Seu pedido foi realizado com sucesso.',
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ orderId: string }>
}

async function getOrder(orderId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_WC_URL
      ? `https://${process.env.NEXT_PUBLIC_WC_URL.replace(/^https?:\/\//, '')}`
      : 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/orders/${orderId}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function OrderConfirmedPage({ params }: Props) {
  const { orderId } = await params
  const order = await getOrder(orderId)

  return (
    <main className="py-16">
      <PurchaseTracker order={order} orderId={orderId} />
      <div className="container max-w-lg">
        <div className="text-center mb-10">
          <CheckCircle size={56} className="mx-auto mb-4 text-green-500" />
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">
            Pedido realizado com sucesso!
          </h1>
          {order ? (
            <p className="text-muted-foreground">
              Pedido <strong>#{order.number || orderId}</strong> confirmado.
            </p>
          ) : (
            <p className="text-muted-foreground">Pedido #{orderId} confirmado.</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            Você receberá um e-mail de confirmação em breve.
          </p>
        </div>

        {order && (
          <div className="border border-border p-6 mb-8">
            <h2 className="font-display text-xl font-semibold mb-4">Detalhes do Pedido</h2>
            <div className="space-y-2 text-sm">
              {order.line_items?.map((item: { id: number; name: string; quantity: number; total: string }) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                  <span>R$ {parseFloat(item.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
              {order.shipping_lines?.length > 0 && (
                <div className="flex justify-between border-t border-border pt-2 mt-2">
                  <span className="text-muted-foreground">{order.shipping_lines[0].method_title}</span>
                  <span>R$ {parseFloat(order.shipping_lines[0].total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 mt-2 font-semibold">
                <span>Total</span>
                <span>R$ {parseFloat(order.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/produtos"
            className="flex-1 inline-flex items-center justify-center gap-2 border border-border py-3 text-xs font-semibold tracking-widest uppercase hover:bg-secondary/20 transition-colors"
          >
            <ShoppingBag size={14} />
            Continuar Comprando
          </Link>
          <Link
            href="/minha-conta"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-ink text-background py-3 text-xs font-semibold tracking-widest uppercase hover:bg-ink/90 transition-colors"
          >
            <User size={14} />
            Minha Conta
          </Link>
        </div>
      </div>
    </main>
  )
}
