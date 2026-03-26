import { NextRequest, NextResponse } from 'next/server'
import { loginCustomer, getCustomerByEmail } from '@/lib/woocommerce'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    // Authenticate via JWT Auth plugin
    const jwtData = await loginCustomer(email, password)

    // Get customer data from WooCommerce REST API
    const customer = await getCustomerByEmail(email)

    if (!customer) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const user = {
      id: customer.id,
      name: jwtData.user_display_name || `${customer.first_name} ${customer.last_name}`.trim(),
      email: customer.email,
      token: jwtData.token,
    }

    return NextResponse.json({ user })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao fazer login'
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
