import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { verifyBlogToken } from '@/lib/blog-auth'
import { LayoutDashboard, FileText, PenLine, Users, LogOut } from 'lucide-react'
import BlogAdminLogoutButton from './LogoutButton'

export default async function BlogAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const tokenCookie = cookieStore.get('blog-token')

  if (!tokenCookie?.value) {
    redirect('/blog/admin/login')
  }

  const payload = verifyBlogToken(tokenCookie.value)
  if (!payload) {
    redirect('/blog/admin/login')
  }

  const navItems = [
    { href: '/blog/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/blog/admin/novo-post', label: 'Novo Conteúdo', icon: PenLine },
    { href: '/blog/admin/posts', label: 'Posts', icon: FileText },
    ...(payload.role === 'admin'
      ? [{ href: '/blog/admin/usuarios', label: 'Usuários', icon: Users }]
      : []),
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border flex flex-col bg-card">
        <div className="p-6 border-b border-border">
          <Link href="/" className="text-sm font-semibold tracking-widest uppercase text-foreground">
            Jaleca
          </Link>
          <p className="text-[10px] text-muted-foreground mt-1 tracking-widest uppercase">Blog Admin</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors"
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="mb-3 px-3">
            <p className="text-xs font-medium text-foreground">{payload.name}</p>
            <p className="text-[10px] text-muted-foreground capitalize">{payload.role}</p>
          </div>
          <BlogAdminLogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LogOut size={14} />
            <span>Painel de Administração do Blog</span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
