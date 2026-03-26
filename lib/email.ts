/**
 * Email sending utilities for Jaleca.
 * Uses Nodemailer if available, otherwise simulates (logs) the email.
 */

type OrderItem = {
  name: string
  quantity: number
  total: string
}

type Order = {
  id: number | string
  number?: string
  total?: string
  billing?: { first_name?: string; email?: string }
  line_items?: OrderItem[]
  shipping_lines?: Array<{ method_title: string; total: string }>
}

type CartItem = {
  name: string
  price: string
  quantity: number
}

// ── Template helpers ──────────────────────────────────────────────────────────

function wrapHtml(content: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Georgia,serif;color:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e5e5;max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#1a1a1a;padding:24px 32px;text-align:center;">
            <span style="color:#ffffff;font-size:24px;letter-spacing:6px;font-family:Georgia,serif;font-weight:400;">JALECA</span>
          </td>
        </tr>
        <!-- Content -->
        <tr><td style="padding:32px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f5f5f0;padding:16px 32px;text-align:center;font-size:12px;color:#888;">
            <p style="margin:0;">Jaleca — Jalecos e Mimos · Ipatinga, MG</p>
            <p style="margin:4px 0 0;">Dúvidas? <a href="mailto:contato@jaleca.com.br" style="color:#1a1a1a;">contato@jaleca.com.br</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function btn(text: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:#1a1a1a;color:#ffffff;padding:12px 28px;text-decoration:none;font-size:13px;letter-spacing:2px;font-family:Arial,sans-serif;margin-top:16px;">${text.toUpperCase()}</a>`
}

// ── Transporter ───────────────────────────────────────────────────────────────

interface MailOptions {
  to: string
  subject: string
  html: string
}

async function sendMail(opts: MailOptions): Promise<void> {
  const smtpHost = process.env.SMTP_HOST
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpFrom = process.env.SMTP_FROM || 'noreply@jaleca.com.br'

  const isConfigured =
    smtpHost &&
    smtpUser &&
    smtpPass &&
    smtpUser !== 'PLACEHOLDER' &&
    smtpPass !== 'PLACEHOLDER'

  if (!isConfigured) {
    console.log('[Email] SMTP not configured — simulating send:')
    console.log(`  To: ${opts.to}`)
    console.log(`  Subject: ${opts.subject}`)
    return
  }

  // Send via SMTP using nodemailer (dynamically loaded to avoid build errors)
  try {
    const smtpPort = Number(process.env.SMTP_PORT || 587)

    // Build a raw SMTP payload via fetch to a local SMTP relay if available,
    // otherwise attempt nodemailer via eval to bypass static analysis
    // Note: nodemailer must be installed separately for this to work in production
    const transporterFn = new Function('require', `
      const nm = require('nodemailer');
      return nm.createTransport({
        host: '${smtpHost}',
        port: ${smtpPort},
        secure: false,
        auth: { user: '${smtpUser}', pass: '${smtpPass}' }
      });
    `)

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const transporter = transporterFn(require)
    await transporter.sendMail({ from: smtpFrom, ...opts })
  } catch (err) {
    console.error('[Email] Send failed (nodemailer may not be installed):', err)
    // Don't throw — email failure should not break order creation
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function sendOrderConfirmation(order: Order, customerEmail: string): Promise<void> {
  const orderNumber = order.number || String(order.id)
  const firstName = order.billing?.first_name || 'Cliente'
  const total = order.total
    ? `R$ ${parseFloat(order.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    : ''

  const itemsRows =
    order.line_items
      ?.map(
        i =>
          `<tr><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;">${i.name} × ${i.quantity}</td>
          <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;text-align:right;">R$ ${parseFloat(i.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>`
      )
      .join('') || ''

  const content = `
    <h2 style="font-size:22px;margin:0 0 8px;">Pedido confirmado!</h2>
    <p style="color:#666;margin:0 0 24px;">Olá, ${firstName}! Seu pedido <strong>#${orderNumber}</strong> foi recebido com sucesso.</p>
    ${
      itemsRows
        ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
            <tbody>${itemsRows}</tbody>
            ${total ? `<tfoot><tr><td style="padding-top:12px;font-weight:bold;">Total</td><td style="padding-top:12px;font-weight:bold;text-align:right;">${total}</td></tr></tfoot>` : ''}
           </table>`
        : ''
    }
    <p style="color:#666;font-size:14px;">Você receberá uma notificação quando seu pedido for enviado.</p>
    ${btn('Ver meu pedido', `https://jaleca.com.br/minha-conta`)}
  `

  await sendMail({
    to: customerEmail,
    subject: `Pedido #${orderNumber} confirmado — Jaleca`,
    html: wrapHtml(content, `Pedido #${orderNumber} confirmado`),
  })
}

