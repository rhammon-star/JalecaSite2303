import { NextRequest, NextResponse } from 'next/server'
import { verifyBlogToken, getUserById } from '@/lib/blog-auth'
import { publishPost, uploadMedia } from '@/lib/wordpress'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const tokenCookie = cookieStore.get('blog-token')
  const authHeader = request.headers.get('Authorization')
  const token = tokenCookie?.value || authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const payload = verifyBlogToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }

  try {
    const body = await request.json() as {
      title?: string
      content?: string
      excerpt?: string
      metaDescription?: string
      slug?: string
      imageUrl?: string
      status?: 'draft' | 'publish'
    }

    if (!body.title || !body.content || !body.slug) {
      return NextResponse.json({ error: 'Título, conteúdo e slug são obrigatórios' }, { status: 400 })
    }

    const user = getUserById(payload.sub)
    const wpUsername = user?.wpUsername || process.env.WP_ADMIN_USER
    const wpAppPassword = user?.wpAppPassword || process.env.WP_ADMIN_APP_PASSWORD

    if (!wpUsername || !wpAppPassword || wpAppPassword === 'PLACEHOLDER') {
      return NextResponse.json(
        { error: 'Configure WP_ADMIN_APP_PASSWORD no .env.local. Vá em: WordPress Admin → Usuários → seu perfil → Senhas de aplicativo → Adicionar nova.' },
        { status: 500 }
      )
    }

    const credentials = { username: wpUsername, appPassword: wpAppPassword }

    let featuredMediaId: number | undefined
    if (body.imageUrl) {
      try {
        featuredMediaId = await uploadMedia(
          body.imageUrl,
          `${body.slug}.jpg`,
          credentials
        )
      } catch {
        // Continue without featured image
      }
    }

    const result = await publishPost(
      {
        title: body.title,
        content: body.content,
        excerpt: body.excerpt || '',
        slug: body.slug,
        status: body.status || 'draft',
        featured_media: featuredMediaId,
      },
      credentials
    )

    return NextResponse.json({ id: result.id, link: result.link }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao publicar post'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
