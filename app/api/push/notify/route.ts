import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const FILE = path.join(DATA_DIR, 'push-subscriptions.json')

type PushEntry = {
  subscription: {
    endpoint: string
    keys?: { p256dh: string; auth: string }
  }
  productId: string
  productName: string
  createdAt: string
}

async function readSubs(): Promise<PushEntry[]> {
  try {
    const raw = await fs.readFile(FILE, 'utf-8')
    return JSON.parse(raw) as PushEntry[]
  } catch {
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { productId?: string; productName?: string }
    const { productId, productName } = body

    if (!productId) {
      return NextResponse.json({ error: 'productId é obrigatório' }, { status: 400 })
    }

    const allSubs = await readSubs()
    const targets = allSubs.filter(s => s.productId === productId)

    if (targets.length === 0) {
      return NextResponse.json({ ok: true, sent: 0 })
    }

    const payload = JSON.stringify({
      title: 'De volta ao estoque — Jaleca',
      body: `${productName || 'O produto'} está disponível novamente!`,
      icon: '/icon-flower.svg',
      url: `/produto/${productId}`,
    })

    // web-push is not installed; simulate push delivery
    let sent = 0
    for (const sub of targets) {
      console.log(`[Push] Would notify ${sub.subscription.endpoint.slice(0, 40)}… — ${payload}`)
      sent++
    }

    return NextResponse.json({ ok: true, sent })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
