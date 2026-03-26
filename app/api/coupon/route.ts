import { NextRequest, NextResponse } from 'next/server'
import { validateCoupon } from '@/lib/woocommerce'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Código do cupom é obrigatório' }, { status: 400 })
    }

    const coupon = await validateCoupon(code.trim().toLowerCase())

    // Check if expired
    if (coupon.date_expires) {
      const expires = new Date(coupon.date_expires)
      if (expires < new Date()) {
        return NextResponse.json({ valid: false, error: 'Cupom expirado' }, { status: 400 })
      }
    }

    // Check usage limit
    if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
      return NextResponse.json({ valid: false, error: 'Cupom esgotado' }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discount_type,
      amount: coupon.amount,
      minimum_amount: coupon.minimum_amount,
      maximum_amount: coupon.maximum_amount,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cupom inválido'
    return NextResponse.json({ valid: false, error: message }, { status: 400 })
  }
}
