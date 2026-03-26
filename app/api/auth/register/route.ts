import { NextRequest, NextResponse } from 'next/server'
import { createCustomer, loginCustomer } from '@/lib/woocommerce'
import { validateCPF, cleanCPF } from '@/lib/cpf'

const WC_API = process.env.WOOCOMMERCE_API_URL!
const auth = Buffer.from(
  `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
).toString('base64')

async function cpfAlreadyExists(cpf: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${WC_API}/customers?meta_key=billing_cpf&meta_value=${cpf}&per_page=1&role=all`,
      { headers: { Authorization: `Basic ${auth}` }, cache: 'no-store' }
    )
    if (!res.ok) return false
    const customers = await res.json()
    return Array.isArray(customers) && customers.length > 0
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, cpf, phone, birthdate, gender } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios' }, { status: 400 })
    }

    // CPF validation (required)
    if (!cpf) {
      return NextResponse.json({ error: 'CPF é obrigatório' }, { status: 400 })
    }
    const cleanedCPF = cleanCPF(cpf)
    if (!validateCPF(cleanedCPF)) {
      return NextResponse.json({ error: 'CPF inválido' }, { status: 400 })
    }

    // CPF uniqueness check
    const cpfExists = await cpfAlreadyExists(cleanedCPF)
    if (cpfExists) {
      return NextResponse.json({ error: 'Já existe uma conta cadastrada com este CPF' }, { status: 409 })
    }

    const [first_name, ...rest] = name.trim().split(' ')
    const last_name = rest.join(' ')

    // Build meta_data for WooCommerce Brazilian fields
    const meta_data: Array<{ key: string; value: string }> = [
      { key: 'billing_cpf', value: cleanedCPF },
      { key: 'billing_persontype', value: '1' }, // 1 = Pessoa Física
    ]
    if (phone) meta_data.push({ key: 'billing_cellphone', value: phone })
    if (birthdate) meta_data.push({ key: 'billing_birthdate', value: birthdate })
    if (gender) meta_data.push({ key: 'billing_sex', value: gender })

    const customer = await createCustomer({
      email,
      first_name,
      last_name,
      password,
      username: email,
      // @ts-expect-error meta_data is supported by WC API but not in our simplified type
      meta_data,
      billing: { phone: phone || '' },
    })

    // Auto-login after registration
    let token = ''
    try {
      const jwtData = await loginCustomer(email, password)
      token = jwtData.token
    } catch {
      // Not critical — user can login manually
    }

    return NextResponse.json({
      user: {
        id: customer.id,
        name: `${customer.first_name} ${customer.last_name}`.trim() || name,
        email: customer.email,
        token,
      },
    }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar conta'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
