import Link from "next/link";
import { ArrowRight, Shield, Sparkles, Ruler } from "lucide-react";
import { graphqlClient, GET_PRODUCTS } from "@/lib/graphql";
import ProductCard, { type WooProduct } from "@/components/ProductCard";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";

async function getFeaturedProducts(): Promise<WooProduct[]> {
  try {
    const data = await graphqlClient.request<{ products: { nodes: WooProduct[] } }>(
      GET_PRODUCTS, { first: 8 }
    );
    return data.products.nodes;
  } catch {
    return [];
  }
}

export default async function Home() {
  const products = await getFeaturedProducts();

  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center bg-background">
        <div className="container grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-16">
          <div className="order-2 md:order-1 animate-fade-up">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4">JALECA</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] text-balance mb-6">
              Elegância clínica em uma presença impecável
            </h1>
            <p className="text-muted-foreground text-pretty max-w-md mb-8 leading-relaxed">
              Jalecos com linguagem editorial, caimento refinado e uma paleta suave que traduz cuidado, confiança e sofisticação.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-xl px-7 py-3.5 text-sm font-semibold tracking-wide uppercase transition-colors duration-200 hover:bg-primary/90 active:scale-[0.97]">
                <Link href="/produtos?novidades=true">
                  VER NOVIDADES
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl border-primary text-primary px-7 py-3.5 text-sm font-semibold tracking-wide uppercase transition-colors duration-200 hover:bg-primary/5 active:scale-[0.97]">
                <Link href="/produtos">
                  EXPLORAR COLEÇÃO
                </Link>
              </Button>
            </div>
          </div>
          <div className="order-1 md:order-2 animate-fade-up animation-delay-200">
            <div className="relative aspect-[3/4] max-h-[70vh] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-jaleca.jpg"
                alt="Profissional usando jaleco premium Jaleca"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <ScrollReveal>
        <section className="py-20 md:py-28 bg-card">
          <div className="container">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-semibold mb-2">Em Destaque</h2>
                <p className="text-muted-foreground">Os favoritos dos nossos clientes</p>
              </div>
              <Link href="/produtos" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-4">
                Ver todos <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {products.map((p, i) => (
                <ScrollReveal key={p.id} delay={i * 80}>
                  <ProductCard product={p} />
                </ScrollReveal>
              ))}
            </div>
            <div className="sm:hidden mt-8 text-center">
              <Link href="/produtos" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-4">
                Ver todos <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Virtual try-on */}
      <ScrollReveal>
        <section className="py-20 md:py-24">
          <div className="container">
            <div className="px-6 py-12 text-center md:px-12 md:py-16">
              <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4 text-balance">Experimente Antes de Comprar</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty leading-relaxed">
                Veja como o jaleco fica em você com nossa tecnologia de prova virtual
              </p>
              <Button asChild size="lg" className="rounded-none border border-secondary bg-[hsl(var(--warm-surface))] px-7 py-3.5 text-sm font-semibold tracking-wide uppercase text-ink transition-colors duration-200 hover:bg-secondary/20 hover:text-ink active:scale-[0.97]">
                <Link href="/produtos">
                  Experimentar Agora
                  <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Differentials */}
      <ScrollReveal>
        <section className="py-20 md:py-28">
          <div className="container">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-center mb-16">Por Que Jaleca?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Sparkles, title: "Tecidos Premium", desc: "Materiais anti-microbianos com stretch e conforto térmico." },
                { icon: Ruler, title: "Tamanhos para Todos", desc: "Do PP ao G3, com tabela de medidas por modelo para garantir o tamanho certo." },
                { icon: Sparkles, title: "Estilo e Elegância", desc: "Jalecos que combinam funcionalidade profissional com design moderno." },
                { icon: Shield, title: "Garantia de Qualidade", desc: "Cada peça passa por rigoroso controle de qualidade." },
              ].map((d, i) => (
                <ScrollReveal key={d.title} delay={i * 100}>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <d.icon size={22} className="text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2">{d.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px] mx-auto">{d.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* CTA */}
      <ScrollReveal>
        <section className="border-b border-[#E5E5E5] bg-background py-20 text-ink md:py-28">
          <div className="container text-center max-w-2xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4 text-balance">
              Pronto para elevar seu padrão profissional?
            </h2>
            <p className="mb-8 max-w-md mx-auto text-muted-foreground">
              Junte-se a milhares de profissionais da saúde que já descobriram a Jaleca.
            </p>
            <Link
              href="/produtos"
              className="inline-flex items-center gap-2 rounded-none border border-ink bg-ink px-7 py-3.5 text-sm font-semibold tracking-wide uppercase text-background transition-colors duration-200 hover:bg-ink/90 active:scale-[0.97]"
            >
              Comprar Agora
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}
