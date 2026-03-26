'use client'

import { useState, useMemo } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { categories, colorOptions, sizeOptions, genderOptions } from "@/lib/products";
import ProductCard, { type WooProduct } from "@/components/ProductCard";
import ScrollReveal from "@/components/ScrollReveal";
import Breadcrumb from "@/components/Breadcrumb";

const PAGE_SIZE = 12;

function parsePrice(price?: string): number {
  if (!price) return 0;
  return parseFloat(price.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
}

function getAttrValues(product: WooProduct, attrNames: string[]): string[] {
  const values: string[] = [];
  for (const v of product.variations?.nodes ?? []) {
    for (const a of v.attributes.nodes) {
      if (attrNames.some(n => a.name.toLowerCase().includes(n))) {
        values.push(a.value.toLowerCase());
      }
    }
  }
  return values;
}

function matchesCategory(name: string, slug: string, cat: string) {
  if (cat === "Todos") return true;
  const lower = (name + " " + slug).toLowerCase();
  if (cat === "Jalecos") return lower.includes("jaleco");
  if (cat === "Scrubs") return lower.includes("scrub");
  if (cat === "Calças") return lower.includes("calça") || lower.includes("calca");
  if (cat === "Acessórios") return lower.includes("acessor") || lower.includes("touca");
  return true;
}

function matchesGender(name: string, gender: string) {
  if (gender === "Todos") return true;
  const lower = name.toLowerCase();
  if (gender === "Feminino") return lower.includes("feminino") || lower.includes("fem");
  if (gender === "Masculino") return lower.includes("masculino") || lower.includes("masc");
  return true;
}

function matchesColor(product: WooProduct, color: string | null) {
  if (!color) return true;
  const vals = getAttrValues(product, ["cor", "color"]);
  if (vals.length === 0) return true;
  return vals.some(v => v.includes(color.toLowerCase()));
}

function matchesSize(product: WooProduct, size: string | null) {
  if (!size) return true;
  const vals = getAttrValues(product, ["tamanho", "size", "tam"]);
  if (vals.length === 0) return true;
  return vals.some(v => v.toLowerCase() === size.toLowerCase());
}

function matchesSale(product: WooProduct, saleOnly: boolean) {
  if (!saleOnly) return true;
  const variations = product.variations?.nodes ?? [];
  if (variations.length > 0) {
    return variations.some(v => v.salePrice && v.regularPrice && v.salePrice !== v.regularPrice);
  }
  return !!product.salePrice && product.salePrice !== product.regularPrice;
}

type SortOption = "relevance" | "price_asc" | "price_desc" | "newest";

const SORT_LABELS: Record<SortOption, string> = {
  relevance: "Relevância",
  price_asc: "Menor Preço",
  price_desc: "Maior Preço",
  newest: "Novidades",
};

type Props = { products: WooProduct[]; initialCat?: string; initialSale?: boolean; initialNovidades?: boolean };

const FilterPanel = ({
  selectedCategory, setSelectedCategory,
  selectedGender, setSelectedGender,
  selectedColor, setSelectedColor,
  selectedSize, setSelectedSize,
  clearFilters, hasActive,
}: {
  selectedCategory: string; setSelectedCategory: (v: string) => void;
  selectedGender: string; setSelectedGender: (v: string) => void;
  selectedColor: string | null; setSelectedColor: (v: string | null) => void;
  selectedSize: string | null; setSelectedSize: (v: string | null) => void;
  clearFilters: () => void; hasActive: boolean;
}) => (
  <div className="space-y-8">
    <div>
      <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">Categoria</p>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`filter-chip px-3 py-1.5 text-xs font-medium tracking-wide ${selectedCategory === c ? "filter-chip--active" : ""}`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
    <div>
      <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">Gênero</p>
      <div className="flex flex-wrap gap-2">
        {genderOptions.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGender(g)}
            className={`filter-chip px-3 py-1.5 text-xs font-medium tracking-wide ${selectedGender === g ? "filter-chip--active" : ""}`}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
    <div>
      <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">Cor</p>
      <div className="flex flex-wrap gap-2">
        {colorOptions.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedColor(selectedColor === c ? null : c)}
            className={`filter-chip px-3 py-1.5 text-xs font-medium tracking-wide ${selectedColor === c ? "filter-chip--active" : ""}`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
    <div>
      <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">Tamanho</p>
      <div className="flex flex-wrap gap-2">
        {sizeOptions.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedSize(selectedSize === s ? null : s)}
            className={`filter-chip flex h-10 w-10 items-center justify-center text-xs font-medium tracking-wide uppercase ${selectedSize === s ? "filter-chip--active" : ""}`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
    {hasActive && (
      <button onClick={clearFilters} className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors">
        Limpar filtros
      </button>
    )}
  </div>
);

export default function ProductsClient({ products, initialCat = "Todos", initialSale = false, initialNovidades = false }: Props) {
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [selectedGender, setSelectedGender] = useState("Todos");
  const [saleOnly] = useState(initialSale);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [sortOpen, setSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    let base = products.filter((p) => {
      if (!matchesCategory(p.name, p.slug, selectedCategory)) return false;
      if (!matchesGender(p.name, selectedGender)) return false;
      if (!matchesColor(p, selectedColor)) return false;
      if (!matchesSize(p, selectedSize)) return false;
      if (!matchesSale(p, saleOnly)) return false;
      return true;
    });

    // "novidades" = last N products (reversed order from API)
    if (initialNovidades) base = [...base].reverse();

    if (sortBy === "price_asc") {
      return [...base].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    }
    if (sortBy === "price_desc") {
      return [...base].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    }
    if (sortBy === "newest") {
      return [...base].reverse();
    }
    return base;
  }, [products, selectedCategory, selectedGender, selectedColor, selectedSize, sortBy, saleOnly, initialNovidades]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const hasActive = selectedCategory !== "Todos" || selectedGender !== "Todos" || !!selectedColor || !!selectedSize;
  const clearFilters = () => {
    setSelectedCategory("Todos");
    setSelectedGender("Todos");
    setSelectedColor(null);
    setSelectedSize(null);
    setVisibleCount(PAGE_SIZE);
  };

  const panelProps = { selectedCategory, setSelectedCategory, selectedGender, setSelectedGender, selectedColor, setSelectedColor, selectedSize, setSelectedSize, clearFilters, hasActive };

  return (
    <main className="py-8 md:py-12">
      <div className="container">
        <Breadcrumb crumbs={[
          { label: 'Início', href: '/' },
          { label: selectedCategory === 'Todos' ? 'Produtos' : selectedCategory },
        ]} />
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold mb-1">Nossos Produtos</h1>
            <p className="text-muted-foreground text-sm">
              {filtered.length} produto{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 border border-border px-3 py-2 text-xs font-medium hover:bg-secondary/20 transition-colors"
            >
              {SORT_LABELS[sortBy]}
              <ChevronDown size={13} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1 z-10 bg-background border border-border shadow-lg min-w-[160px]">
                {(Object.keys(SORT_LABELS) as SortOption[]).map(opt => (
                  <button
                    key={opt}
                    onClick={() => { setSortBy(opt); setSortOpen(false); setVisibleCount(PAGE_SIZE); }}
                    className={`block w-full text-left px-4 py-2.5 text-xs hover:bg-secondary/30 transition-colors ${sortBy === opt ? 'font-semibold' : ''}`}
                  >
                    {SORT_LABELS[opt]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile filter toggle */}
        <button
          className="md:hidden flex items-center gap-2 text-sm font-medium mb-6 active:scale-95 transition-transform"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          {filtersOpen ? <X size={16} /> : <SlidersHorizontal size={16} />}
          {filtersOpen ? "Fechar Filtros" : "Filtros"}
          {hasActive && <span className="w-4 h-4 rounded-full bg-ink text-background text-[9px] flex items-center justify-center font-bold">!</span>}
        </button>

        <div className="flex gap-12">
          {/* Sidebar — desktop */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <FilterPanel {...panelProps} />
          </aside>

          {/* Mobile overlay */}
          {filtersOpen && (
            <div className="md:hidden fixed inset-0 z-40 bg-background p-6 overflow-y-auto animate-fade-in">
              <div className="flex justify-between items-center mb-8">
                <p className="font-display text-lg font-semibold">Filtros</p>
                <button onClick={() => setFiltersOpen(false)} className="p-2 active:scale-95"><X size={20} /></button>
              </div>
              <FilterPanel {...panelProps} />
              <button
                onClick={() => setFiltersOpen(false)}
                className="mt-8 w-full bg-ink text-background py-3 text-xs font-semibold tracking-widest uppercase"
              >
                Ver {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
              </button>
            </div>
          )}

          {/* Product grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">Nenhum produto encontrado com esses filtros.</p>
                <button onClick={clearFilters} className="text-sm text-primary underline underline-offset-4">Limpar filtros</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {visible.map((p, i) => (
                    <ScrollReveal key={p.id} delay={i * 60}>
                      <ProductCard product={p} />
                    </ScrollReveal>
                  ))}
                </div>
                {hasMore && (
                  <div className="mt-10 text-center">
                    <button
                      onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                      className="border border-border px-8 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-secondary/20 transition-colors active:scale-95"
                    >
                      Carregar mais ({filtered.length - visibleCount} restantes)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
