import { NextRequest, NextResponse } from 'next/server'
import { getCustomer, updateCustomer } from '@/lib/woocommerce'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 })
    const customer = await getCustomer(Number(userId))
    return NextResponse.json({ customer })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar perfil'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, email, password, phone, billing, shipping } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (name) {
      const [first_name, ...rest] = name.trim().split(' ')
      updateData.first_name = first_name
      updateData.last_name = rest.join(' ')
    }
    if (email) updateData.email = email
    if (password) updateData.password = password
    if (phone) updateData.billing = { ...(billing || {}), phone }
    if (billing) updateData.billing = { ...(updateData.billing as object || {}), ...billing }
    if (shipping) updateData.shipping = shipping

    const customer = await updateCustomer(Number(userId), updateData)

    return NextResponse.json({
      user: {
        id: customer.id,
        name: `${customer.first_name} ${customer.last_name}`.trim(),
        email: customer.email,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar perfil'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
