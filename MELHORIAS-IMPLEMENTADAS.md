# Melhorias Implementadas — Jaleca Next.js

Data: 23/03/2026

---

## O que foi implementado

### 1. WhatsApp Flutuante
- **Arquivo:** `components/WhatsAppButton.tsx`
- Botão fixo no canto inferior direito (fixed, z-50)
- Ícone SVG inline do WhatsApp (verde #25D366)
- Animação pulse no hover
- Tooltip "Fale conosco"
- **Substituir:** número `5531XXXXXXXXX` pelo número real da Jaleca

### 2. Pop-up de Desconto — Primeira Compra
- **Arquivo:** `components/FirstPurchasePopup.tsx`
- **API:** `app/api/leads/route.ts` → salva em `data/leads.json`
- Aparece após 8 segundos, apenas na primeira visita (cookie `jaleca-popup-seen`)
- Captura e-mail, exibe cupom `PRIMEIRACOMPRA10`
- Overlay escuro, design consistente com o projeto

### 3. Google Analytics 4 + Meta Pixel
- **Arquivo:** `components/Analytics.tsx`
- GA4 com rastreamento automático de pageviews via `usePathname`
- Meta Pixel com `track('PageView')`
- Funções exportadas: `trackEvent()`, `trackPurchase()`, `trackAddToCart()`
- `CartContext` já chama `trackAddToCart` em cada `addItem`
- `pedido-confirmado/[orderId]/PurchaseTracker.tsx` chama `trackPurchase` no mount
- **Substituir:** `NEXT_PUBLIC_GA4_ID` e `NEXT_PUBLIC_META_PIXEL_ID` no `.env.local`

### 4. Upsell/Cross-sell no Checkout
- **Arquivo:** `app/checkout/CheckoutClient.tsx`
- Seção "Você também pode gostar" acima do resumo do pedido
- Busca 3 produtos via GraphQL (excluindo os já no carrinho)
- Cards compactos com imagem, nome, preço e botão "+"
- Usa `next/image` para as imagens

### 5. Recuperação de Carrinho Abandonado
- **APIs:**
  - `app/api/cart-recovery/route.ts` — salva em `data/abandoned-carts.json`
  - `app/api/cart-recovery/send/route.ts` — envia e-mail de recuperação
- **Componente:** `components/CartRecoveryCapture.tsx`
- Toast aparece após 2 minutos de inatividade com carrinho não vazio
- Captura e-mail + salva carrinho
- **Configurar:** variáveis SMTP no `.env.local` para envio real

### 6. E-mail Transacional Personalizado
- **Arquivo:** `lib/email.ts`
- Funções: `sendOrderConfirmation`, `sendOrderShipped`, `sendWelcome`, `sendPasswordReset`, `sendCartRecovery`
- Templates HTML com identidade visual da Jaleca
- Usa nodemailer se instalado; caso contrário, simula (loga no console)
- `app/api/orders/route.ts` já chama `sendOrderConfirmation` após criar pedido
- **Para ativar:** instalar `npm install nodemailer @types/nodemailer` e configurar variáveis SMTP

### 7. Notificações Push — De Volta ao Estoque
- **APIs:**
  - `app/api/push/subscribe/route.ts` — salva subscriptions em `data/push-subscriptions.json`
  - `app/api/push/notify/route.ts` — envia notificação para inscritos (simula sem web-push)
- **Componente:** `components/BackInStockButton.tsx` — aparece quando produto está OUT_OF_STOCK
- **Service Worker:** `public/sw.js` — trata eventos `push` e `notificationclick`
- Integrado em `ProductDetailClient.tsx`
- **Para ativar:** instalar `npm install web-push`, gerar chaves VAPID e configurar `NEXT_PUBLIC_VAPID_PUBLIC_KEY`

### 8. Programa de Fidelidade (Pontos)
- **Arquivos:**
  - `lib/loyalty.ts` — lógica server-side (fs, dados em `data/loyalty.json`)
  - `lib/loyalty-utils.ts` — função pura `getPointsDiscount()` (client-safe)
  - `app/api/loyalty/route.ts` — GET (saldo) e POST (add/redeem)
  - `components/LoyaltyBadge.tsx` — saldo no header (só quando logado)
- **Minha Conta:** aba "Meus Pontos" adicionada em `MinhaContaClient.tsx`
- Regras: 1 BRL = 1 ponto | 100 pontos = R$5 de desconto

### 9. Chat ao Vivo (Tawk.to)
- **Arquivo:** `components/TawkToChat.tsx`
- Script lazy-loaded
- Não renderiza nada se `NEXT_PUBLIC_TAWK_PROPERTY_ID=PLACEHOLDER`
- **Para ativar:** definir `NEXT_PUBLIC_TAWK_PROPERTY_ID` no `.env.local`

### 10. Lookbook / Editorial
- **Arquivo:** `app/lookbook/page.tsx`
- Grid editorial com dados hardcoded (array de looks)
- "Shop the look" com produtos linkados por slug
- Usa `next/image` com `priority` no primeiro item
- Link "Lookbook" adicionado ao Header (desktop e mobile)

### 11. Comparador de Produtos
- **Arquivos:**
  - `contexts/CompareContext.tsx` — contexto com sessionStorage, máx 3 produtos
  - `components/CompareBar.tsx` — barra fixa no bottom quando há produtos
  - `app/comparar/page.tsx` — tabela de comparação lado a lado
- Botão "Comparar" adicionado a `ProductCard.tsx` (ícone GitCompareArrows)
- `CompareProvider` adicionado ao `layout.tsx`

### 12. Core Web Vitals — Performance
- **`next.config.ts`:** adicionado `formats: ['image/avif', 'image/webp']`, `minimumCacheTTL`, `compress`, `poweredByHeader: false`, headers de segurança e cache para imagens
- **`ProductCard.tsx`:** `<img>` substituído por `<Image>` do next/image com `fill` e `sizes`
- **`ProductDetailClient.tsx`:** imagem principal substituída por `<Image>` com `priority`
- **`CheckoutClient.tsx`:** imagens substituídas por `<Image>`
- **`components/Skeleton.tsx`:** skeletons criados (`ProductCardSkeleton`, `ProductDetailSkeleton`, `BlogPostSkeleton`)

---

## Placeholders que precisam ser substituídos

| Variável | Arquivo | O que fazer |
|----------|---------|-------------|
| `5531XXXXXXXXX` | `components/WhatsAppButton.tsx` | Substituir pelo número real no formato internacional |
| `NEXT_PUBLIC_GA4_ID=G-PLACEHOLDER` | `.env.local` | ID do GA4 (ex: G-XXXXXXXXXX) |
| `NEXT_PUBLIC_META_PIXEL_ID=PLACEHOLDER` | `.env.local` | ID do Meta Pixel |
| `NEXT_PUBLIC_TAWK_PROPERTY_ID=PLACEHOLDER` | `.env.local` | Property ID do Tawk.to (ex: 64abc123/1a2b3c4d) |
| `SMTP_USER=PLACEHOLDER` | `.env.local` | E-mail para envio (ex: contato@jaleca.com.br) |
| `SMTP_PASS=PLACEHOLDER` | `.env.local` | Senha de app do Gmail ou senha SMTP |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY=PLACEHOLDER` | `.env.local` | Chave VAPID pública para push (gerar com `web-push generate-vapid-keys`) |
| `PRIMEIRACOMPRA10` | `components/FirstPurchasePopup.tsx` | Criar este cupom no WooCommerce (10% off) |

---

## Dependências opcionais (instalar para ativar recursos)

```bash
# E-mail transacional
npm install nodemailer @types/nodemailer

# Push notifications (de volta ao estoque)
npm install web-push @types/web-push
```

Após instalar `web-push`:
```bash
npx web-push generate-vapid-keys
```
Coloque a chave pública em `NEXT_PUBLIC_VAPID_PUBLIC_KEY` e a privada em `VAPID_PRIVATE_KEY` no `.env.local`.

---

## Sugestões de próximos passos

1. **Cupons no checkout** — Campo de cupom conectado à API WooCommerce (`/api/coupon` já existe)
2. **Resgate de pontos no checkout** — Adicionar checkbox no CheckoutClient para descontar pontos automaticamente
3. **Histórico de pontos** — Registrar cada transação de pontos em `data/loyalty-history.json`
4. **Emails automáticos de boas-vindas** — Chamar `sendWelcome()` no registro de usuário (`/api/auth/register`)
5. **Notificação push de volta ao estoque — real** — Instalar `web-push` e implementar envio real em `/api/push/notify`
6. **Suspense boundaries** — Adicionar `<Suspense fallback={<ProductCardSkeleton />}>` nas páginas de produtos e produto
7. **Lookbook com dados reais do WooCommerce** — Buscar produtos via GraphQL e substituir o array hardcoded
8. **Testes E2E** — Cypress ou Playwright para testar fluxo de compra completo
9. **Webhook WooCommerce** — Receber eventos de pedido/envio do WC para disparar emails e pontos automaticamente
10. **Dashboard admin** — Visualizar leads, carrinhos abandonados e pontos via `/api/leads`, `/api/cart-recovery`, `/api/loyalty`