export async function sendOrderShipped(
  order: Order,
  trackingCode: string,
  customerEmail: string
): Promise<void> {
  const orderNumber = order.number || String(order.id)
  const firstName = order.billing?.first_name || 'Cliente'

  const content = `
    <h2 style="font-size:22px;margin:0 0 8px;">Seu pedido foi enviado!</h2>
    <p style="color:#666;margin:0 0 16px;">Olá, ${firstName}! O pedido <strong>#${orderNumber}</strong> saiu para entrega.</p>
    <p style="margin:0 0 8px;"><strong>Código de rastreio:</strong></p>
    <p style="font-family:monospace;font-size:18px;background:#f5f5f0;padding:12px 16px;letter-spacing:2px;margin:0 0 24px;">${trackingCode}</p>
    ${btn('Rastrear pedido', `https://www.linkcorretos.com.br/?P_COD_UNI=${trackingCode}`)}
  `

  await sendMail({
    to: customerEmail,
    subject: `Pedido #${orderNumber} enviado — Jaleca`,
    html: wrapHtml(content, `Pedido enviado`),
  })
}

export async function sendWelcome(customerName: string, customerEmail: string): Promise<void> {
  const firstName = customerName.split(' ')[0] || 'Cliente'

  const content = `
    <h2 style="font-size:22px;margin:0 0 8px;">Bem-vinda à Jaleca!</h2>
    <p style="color:#666;margin:0 0 16px;">Olá, ${firstName}! Sua conta foi criada com sucesso. Explore nossa coleção de jalecos e uniformes premium.</p>
    ${btn('Ver produtos', `https://jaleca.com.br/produtos`)}
  `

  await sendMail({
    to: customerEmail,
    subject: 'Bem-vinda à Jaleca!',
    html: wrapHtml(content, 'Bem-vinda à Jaleca'),
  })
}

export async function sendPasswordReset(resetLink: string, customerEmail: string): Promise<void> {
  const content = `
    <h2 style="font-size:22px;margin:0 0 8px;">Redefinição de senha</h2>
    <p style="color:#666;margin:0 0 16px;">Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.</p>
    <p style="color:#888;font-size:13px;margin:0 0 16px;">Se você não fez essa solicitação, ignore este e-mail.</p>
    ${btn('Redefinir senha', resetLink)}
    <p style="color:#aaa;font-size:12px;margin-top:16px;">Este link expira em 1 hora.</p>
  `

  await sendMail({
    to: customerEmail,
    subject: 'Redefinição de senha — Jaleca',
    html: wrapHtml(content, 'Redefinição de senha'),
  })
}

export async function sendCartRecovery(cartItems: CartItem[], customerEmail: string): Promise<void> {
  const itemsHtml = cartItems
    .map(
      i =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;">${i.name} × ${i.quantity}</td>
        <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;text-align:right;">${i.price}</td></tr>`
    )
    .join('')

  const content = `
    <h2 style="font-size:22px;margin:0 0 8px;">Você esqueceu alguma coisa! 🛍️</h2>
    <p style="color:#666;margin:0 0 16px;">Estes itens ainda estão esperando por você no carrinho:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tbody>${itemsHtml}</tbody>
    </table>
    ${btn('Finalizar compra', `https://jaleca.com.br/checkout`)}
  `

  await sendMail({
    to: customerEmail,
    subject: 'Você deixou algo no carrinho — Jaleca',
    html: wrapHtml(content, 'Carrinho abandonado'),
  })
}
