import type { Metadata } from 'next'
import WishlistClient from './WishlistClient'

export const metadata: Metadata = {
  title: 'Favoritos — Jaleca',
}

export default function WishlistPage() {
  return <WishlistClient />
}
