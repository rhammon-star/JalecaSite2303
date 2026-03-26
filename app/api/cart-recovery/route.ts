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
    await fs.mkdir(DATA_DIR, { recursive: true })
    const raw = await fs.readFile(FILE, 'utf-8')
    return JSON.parse(raw) as AbandonedCart[]
  } catch {
    return []
  }
}

async function writeCarts(carts: AbandonedCart[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(carts, null, 2), 'utf-8')
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; cartItems?: CartItem[] }
    const { email, cartItems } = body

    if (!email || !cartItems?.length) {
      return NextResponse.json({ error: 'email e cartItems são obrigatórios' }, { status: 400 })
    }

    const carts = await readCarts()

    // Update or insert
    const idx = carts.findIndex(c => c.email === email)
    const entry: AbandonedCart = { email, cartItems, timestamp: new Date().toISOString() }

    if (idx >= 0) {
      carts[idx] = entry
    } else {
      carts.push(entry)
    }

    await writeCarts(carts)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const carts = await readCarts()
    return NextResponse.json(carts)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
