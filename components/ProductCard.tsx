'use client'

import Link from "next/link";
import { Heart } from "lucide-react";

type VariationAttr = { name: string; value: string }
type Variation = { id: string; name: string; stockStatus: string; attributes: { nodes: VariationAttr[] } }

export type WooProduct = {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  price?: string;
  regularPrice?: string;
  salePrice?: string;
  image?: { sourceUrl: string; altText: string };
  variations?: { nodes: Variation[] };
}

const ProductCard = ({ product }: { product: WooProduct }) => {
  const isOnSale = !!product.salePrice && product.salePrice !== product.regularPrice;
  const displayName = product.name.replace(/ - Jaleca$/i, "");

  return (
    <Link href={`/produto/${product.slug}`} className="group block">
      <div className="relative overflow-hidden bg-secondary aspect-[3/4] mb-4">
        {product.image?.sourceUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image.sourceUrl}
            alt={product.image.altText || product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            Sem imagem
          </div>
        )}
        {isOnSale && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold tracking-widest uppercase px-3 py-1">
            PROMOÇÃO
          </span>
        )}
        <button
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 active:scale-95"
          aria-label="Favoritar"
          onClick={(e) => e.preventDefault()}
        >
          <Heart size={16} className="text-foreground" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground tracking-wide uppercase mb-1">Jaleca</p>
      <h3 className="font-body text-sm font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
        {displayName}
      </h3>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">
          {isOnSale ? product.salePrice : product.price || product.regularPrice}
        </span>
        {isOnSale && product.regularPrice && (
          <span className="text-xs text-muted-foreground line-through">{product.regularPrice}</span>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
