import { NextRequest, NextResponse } from 'next/server'
import { verifyBlogToken } from '@/lib/blog-auth'
import { improveSEOContent, analyzeSEO } from '@/lib/ai-content'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('blog-token')?.value
  if (!token || !verifyBlogToken(token)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { content, suggestions, keywords, title = '', metaDescription = '', slug = '' } = await request.json()
  if (!content) return NextResponse.json({ error: 'Conteúdo obrigatório' }, { status: 400 })

  const improved = await improveSEOContent(content, suggestions ?? [], keywords ?? [])
  const seoAnalysis = await analyzeSEO({
    title,
    content: improved,
    metaDescription,
    slug,
  })

  return NextResponse.json({ content: improved, seoScore: seoAnalysis.score, seoAnalysis })
}
