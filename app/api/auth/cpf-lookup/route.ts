import { NextRequest, NextResponse } from 'next/server'

const WC_API = process.env.WOOCOMMERCE_API_URL!
const auth = Buffer.from(
  `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
).toString('base64')

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cpf = searchParams.get('cpf')?.replace(/\D/g, '')
  if (!cpf || cpf.length !== 11) {
    return NextResponse.json({ found: false })
  }

  try {
    // Search customers by CPF meta
    const res = await fetch(
      `${WC_API}/customers?meta_key=billing_cpf&meta_value=${cpf}&per_page=5&role=all`,
      { headers: { Authorization: `Basic ${auth}` }, cache: 'no-store' }
    )
    if (!res.ok) return NextResponse.json({ found: false })
    const customers = await res.json()

    if (Array.isArray(customers) && customers.length > 0) {
      const c = customers[0]
      return NextResponse.json({
        found: true,
        customer: {
          id: c.id,
          email: c.email,
          name: `${c.first_name} ${c.last_name}`.trim(),
        },
      })
    }
    return NextResponse.json({ found: false })
  } catch {
    return NextResponse.json({ found: false })
  }
}
