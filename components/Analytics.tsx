'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

// ── GA4 helpers ──────────────────────────────────────────────────────────────

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
    fbq?: (...args: unknown[]) => void
    _fbq?: unknown
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  window.gtag?.('event', name, params)
  window.fbq?.('trackCustom', name, params)
}

export function trackPurchase(
  orderId: string,
  value: number,
  items: Array<{ id: string; name: string; price: number; quantity: number }>
) {
  if (typeof window === 'undefined') return

  // GA4
  window.gtag?.('event', 'purchase', {
    transaction_id: orderId,
    value,
    currency: 'BRL',
    items: items.map(i => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  })

  // Meta Pixel
  window.fbq?.('track', 'Purchase', {
    value,
    currency: 'BRL',
    contents: items.map(i => ({ id: i.id, quantity: i.quantity })),
    content_type: 'product',
    order_id: orderId,
  })
}

export function trackAddToCart(product: {
  id: string
  name: string
  price: string
  quantity?: number
}) {
  if (typeof window === 'undefined') return

  const price = parseFloat(product.price.replace(/[^0-9,]/g, '').replace(',', '.')) || 0
  const qty = product.quantity ?? 1

  // GA4
  window.gtag?.('event', 'add_to_cart', {
    currency: 'BRL',
    value: price * qty,
    items: [{ item_id: product.id, item_name: product.name, price, quantity: qty }],
  })

  // Meta Pixel
  window.fbq?.('track', 'AddToCart', {
    value: price * qty,
    currency: 'BRL',
    contents: [{ id: product.id, quantity: qty }],
    content_type: 'product',
  })
}

// ── Pageview tracker (inner — needs Suspense) ─────────────────────────────────

function PageviewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA4_ID || !window.gtag) return
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    window.gtag('config', GA4_ID, { page_path: url })
    window.fbq?.('track', 'PageView')
  }, [pathname, searchParams])

  return null
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Analytics() {
  return (
    <>
      {/* Google Analytics 4 */}
      {GA4_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA4_ID}', { send_page_view: false });
              `,
            }}
          />
        </>
      )}

      {/* Meta Pixel */}
      {META_PIXEL_ID && (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
            `,
          }}
        />
      )}

      {/* Pageview tracking on route changes */}
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
    </>
  )
}
