import { NextRequest, NextResponse } from 'next/server'
import { createOrder, getOrders } from '@/lib/woocommerce'
import type { WCOrderData } from '@/lib/woocommerce'
import { sendOrderConfirmation } from '@/lib/email'

// Pagar.me payment method IDs
const PAGARME_METHODS = {
  pix: 'woo-pagarme-payments-pix',
  boleto: 'woo-pagarme-payments-billet',
  credit_card: 'woo-pagarme-payments-credit_card',
} as const

const PAGARME_TITLES = {
  'woo-pagarme-payments-pix': 'PIX',
  'woo-pagarme-payments-billet': 'Boleto Bancário',
  'woo-pagarme-payments-credit_card': 'Cartão de Crédito',
} as const

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    if (!customerId) {
      return NextResponse.json({ error: 'customerId é obrigatório' }, { status: 400 })
    }
    const orders = await getOrders(Number(customerId))
    return NextResponse.json(orders)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar pedidos'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: WCOrderData = await request.json()

    if (!body.billing || !body.line_items?.length) {
      return NextResponse.json({ error: 'Dados de faturamento e itens são obrigatórios' }, { status: 400 })
    }

    // Normalize payment method to Pagar.me IDs
    const pmKey = body.payment_method as string
    const validPagarme = Object.values(PAGARME_METHODS) as string[]

    if (!validPagarme.includes(pmKey)) {
      // Try to map legacy method IDs to Pagar.me
      const legacyMap: Record<string, string> = {
        pix: PAGARME_METHODS.pix,
        bacs: PAGARME_METHODS.boleto,
        boleto: PAGARME_METHODS.boleto,
        credit_card: PAGARME_METHODS.credit_card,
      }
      if (legacyMap[pmKey]) {
        body.payment_method = legacyMap[pmKey]
        body.payment_method_title =
          PAGARME_TITLES[legacyMap[pmKey] as keyof typeof PAGARME_TITLES] ??
          body.payment_method_title
      }
    }

    const order = await createOrder(body)

    // Send confirmation email (fire-and-forget)
    const customerEmail = body.billing?.email
    if (customerEmail) {
      sendOrderConfirmation(order, customerEmail).catch(err =>
        console.error('[Orders] Failed to send confirmation email:', err)
      )
    }

    return NextResponse.json(
      {
        orderId: order.id,
        orderNumber: order.number,
        orderKey: order.order_key,
        total: order.total,
        status: order.status,
        paymentMethod: order.status,
      },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar pedido'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
