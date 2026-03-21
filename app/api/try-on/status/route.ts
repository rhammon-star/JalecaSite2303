import { NextRequest, NextResponse } from 'next/server'

const FASHN_API_KEY = process.env.FASHN_API_KEY
const FASHN_BASE = 'https://api.fashn.ai/v1'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  const res = await fetch(`${FASHN_BASE}/status/${id}`, {
    headers: { Authorization: `Bearer ${FASHN_API_KEY}` },
  })

  const data = await res.json()

  // Normalize error field — Fashn returns error as object {name, message}
  if (data.error && typeof data.error === 'object') {
    return NextResponse.json({
      status: data.status,
      error: data.error.message ?? JSON.stringify(data.error),
      output: data.output,
    })
  }

  return NextResponse.json(data)
}
