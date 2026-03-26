'use client'

import Link from "next/link";
import Image from "next/image";
import { Heart, GitCompareArrows, Eye } from "lucide-react";
import { useCompare } from "@/contexts/CompareContext";

type VariationAttr = { name: string; value: string }
type Variation = { id: string; name: string; stockStatus: string; price?: string; regularPrice?: string; salePrice?: string; attributes: { nodes: VariationAttr[] } }

export type WooProduct = {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  price?: string;
  regularPrice?: string;
  salePrice?: string;
  image?: { sourceUrl: string; altText: string };
  galleryImages?: { nodes: Array<{ sourceUrl: string; altText: string }> };
  variations?: { nodes: Variation[] };
}

const ProductCard = ({ product }: { product: WooProduct }) => {
  const variations = product.variations?.nodes ?? [];

  // A variation is on sale only if it has both salePrice and regularPrice and they differ
  const saleVariations = variations.filter(v =>
    v.salePrice && v.regularPrice && v.salePrice !== v.regularPrice
  );
  // Product is "on sale" only if ALL its variations are on sale (or it's a simple product with salePrice)
  const isOnSale = variations.length > 0
    ? saleVariations.length === variations.length
    : !!product.salePrice && product.salePrice !== product.regularPrice;

  // Some (but not all) variants are on sale
  const hasPartialSale = variations.length > 0 && saleVariations.length > 0 && saleVariations.length < variations.length;

  const displayName = product.name.replace(/ - Jaleca$/i, "");
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const inCompare = isInCompare(product.id);
  const hoverImage = product.galleryImages?.nodes?.[0];

  // Calculate discount % (only when all variants are on sale)
  const discount = isOnSale && product.regularPrice && product.salePrice
    ? Math.round((1 - parseFloat(product.salePrice.replace(/[^0-9,]/g,'').replace(',','.')) / parseFloat(product.regularPrice.replace(/[^0-9,]/g,'').replace(',','.'))) * 100)
    : null;

  return (
    <Link href={`/produto/${product.slug}`} className="group block">
      {/* Image container */}
      <div className="relative overflow-hidden bg-[#f5f3f0] aspect-[3/4] mb-3">
        {/* Main image */}
        {product.image?.sourceUrl ? (
          <Image
            src={product.image.sourceUrl}
            alt={product.image.altText || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm bg-secondary/20">Sem imagem</div>
        )}

        {/* Second image on hover — only if it's a different angle (same product alt text prefix) */}
        {hoverImage && hoverImage.sourceUrl !== product.image?.sourceUrl && (
          <Image
            src={hoverImage.sourceUrl}
            alt={hoverImage.altText || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
            loading="lazy"
          />
        )}

        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

        {/* Discount badge */}
        {discount && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 z-10">
            -{discount}%
          </span>
        )}
        {!discount && isOnSale && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 z-10">
            SALE
          </span>
        )}
        {hasPartialSale && (
          <span className="absolute top-3 left-3 bg-[#c4a97d] text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 z-10">
            PROMO
          </span>
        )}

        {/* Quick action buttons - top right */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 active:scale-95"
            aria-label="Favoritar"
            onClick={(e) => e.preventDefault()}
          >
            <Heart size={14} className="text-foreground" />
          </button>
          <button
            className={`w-8 h-8 bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 active:scale-95 ${inCompare ? 'text-primary' : 'text-foreground'}`}
            aria-label={inCompare ? 'Remover da comparação' : 'Comparar'}
            onClick={(e) => {
              e.preventDefault()
              if (inCompare) removeFromCompare(product.id)
              else addToCompare(product)
            }}
          >
            <GitCompareArrows size={12} />
          </button>
        </div>

        {/* "Ver Produto" CTA - appears on hover, slides up */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
          <div className="flex items-center justify-center gap-2 bg-white text-foreground text-[11px] font-semibold tracking-widest uppercase py-2.5">
            <Eye size={13} />
            Ver Produto
          </div>
        </div>
      </div>

      {/* Info */}
      <div>
        <p className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase mb-0.5">Jaleca</p>
        <h3 className="font-body text-sm font-medium text-foreground mb-2 leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2">
          {displayName}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {isOnSale ? product.salePrice : product.price || product.regularPrice}
          </span>
          {isOnSale && product.regularPrice && (
            <span className="text-xs text-muted-foreground line-through">{product.regularPrice}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
