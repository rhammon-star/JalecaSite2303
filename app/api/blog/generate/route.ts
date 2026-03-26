import { NextRequest, NextResponse } from 'next/server'
import { verifyBlogToken, getUserById } from '@/lib/blog-auth'
import { generateContent, humanizeContent, analyzeSEO, generateImageQuery, improveSEOContent } from '@/lib/ai-content'
import { searchImage } from '@/lib/unsplash'
import { publishPost, uploadMedia } from '@/lib/wordpress'
import { cookies } from 'next/headers'

function getToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7)
  return null
}

export async function POST(request: NextRequest) {
  // Auth check
  const cookieStore = await cookies()
  const tokenCookie = cookieStore.get('blog-token')
  const token = tokenCookie?.value || getToken(request)
  if (!token) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const payload = verifyBlogToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }

  let body: { topic?: string; keywords?: string[]; publishDirectly?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido' }, { status: 400 })
  }

  const { topic, keywords, publishDirectly } = body
  if (!topic) {
    return NextResponse.json({ error: 'Tema é obrigatório' }, { status: 400 })
  }

  // Use SSE for real-time progress
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      try {
        // Step 1: Generate content
        send('progress', { step: 1, message: 'Gerando conteúdo...' })
        const generated = await generateContent(topic, keywords)

        // Step 2: Humanize
        send('progress', { step: 2, message: 'Humanizando texto...' })
        const humanizedContent = await humanizeContent(generated.content)

        // Step 3: SEO analysis
        send('progress', { step: 3, message: 'Analisando SEO...' })
        const seoAnalysis = await analyzeSEO({
          title: generated.title,
          content: humanizedContent,
          metaDescription: generated.metaDescription,
          slug: generated.suggestedSlug,
        })

        // Step 3.5: Auto-improve SEO based on suggestions
        send('progress', { step: 3, message: 'Otimizando SEO automaticamente...' })
        const optimizedContent = seoAnalysis.suggestions?.length
          ? await improveSEOContent(humanizedContent, seoAnalysis.suggestions, generated.suggestedKeywords)
          : humanizedContent

        // Re-analyze after improvements
        const finalSEO = await analyzeSEO({
          title: generated.title,
          content: optimizedContent,
          metaDescription: generated.metaDescription,
          slug: generated.suggestedSlug,
        })

        // Step 4: Find image
        send('progress', { step: 4, message: 'Buscando imagem...' })
        const imageQuery = await generateImageQuery(topic)
        const imageResult = await searchImage(imageQuery)

        let wpPostId: number | undefined
        let wpPostLink: string | undefined

        // Step 5: Optionally publish
        if (publishDirectly) {
          send('progress', { step: 5, message: 'Publicando no WordPress...' })
          const user = getUserById(payload.sub)
          const wpUser = user?.wpUsername || process.env.WP_ADMIN_USER
          const wpPass = user?.wpAppPassword || process.env.WP_ADMIN_APP_PASSWORD

          if (wpUser && wpPass) {
            const credentials = { username: wpUser, appPassword: wpPass }
            let featuredMediaId: number | undefined

            if (imageResult?.url) {
              try {
                featuredMediaId = await uploadMedia(
                  imageResult.url,
                  `${generated.suggestedSlug}.jpg`,
                  credentials
                )
              } catch {
                // Continue without featured image
              }
            }

            const wpPost = await publishPost(
              {
                title: generated.title,
                content: humanizedContent,
                excerpt: generated.excerpt,
                slug: generated.suggestedSlug,
                status: 'publish',
                featured_media: featuredMediaId,
              },
              credentials
            )
            wpPostId = wpPost.id
            wpPostLink = wpPost.link
          }
        }

        send('complete', {
          title: generated.title,
          content: optimizedContent,
          excerpt: generated.excerpt,
          metaDescription: generated.metaDescription,
          slug: generated.suggestedSlug,
          suggestedKeywords: generated.suggestedKeywords,
          seoScore: finalSEO.score,
          seoAnalysis: finalSEO,
          imageUrl: imageResult?.url ?? null,
          imageAuthor: imageResult
            ? { name: imageResult.authorName, link: imageResult.authorLink }
            : null,
          wpPostId,
          wpPostLink,
        })
      } catch (error) {
        send('error', { message: error instanceof Error ? error.message : 'Erro desconhecido' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
