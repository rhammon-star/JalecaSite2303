import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const FILE = path.join(DATA_DIR, 'abandoned-carts.json')

type CartItem = {
  id: string
  name: string
  price: string
  quantity: number
  image?: string
}

type AbandonedCart = {
  email: string
  cartItems: CartItem[]
  timestamp: string
}

async function readCarts(): Promise<AbandonedCart[]> {
  try {
    const raw = await fs.readFile(FILE, 'utf-8')
    return JSON.parse(raw) as AbandonedCart[]
  } catch {
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string }
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'email é obrigatório' }, { status: 400 })
    }

    const carts = await readCarts()
    const cart = carts.find(c => c.email === email)

    if (!cart) {
      return NextResponse.json({ error: 'Carrinho não encontrado' }, { status: 404 })
    }

    // Attempt to send email via sendCartRecovery (uses SMTP if configured, simulates otherwise)
    try {
      const { sendCartRecovery } = await import('@/lib/email')
      await sendCartRecovery(cart.cartItems, email)
    } catch {
      console.log(`[CartRecovery] Email send failed (simulated) for ${email}`)
      return NextResponse.json({ ok: true, simulated: true })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
