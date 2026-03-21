import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import BackButton from "@/components/BackButton";
import { CartProvider } from "@/contexts/CartContext";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jaleca — Jalecos e Mimos",
  description: "Jalecos modernos e sofisticados para profissionais. Elegância clínica em uma presença impecável.",
  keywords: "jaleco médico, jaleco feminino, jaleco masculino, jaleco enfermagem, uniforme profissional",
  openGraph: {
    title: "Jaleca — Jalecos e Mimos",
    description: "Jalecos modernos e sofisticados para profissionais.",
    url: "https://jaleca.com.br",
    siteName: "Jaleca",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`h-full antialiased ${cormorant.variable} ${dmSans.variable}`}>
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Header />
          <CartDrawer />
          <BackButton />
          <div className="flex-1">{children}</div>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
