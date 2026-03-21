import Link from "next/link";

const Footer = () => (
  <footer className="bg-background text-ink">
    <div className="container py-16 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
        {/* Brand */}
        <div className="md:col-span-1">
          <p className="font-display text-2xl font-semibold tracking-wide mb-4">JALECA</p>
          <p className="max-w-xs text-sm leading-relaxed text-[#4A4A4A]">
            Uniformes profissionais premium para quem cuida de vidas com estilo e confiança.
          </p>
        </div>

        {/* Links */}
        <div>
          <p className="mb-4 text-xs font-semibold tracking-widest uppercase text-[#4A4A4A]">Loja</p>
          <ul className="space-y-3 text-sm text-[#4A4A4A]">
            <li><Link href="/produtos" className="transition-opacity hover:opacity-100">Todos os Produtos</Link></li>
            <li><Link href="/produtos?cat=Jalecos" className="transition-opacity hover:opacity-100">Jalecos</Link></li>
            <li><Link href="/produtos?cat=Scrubs" className="transition-opacity hover:opacity-100">Scrubs</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-4 text-xs font-semibold tracking-widest uppercase text-[#4A4A4A]">Ajuda</p>
          <ul className="space-y-3 text-sm text-[#4A4A4A]">
            <li><a href="#" className="transition-opacity hover:opacity-100">Tabela de Medidas</a></li>
            <li><a href="#" className="transition-opacity hover:opacity-100">Trocas e Devoluções</a></li>
            <li><a href="#" className="transition-opacity hover:opacity-100">Fale Conosco</a></li>
          </ul>
        </div>

        <div>
          <p className="mb-4 text-xs font-semibold tracking-widest uppercase text-[#4A4A4A]">Contato</p>
          <ul className="space-y-3 text-sm text-[#4A4A4A]">
            <li>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-100"
              >
                WhatsApp
              </a>
            </li>
            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-100">Instagram</a></li>
            <li><a href="mailto:contato@jaleca.com.br" className="transition-opacity hover:opacity-100">contato@jaleca.com.br</a></li>
          </ul>
        </div>
      </div>

      <div className="mt-16 border-t border-[#E5E5E5] pt-8 text-center text-xs text-[#4A4A4A]">
        © 2026 Jaleca. Todos os direitos reservados.
      </div>
    </div>
  </footer>
);

export default Footer;
