'use client'

import Link from "next/link";
import { useState } from "react";
import { Instagram, Facebook, Youtube, Send, ShieldCheck } from "lucide-react";
import {
  IconMastercard, IconVisa, IconAmex, IconDiners,
  IconHipercard, IconElo, IconPix, IconBoleto,
} from "@/components/PaymentIcons";

const Footer = () => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer>
      {/* Main footer */}
      <div className="bg-background text-foreground py-16">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand + newsletter */}
            <div>
              <p className="font-display text-2xl font-semibold tracking-widest mb-3">JALECA</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
                Uniformes profissionais premium para quem cuida de vidas com estilo, confiança e elegância.
              </p>

              {/* Newsletter */}
              <p className="text-xs font-semibold tracking-widest uppercase mb-3">Receba novidades</p>
              {subscribed ? (
                <p className="text-sm text-primary font-medium">✓ Inscrito com sucesso!</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="flex-1 border border-border bg-background px-3 py-2.5 text-xs focus:outline-none focus:border-foreground transition-colors"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-foreground text-background px-3 py-2.5 hover:bg-foreground/90 transition-colors"
                    aria-label="Inscrever"
                  >
                    <Send size={14} />
                  </button>
                </form>
              )}

              {/* Social */}
              <div className="flex items-center gap-3 mt-6">
                <a href="https://instagram.com/jaleca.com.br" target="_blank" rel="noopener noreferrer"
                   className="w-9 h-9 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-all duration-200 hover:scale-110">
                  <Instagram size={16} />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                   className="w-9 h-9 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-all duration-200 hover:scale-110">
                  <Facebook size={16} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                   className="w-9 h-9 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-all duration-200 hover:scale-110">
                  <Youtube size={16} />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-5 text-foreground">Loja</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  { label: 'Todos os Produtos', href: '/produtos' },
                  { label: 'Jalecos', href: '/produtos?cat=Jalecos' },
                  { label: 'Scrubs', href: '/produtos?cat=Scrubs' },
                  { label: 'Novidades', href: '/produtos?novidades=true' },
                  { label: 'Promoções', href: '/produtos?sale=true' },
                ].map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-foreground hover:translate-x-0.5 transition-all duration-150 inline-block">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-5 text-foreground">Informações</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  { label: 'Tabela de Medidas', href: '/medidas' },
                  { label: 'Trocas e Devoluções', href: '/trocas-e-devolucoes' },
                  { label: 'Política de Privacidade', href: '/privacidade' },
                  { label: 'Termos de Uso', href: '/termos' },
                  { label: 'Blog', href: '/blog' },
                  { label: 'Lookbook', href: '/lookbook' },
                ].map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-foreground hover:translate-x-0.5 transition-all duration-150 inline-block">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-5 text-foreground">Contato</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="https://wa.me/553133672467" target="_blank" rel="noopener noreferrer"
                     className="hover:text-foreground transition-colors">
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a href="mailto:contato@jaleca.com.br" className="hover:text-foreground transition-colors">
                    contato@jaleca.com.br
                  </a>
                </li>
                <li className="pt-2">
                  <p className="text-[11px] leading-relaxed">
                    Seg–Sex: 8h às 18h<br/>
                    Sáb: 8h às 12h
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Payment + Security */}
      <div className="border-t border-border bg-background py-6">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Payment methods */}
            <div className="flex flex-col items-center md:items-start gap-3">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                Formas de pagamento
              </p>
              <div className="flex items-center flex-wrap gap-2">
                {[IconMastercard, IconVisa, IconAmex, IconDiners, IconHipercard, IconElo, IconPix, IconBoleto].map((Icon, i) => (
                  <div key={i} className="border border-border rounded shadow-sm overflow-hidden h-7 flex items-center">
                    <Icon />
                  </div>
                ))}
              </div>
            </div>

            {/* Security */}
            <div className="flex flex-col items-center md:items-end gap-3">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                Compra 100% segura
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 border border-green-200 bg-green-50 text-green-700 px-3 py-1.5 text-[11px] font-semibold rounded">
                  <ShieldCheck size={14} />
                  Site Seguro SSL
                </div>
                <div className="flex items-center gap-1.5 border border-blue-200 bg-blue-50 text-blue-700 px-3 py-1.5 text-[11px] font-semibold rounded">
                  <ShieldCheck size={14} />
                  Google Safe
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border bg-background py-4">
        <div className="container text-center text-xs text-muted-foreground">
          <p>© 2026 Jaleca — Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer;
