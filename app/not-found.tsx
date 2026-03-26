import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center py-20">
      <div className="container text-center max-w-lg">
        <p className="font-display text-[120px] font-semibold leading-none text-border mb-2">404</p>
        <h1 className="font-display text-2xl font-semibold mb-3">Página não encontrada</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Ops! A página que você procura não existe ou foi movida.
          Que tal explorar nossa coleção?
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/produtos"
            className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3.5 text-xs font-bold tracking-widest uppercase hover:bg-foreground/90 active:scale-[0.97] transition-all"
          >
            Ver Produtos
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/produtos?cat=Jalecos"
            className="inline-flex items-center gap-2 border border-border text-foreground px-6 py-3.5 text-xs font-bold tracking-widest uppercase hover:bg-secondary/20 active:scale-[0.97] transition-all"
          >
            <Search size={14} />
            Jalecos
          </Link>
        </div>
        <div className="mt-10 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground mb-4">Links úteis</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Início</Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link href="/lookbook" className="hover:text-foreground transition-colors">Lookbook</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
