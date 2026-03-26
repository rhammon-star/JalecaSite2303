import type { Metadata } from 'next'
import CheckoutClient from './CheckoutClient'

export const metadata: Metadata = {
  title: 'Finalizar Compra — Jaleca',
  description: 'Finalize sua compra com segurança. Frete calculado em tempo real via Melhor Envio.',
  robots: { index: false, follow: false },
}

export default function CheckoutPage() {
  return <CheckoutClient />
}
