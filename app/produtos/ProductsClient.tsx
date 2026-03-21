'use client'

import { useState, useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { categories, colorOptions, sizeOptions, genderOptions } from "@/lib/products";
import ProductCard, { type WooProduct } from "@/components/ProductCard";
import ScrollReveal from "@/components/ScrollReveal";

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

type Props = { products: WooProduct[]; initialCat?: string };

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

export default function ProductsClient({ products, initialCat = "Todos" }: Props) {
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [selectedGender, setSelectedGender] = useState("Todos");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (!matchesCategory(p.name, p.slug, selectedCategory)) return false;
      if (!matchesGender(p.name, selectedGender)) return false;
      if (!matchesColor(p, selectedColor)) return false;
      if (!matchesSize(p, selectedSize)) return false;
      return true;
    });
  }, [products, selectedCategory, selectedGender, selectedColor, selectedSize]);

  const hasActive = selectedCategory !== "Todos" || selectedGender !== "Todos" || !!selectedColor || !!selectedSize;
  const clearFilters = () => { setSelectedCategory("Todos"); setSelectedGender("Todos"); setSelectedColor(null); setSelectedSize(null); };

  const panelProps = { selectedCategory, setSelectedCategory, selectedGender, setSelectedGender, selectedColor, setSelectedColor, selectedSize, setSelectedSize, clearFilters, hasActive };

  return (
    <main className="py-8 md:py-12">
      <div className="container">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">Nossos Produtos</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} produto{filtered.length !== 1 ? "s" : ""}</p>
        </div>

        {/* Mobile filter toggle */}
        <button
          className="md:hidden flex items-center gap-2 text-sm font-medium mb-6 active:scale-95 transition-transform"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          {filtersOpen ? <X size={16} /> : <SlidersHorizontal size={16} />}
          {filtersOpen ? "Fechar Filtros" : "Filtros"}
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
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filtered.map((p, i) => (
                  <ScrollReveal key={p.id} delay={i * 60}>
                    <ProductCard product={p} />
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
