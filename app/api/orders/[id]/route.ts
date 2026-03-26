import { NextRequest, NextResponse } from 'next/server'
import { getOrder } from '@/lib/woocommerce'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orderId = Number(id)
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const order = await getOrder(orderId)
    return NextResponse.json(order)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar pedido'
    return NextResponse.json({ error: message }, { status: 404 })
  }
}
