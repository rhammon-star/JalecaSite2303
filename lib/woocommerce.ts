// WooCommerce REST API client
// Replace WOOCOMMERCE_CONSUMER_KEY and WOOCOMMERCE_CONSUMER_SECRET in .env.local with real credentials

const WC_URL = process.env.WOOCOMMERCE_API_URL!
const CK = process.env.WOOCOMMERCE_CONSUMER_KEY!
const CS = process.env.WOOCOMMERCE_CONSUMER_SECRET!

function getAuthHeader(): string {
  const credentials = Buffer.from(`${CK}:${CS}`).toString('base64')
  return `Basic ${credentials}`
}

async function wcFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${WC_URL}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message || `WooCommerce API error: ${res.status}`)
  }
  return res.json()
}

export type WCOrderLineItem = {
  product_id: number
  variation_id?: number
  quantity: number
}

export type WCAddress = {
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  state: string
  postcode: string
  country: string
  email?: string
  phone?: string
}

export type WCOrderData = {
  payment_method: string
  payment_method_title: string
  set_paid?: boolean
  billing: WCAddress & { email: string; phone?: string }
  shipping: WCAddress
  line_items: WCOrderLineItem[]
  shipping_lines?: Array<{ method_id: string; method_title: string; total: string }>
  coupon_lines?: Array<{ code: string }>
  customer_id?: number
  customer_note?: string
}

export type WCOrder = {
  id: number
  number: string
  order_key: string
  status: string
  total: string
  subtotal?: string
  date_created: string
  billing: WCAddress & { email: string }
  line_items: Array<{
    id: number
    name: string
    quantity: number
    price: number
    total: string
    image?: { src: string }
  }>
  shipping_lines: Array<{ method_title: string; total: string }>
  coupon_lines: Array<{ code: string; discount: string }>
}

export type WCCustomer = {
  id: number
  email: string
  first_name: string
  last_name: string
  username: string
  billing?: WCAddress & { email: string; phone?: string }
  shipping?: WCAddress
}

export type WCCoupon = {
  id: number
  code: string
  discount_type: string
  amount: string
  minimum_amount: string
  maximum_amount: string
  usage_limit: number | null
  usage_count: number
  date_expires: string | null
}

export type WCReview = {
  id: number
  product_id: number
  reviewer: string
  reviewer_email: string
  review: string
  rating: number
  date_created: string
  verified: boolean
}

export async function createOrder(orderData: WCOrderData): Promise<WCOrder> {
  return wcFetch<WCOrder>('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  })
}

export async function getOrder(id: number): Promise<WCOrder> {
  return wcFetch<WCOrder>(`/orders/${id}`)
}

export async function getOrders(customerId: number): Promise<WCOrder[]> {
  return wcFetch<WCOrder[]>(`/orders?customer=${customerId}&per_page=20`)
}

export async function getCustomer(id: number): Promise<WCCustomer> {
  return wcFetch<WCCustomer>(`/customers/${id}`)
}

export async function createCustomer(data: {
  email: string
  first_name: string
  last_name: string
  password: string
  username?: string
}): Promise<WCCustomer> {
  return wcFetch<WCCustomer>('/customers', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      username: data.username || data.email,
    }),
  })
}

export async function updateCustomer(id: number, data: Partial<WCCustomer & { password?: string }>): Promise<WCCustomer> {
  return wcFetch<WCCustomer>(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function validateCoupon(code: string): Promise<WCCoupon> {
  const coupons = await wcFetch<WCCoupon[]>(`/coupons?code=${encodeURIComponent(code)}`)
  if (!coupons.length) throw new Error('Cupom não encontrado')
  return coupons[0]
}

export async function getShippingZones(): Promise<Array<{ id: number; name: string }>> {
  return wcFetch<Array<{ id: number; name: string }>>('/shipping/zones')
}

export async function loginCustomer(email: string, password: string): Promise<{ token: string; user_email: string; user_nicename: string; user_display_name: string }> {
  // Uses JWT Auth plugin endpoint — install https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/
  const wcUrl = process.env.NEXT_PUBLIC_WC_URL || 'https://jaleca.com.br'
  const res = await fetch(`${wcUrl}/wp-json/jwt-auth/v1/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Credenciais inválidas')
  }
  return res.json()
}

export async function getCustomerByEmail(email: string): Promise<WCCustomer | null> {
  const customers = await wcFetch<WCCustomer[]>(`/customers?email=${encodeURIComponent(email)}`)
  return customers[0] ?? null
}

export async function getProductReviews(productId: number): Promise<WCReview[]> {
  return wcFetch<WCReview[]>(`/products/reviews?product=${productId}&per_page=20`)
}

export async function createProductReview(data: {
  product_id: number
  reviewer: string
  reviewer_email: string
  review: string
  rating: number
}): Promise<WCReview> {
  return wcFetch<WCReview>('/products/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
