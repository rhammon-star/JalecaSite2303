import { NextRequest, NextResponse } from 'next/server'
import { verifyBlogToken } from '@/lib/blog-auth'
import { generateLookDescription } from '@/lib/ai-content'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('blog-token')?.value
  if (!token || !verifyBlogToken(token)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { title, products } = await request.json()
  if (!title) return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 })

  const description = await generateLookDescription(title, products ?? [])
  return NextResponse.json({ description })
}
