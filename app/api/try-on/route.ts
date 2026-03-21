import { NextRequest, NextResponse } from 'next/server'

const FASHN_API_KEY = process.env.FASHN_API_KEY
const FASHN_BASE = 'https://api.fashn.ai/v1'

async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Não foi possível carregar imagem do produto: ${res.status}`)
  const buffer = await res.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  return `data:${contentType};base64,${base64}`
}

export async function POST(req: NextRequest) {
  if (!FASHN_API_KEY) {
    return NextResponse.json({ error: 'FASHN_API_KEY não configurada' }, { status: 500 })
  }

  const { model_image, garment_image } = await req.json()

  if (!model_image || !garment_image) {
    return NextResponse.json({ error: 'Imagens obrigatórias' }, { status: 400 })
  }

  // Convert garment URL to base64 so Fashn.ai doesn't need to fetch it directly
  console.log('[try-on] garment_image URL:', garment_image)
  let garmentBase64: string
  try {
    garmentBase64 = await urlToBase64(garment_image)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }

  const res = await fetch(`${FASHN_BASE}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${FASHN_API_KEY}`,
    },
    body: JSON.stringify({
      model_name: 'tryon-v1.6',
      inputs: {
        model_image,
        garment_image: garmentBase64,
        category: 'full-body', // jaleco cobre o corpo todo
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json({ id: data.id })
}
