import { NextRequest, NextResponse } from 'next/server'
import { getPoints, addPoints, redeemPoints } from '@/lib/loyalty'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    if (!customerId) {
      return NextResponse.json({ error: 'customerId é obrigatório' }, { status: 400 })
    }

    const points = await getPoints(customerId)
    return NextResponse.json({ customerId, points })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      customerId?: string | number
      action?: 'add' | 'redeem'
      points?: number
      amount?: number // for 'add' by purchase amount in BRL
    }

    const { customerId, action, points, amount } = body

    if (!customerId || !action) {
      return NextResponse.json({ error: 'customerId e action são obrigatórios' }, { status: 400 })
    }

    if (action === 'add') {
      const amountToAdd = amount ?? points ?? 0
      const newTotal = await addPoints(customerId, amountToAdd)
      return NextResponse.json({ ok: true, points: newTotal })
    }

    if (action === 'redeem') {
      if (!points || points <= 0) {
        return NextResponse.json({ error: 'Informe a quantidade de pontos' }, { status: 400 })
      }
      const result = await redeemPoints(customerId, points)
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'action inválida' }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
