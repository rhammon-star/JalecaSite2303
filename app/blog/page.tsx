import { ArrowRight } from "lucide-react";
import { blogPosts } from "@/lib/products";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata = {
  title: "Blog — Jaleca",
  description: "Conteúdo para profissionais que valorizam estilo e informação.",
};

export default function BlogPage() {
  return (
    <main className="py-8 md:py-12">
      <div className="container max-w-3xl">
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">Blog</h1>
        <p className="text-muted-foreground mb-12">Conteúdo para profissionais que valorizam estilo e informação</p>

        <div className="space-y-0 divide-y divide-border">
          {blogPosts.map((post, i) => (
            <ScrollReveal key={post.id} delay={i * 80}>
              <article className="py-8 group cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-accent">{post.category}</span>
                  <span className="text-[10px] text-muted-foreground">{post.date} · {post.readTime} de leitura</span>
                </div>
                <h2 className="font-display text-xl md:text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 text-pretty">{post.excerpt}</p>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                  Ler artigo <ArrowRight size={12} />
                </span>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </main>
  );
}
