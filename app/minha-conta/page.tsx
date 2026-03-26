import type { Metadata } from 'next'
import MinhaContaClient from './MinhaContaClient'

export const metadata: Metadata = {
  title: 'Minha Conta — Jaleca',
  description: 'Gerencie seus pedidos, endereços e pontos de fidelidade.',
  robots: { index: false, follow: false },
}

export default function MinhaContaPage() {
  return <MinhaContaClient />
}
