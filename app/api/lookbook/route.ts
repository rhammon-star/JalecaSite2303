import { NextRequest, NextResponse } from 'next/server'
import { verifyBlogToken } from '@/lib/blog-auth'
import { getLooks, saveLook, deleteLook, Look } from '@/lib/lookbook-data'
import { cookies } from 'next/headers'

export async function GET() {
  return NextResponse.json(getLooks())
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('blog-token')?.value
  if (!token || !verifyBlogToken(token)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const look = (await request.json()) as Look
  if (!look.id || !look.title) {
    return NextResponse.json({ error: 'id e title são obrigatórios' }, { status: 400 })
  }

  saveLook(look)
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('blog-token')?.value
  if (!token || !verifyBlogToken(token)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = (await request.json()) as { id: string }
  deleteLook(id)
  return NextResponse.json({ ok: true })
}
