import Link from 'next/link'
import { PenLine, FileText, ArrowRight } from 'lucide-react'
import { getPosts } from '@/lib/wordpress'

async function getPostStats(): Promise<{ published: number; drafts: number }> {
  try {
    const result = await getPosts({ per_page: 100 })
    return { published: result.length, drafts: 0 }
  } catch {
    return { published: 0, drafts: 0 }
  }
}

export default async function BlogDashboardPage() {
  const stats = await getPostStats()

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <div className="border border-border p-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">
            Posts Publicados
          </p>
          <p className="font-display text-4xl font-semibold">{stats.published}</p>
        </div>
        <div className="border border-border p-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">
            Rascunhos
          </p>
          <p className="font-display text-4xl font-semibold">{stats.drafts}</p>
        </div>
      </div>

      {/* Quick actions */}
      <h2 className="font-display text-lg font-semibold mb-4">Ações Rápidas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/blog/admin/novo-post"
          className="flex items-center justify-between border border-border p-5 hover:bg-secondary/20 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <PenLine size={20} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">Criar novo post</p>
              <p className="text-xs text-muted-foreground">Gere conteúdo com IA</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/blog/admin/posts"
          className="flex items-center justify-between border border-border p-5 hover:bg-secondary/20 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">Ver todos os posts</p>
              <p className="text-xs text-muted-foreground">Gerenciar posts publicados</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
