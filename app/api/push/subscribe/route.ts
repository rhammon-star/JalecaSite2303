import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const FILE = path.join(DATA_DIR, 'push-subscriptions.json')

type PushEntry = {
  subscription: PushSubscriptionJSON
  productId: string
  productName: string
  createdAt: string
}

interface PushSubscriptionJSON {
  endpoint: string
  keys?: {
    p256dh: string
    auth: string
  }
}

async function readSubs(): Promise<PushEntry[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    const raw = await fs.readFile(FILE, 'utf-8')
    return JSON.parse(raw) as PushEntry[]
  } catch {
    return []
  }
}

async function writeSubs(subs: PushEntry[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(subs, null, 2), 'utf-8')
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      subscription?: PushSubscriptionJSON
      productId?: string
      productName?: string
    }

    const { subscription, productId, productName } = body

    if (!subscription?.endpoint || !productId) {
      return NextResponse.json({ error: 'subscription e productId são obrigatórios' }, { status: 400 })
    }

    const subs = await readSubs()

    // Avoid duplicate subscriptions for same endpoint+product
    const exists = subs.some(
      s => s.subscription.endpoint === subscription.endpoint && s.productId === productId
    )

    if (!exists) {
      subs.push({
        subscription,
        productId,
        productName: productName || '',
        createdAt: new Date().toISOString(),
      })
      await writeSubs(subs)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
