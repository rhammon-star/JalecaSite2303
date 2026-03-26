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

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Jaleca',
    url: 'https://jaleca.com.br',
    logo: 'https://jaleca.com.br/logo.svg',
    description: 'Jalecos e uniformes profissionais para profissionais da saúde.',
    sameAs: [
      'https://www.instagram.com/jaleca.com.br',
    ],
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Jaleca',
    url: 'https://jaleca.com.br',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://jaleca.com.br/produtos?busca={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(organizationJsonLd).replace(/</g, '\\u003c'),
      }}
    />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(websiteJsonLd).replace(/</g, '\\u003c'),
      }}
    />
    <main className="bg-background">
      {/* Hero — editorial luxury split */}
      <section className="relative w-full overflow-hidden bg-[#faf9f7]" style={{ minHeight: '92vh' }}>
        <div className="flex flex-col md:flex-row h-full" style={{ minHeight: '92vh' }}>

          {/* LEFT — editorial text panel */}
          <div className="relative z-10 flex flex-col justify-center w-full md:w-[35%] px-8 md:pl-16 lg:pl-20 md:pr-4 py-20 md:py-0">
            <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-[#b8a98a] mb-4">
              Nova Coleção 2026
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.8rem] font-semibold leading-[1.1] text-[#1a1a1a] mb-5 animate-fade-up">
              Elegância clínica em cada detalhe
            </h1>
            <p className="text-[#777] text-sm leading-relaxed mb-8">
              Jalecos com caimento refinado e paleta suave para quem cuida com cuidado.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/produtos?novidades=true"
                className="inline-flex items-center gap-2 bg-[#c4a97d] text-white px-6 py-3 text-[11px] font-semibold tracking-widest uppercase transition-all duration-300 hover:bg-[#a8895f] hover:tracking-[0.2em] active:scale-[0.97]"
              >
                Ver Novidades
                <ArrowRight size={13} />
              </Link>
              <Link
                href="/produtos"
                className="inline-flex items-center gap-2 border border-[#c4a97d] text-[#c4a97d] px-6 py-3 text-[11px] font-semibold tracking-widest uppercase transition-all duration-300 hover:bg-[#c4a97d] hover:text-white active:scale-[0.97]"
              >
                Explorar Coleção
              </Link>
            </div>
          </div>

          {/* RIGHT — photo centered with controlled zoom */}
          <div className="relative w-full md:w-[65%] overflow-hidden bg-[#e8e4de]" style={{ minHeight: '60vw' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-v6.jpg"
              alt="Profissional usando jaleco premium Jaleca"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center 8%' }}
              fetchPriority="high"
            />
            {/* Left fade to blend panels */}
            <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[#faf9f7] to-transparent z-10" />
          </div>

        </div>
      </section>

      {/* Category editorial banners */}
      <section className="py-8 md:py-12 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Jalecos',
                subtitle: 'Coleção 2026',
                href: '/produtos?cat=Jalecos',
                bg: 'bg-[#f0ede8]',
                accent: 'text-[#5a4a3a]',
              },
              {
                title: 'Scrubs',
                subtitle: 'Conforto & Estilo',
                href: '/produtos?cat=Scrubs',
                bg: 'bg-[#e8edf0]',
                accent: 'text-[#3a4a5a]',
              },
              {
                title: 'Novidades',
                subtitle: 'Recém chegadas',
                href: '/produtos?novidades=true',
                bg: 'bg-[#edf0e8]',
                accent: 'text-[#3a5a3a]',
              },
            ].map(cat => (
              <Link
                key={cat.title}
                href={cat.href}
                className={`group relative overflow-hidden ${cat.bg} aspect-[4/3] md:aspect-[3/4] flex flex-col justify-end p-6 md:p-8`}
              >
                <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
                  <p className={`text-[10px] font-semibold tracking-[0.3em] uppercase ${cat.accent} mb-1 opacity-70`}>
                    {cat.subtitle}
                  </p>
                  <h3 className={`font-display text-2xl md:text-3xl font-semibold ${cat.accent} mb-3`}>
                    {cat.title}
                  </h3>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase ${cat.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                    Explorar →
                  </span>
                </div>
                {/* Overlay shine */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
              </Link>
            ))}
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

      {/* Testimonials */}
      <ScrollReveal>
        <section className="py-20 md:py-28 bg-card">
          <div className="container">
            <div className="text-center mb-12">
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-muted-foreground mb-3">Depoimentos</p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold">O que dizem nossos clientes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Dra. Ana Carolina',
                  role: 'Médica — São Paulo, SP',
                  text: 'O caimento é impecável e o tecido é extremamente confortável para longas jornadas. Meu jaleco Jaleca é o mais elogiado da clínica!',
                  stars: 5,
                },
                {
                  name: 'Enf. Patricia Mendes',
                  role: 'Enfermeira — Belo Horizonte, MG',
                  text: 'Finalmente um uniforme que une elegância e praticidade. As cores são lindas e o material não amassa durante o plantão.',
                  stars: 5,
                },
                {
                  name: 'Dr. Felipe Souza',
                  role: 'Cirurgião — Rio de Janeiro, RJ',
                  text: 'Comprei o scrub e fiquei impressionado com a qualidade. Entrega rápida, produto exatamente como descrito. Já estou na terceira compra!',
                  stars: 5,
                },
              ].map((t, i) => (
                <ScrollReveal key={t.name} delay={i * 100}>
                  <div className="bg-background border border-border p-7 flex flex-col gap-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.stars }).map((_, j) => (
                        <span key={j} className="text-amber-400 text-sm">★</span>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.text}"</p>
                    <div className="mt-auto pt-4 border-t border-border">
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-[11px] text-muted-foreground">{t.role}</p>
                    </div>
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
    </>
  );
}
