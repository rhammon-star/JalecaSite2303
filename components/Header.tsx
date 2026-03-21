'use client'

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Heart, Menu, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, openCart } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 -ml-2 active:scale-95 transition-transform"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-sem-tagline.jpg" alt="Jaleca" style={{ height: '72px', width: 'auto' }} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide uppercase">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
            Início
          </Link>
          <Link href="/produtos" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
            Loja
          </Link>
          <Link href="/produtos?cat=Jalecos" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
            Jalecos
          </Link>
          <Link href="/produtos?cat=Scrubs" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
            Scrubs
          </Link>
          <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
            Blog
          </Link>
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors active:scale-95" aria-label="Buscar">
            <Search size={20} />
          </button>
          <button className="hidden sm:block p-2 text-muted-foreground hover:text-foreground transition-colors active:scale-95" aria-label="Favoritos">
            <Heart size={20} />
          </button>
          <button
            onClick={openCart}
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors active:scale-95"
            aria-label="Carrinho"
          >
            <ShoppingBag size={20} />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {totalItems}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="container py-6 flex flex-col gap-4 text-sm font-medium tracking-wide uppercase">
            <Link href="/" onClick={() => setMobileOpen(false)} className="py-2 text-foreground">Início</Link>
            <Link href="/produtos" onClick={() => setMobileOpen(false)} className="py-2 text-foreground">Loja</Link>
            <Link href="/produtos?cat=Jalecos" onClick={() => setMobileOpen(false)} className="py-2 text-foreground">Jalecos</Link>
            <Link href="/produtos?cat=Scrubs" onClick={() => setMobileOpen(false)} className="py-2 text-foreground">Scrubs</Link>
            <Link href="/blog" onClick={() => setMobileOpen(false)} className="py-2 text-foreground">Blog</Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
