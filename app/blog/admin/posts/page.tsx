import Link from 'next/link'
import { Calendar, ExternalLink } from 'lucide-react'
import { getPosts } from '@/lib/wordpress'
import type { WPPost } from '@/lib/wordpress'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

export default async function BlogAdminPostsPage() {
  let posts: WPPost[] = []
  try {
    posts = await getPosts({ per_page: 50 })
  } catch {
    posts = []
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-semibold">Posts</h1>
        <Link
          href="/blog/admin/novo-post"
          className="bg-ink text-background px-4 py-2.5 text-xs font-semibold tracking-widest uppercase hover:bg-ink/90 transition-all"
        >
          Novo Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="border border-border p-12 text-center">
          <p className="text-muted-foreground text-sm">Nenhum post encontrado.</p>
          <Link
            href="/blog/admin/novo-post"
            className="inline-block mt-4 text-xs font-medium text-primary hover:underline"
          >
            Criar primeiro post
          </Link>
        </div>
      ) : (
        <div className="border border-border divide-y divide-border">
          <div className="grid grid-cols-[1fr_100px_100px_80px] gap-4 px-4 py-3 bg-secondary/20">
            <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Título</span>
            <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Status</span>
            <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Data</span>
            <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Ações</span>
          </div>

          {posts.map(post => {
            const title = stripHtml(post.title.rendered)
            return (
              <div
                key={post.id}
                className="grid grid-cols-[1fr_100px_100px_80px] gap-4 px-4 py-4 items-center hover:bg-secondary/10 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium line-clamp-1">{title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{post.slug}</p>
                </div>

                <span
                  className={`inline-block text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 ${
                    post.status === 'publish'
                      ? 'text-green-700 bg-green-50 border border-green-200'
                      : 'text-yellow-700 bg-yellow-50 border border-yellow-200'
                  }`}
                >
                  {post.status === 'publish' ? 'Publicado' : 'Rascunho'}
                </span>

                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar size={11} />
                  {formatDate(post.date)}
                </span>

                <div className="flex items-center gap-2">
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="Ver post"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
