'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Loader2, ChevronRight, Check, Plus, Eye, EyeOff } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import ShippingCalculator, { type ShippingOption } from '@/components/ShippingCalculator'
import { graphqlClient, GET_PRODUCTS } from '@/lib/graphql'
import type { WooProduct } from '@/components/ProductCard'
import { formatCPF, validateCPF, cleanCPF } from '@/lib/cpf'

type AddressForm = {
  first_name: string
  last_name: string
  email: string
  phone: string
  postcode: string
  address_1: string
  address_2: string
  neighborhood: string
  city: string
  state: string
}

function parsePrice(price: string): number {
  return parseFloat(price.replace(/[^0-9,]/g, '').replace(',', '.')) || 0
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`
  return digits
}

const emptyAddress: AddressForm = {
  first_name: '', last_name: '', email: '', phone: '',
  postcode: '', address_1: '', address_2: '', neighborhood: '', city: '', state: '',
}

type PaymentMethod = 'credit_card' | 'pix' | 'boleto'

export default function CheckoutClient() {
  const { items, clearCart, addItem } = useCart()
  const { user, isLoggedIn, login } = useAuth()
  const router = useRouter()

  const [guestEmail, setGuestEmail] = useState('')
  const [address, setAddress] = useState<AddressForm>(emptyAddress)
  const [calculatedCep, setCalculatedCep] = useState<string>('')
  const [cepLoading, setCepLoading] = useState(false)
  const [shipping, setShipping] = useState<ShippingOption | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [upsellProducts, setUpsellProducts] = useState<WooProduct[]>([])

  // CPF flow
  const [cpf, setCpf] = useState('')
  const [cpfStatus, setCpfStatus] = useState<'idle' | 'checking' | 'found' | 'not_found'>('idle')
  const [cpfCustomer, setCpfCustomer] = useState<{ id: number; email: string; name: string } | null>(null)
  const [checkoutPassword, setCheckoutPassword] = useState('')
  const [showCheckoutPassword, setShowCheckoutPassword] = useState(false)
  const [cpfLoginError, setCpfLoginError] = useState('')
  const cpfTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const subtotal = items.reduce((sum, i) => sum + parsePrice(i.price) * i.quantity, 0)
  const shippingCost = shipping?.cost ?? 0
  const total = subtotal + shippingCost

  // Prefill CEP from cart
  useEffect(() => {
    try {
      const cep = localStorage.getItem('jaleca-checkout-cep')
      if (cep && cep.length === 8) {
        setCalculatedCep(cep)
        setAddress(prev => ({ ...prev, postcode: formatCEP(cep) }))
        lookupCEP(cep)
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load upsell products
  useEffect(() => {
    graphqlClient
      .request<{ products: { nodes: WooProduct[] } }>(GET_PRODUCTS, { first: 6 })
      .then(data => {
        const cartIds = new Set(items.map(i => i.id))
        const suggestions = data.products.nodes.filter(p => !cartIds.has(p.id)).slice(0, 3)
        setUpsellProducts(suggestions)
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isLoggedIn && user) {
      const [first, ...rest] = user.name.split(' ')
      setAddress(prev => ({
        ...prev,
        first_name: first || '',
        last_name: rest.join(' '),
        email: user.email,
      }))
    }
  }, [isLoggedIn, user])

  async function lookupCEP(cep: string) {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`/api/shipping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep: clean }),
      })
      const data = await res.json()
      if (data.address) {
        setAddress(prev => ({
          ...prev,
          city: data.address.city,
          state: data.address.state,
          neighborhood: data.address.neighborhood || prev.neighborhood,
          address_1: data.address.street || prev.address_1,
          address_2: '', // clear house number when CEP changes
        }))
      }
    } catch {}
    finally {
      setCepLoading(false)
    }
  }

  function maskEmail(email: string) {
    const [user, domain] = email.split('@')
    return `${user.slice(0, 2)}***@${domain}`
  }

  function handleCPFChange(value: string) {
    const formatted = formatCPF(value)
    setCpf(formatted)
    setCpfStatus('idle')
    setCpfCustomer(null)
    setCpfLoginError('')
    const clean = cleanCPF(formatted)
    if (clean.length === 11 && validateCPF(clean)) {
      clearTimeout(cpfTimer.current)
      cpfTimer.current = setTimeout(() => doLookupCPF(clean), 600)
    }
  }

  async function doLookupCPF(clean: string) {
    setCpfStatus('checking')
    try {
      const res = await fetch(`/api/auth/cpf-lookup?cpf=${clean}`)
      const data = await res.json()
      if (data.found && data.customer) {
        setCpfCustomer(data.customer)
        setCpfStatus('found')
        const [first, ...rest] = data.customer.name.split(' ')
        setAddress(prev => ({
          ...prev,
          first_name: first || '',
          last_name: rest.join(' '),
        }))
        setGuestEmail(data.customer.email)
      } else {
        setCpfStatus('not_found')
      }
    } catch {
      setCpfStatus('not_found')
    }
  }

  function handleCEPChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCEP(e.target.value)
    setAddress(prev => ({ ...prev, postcode: formatted }))
    const clean = formatted.replace(/\D/g, '')
    if (clean.length === 8) {
      setCalculatedCep(clean)
      lookupCEP(formatted)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setCpfLoginError('')

    if (!validateCPF(cpf) && !isLoggedIn) {
      setError('Informe um CPF válido para continuar')
      return
    }

    const email = isLoggedIn ? user!.email : guestEmail
    if (!address.first_name || !address.last_name || !email || !address.postcode || !address.address_1 || !address.address_2 || !address.city || !address.state) {
      setError('Preencha todos os campos obrigatórios')
      return
    }
    if (!shipping) {
      setError('Selecione uma opção de frete')
      return
    }

    setLoading(true)
    let resolvedCustomerId = isLoggedIn && user ? user.id : undefined

    try {
      // CPF found → login first to link order to existing account
      if (!isLoggedIn && cpfStatus === 'found' && cpfCustomer) {
        if (!checkoutPassword) {
          setCpfLoginError('Digite sua senha para continuar')
          setLoading(false)
          return
        }
        try {
          await login(cpfCustomer.email, checkoutPassword)
          resolvedCustomerId = cpfCustomer.id
        } catch {
          setCpfLoginError('Senha incorreta. Tente novamente ou recupere sua senha.')
          setLoading(false)
          return
        }
      }

      // CPF not found → auto-create account so customer gets order history
      if (!isLoggedIn && cpfStatus === 'not_found' && email) {
        try {
          const tempPwd = Math.random().toString(36).slice(-10) + 'A1!'
          const regRes = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: `${address.first_name} ${address.last_name}`.trim(),
              email,
              password: tempPwd,
              cpf: cleanCPF(cpf),
              phone: address.phone,
            }),
          })
          if (regRes.ok) {
            const regData = await regRes.json()
            resolvedCustomerId = regData.user?.id
            // Send "set password" email so customer can access their account
            fetch('/api/auth/forgot-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
            }).catch(() => {})
          }
        } catch {
          // Continue without account — guest order
        }
      }

      const pagarmeMethodMap: Record<PaymentMethod, string> = {
        pix: 'woo-pagarme-payments-pix',
        boleto: 'woo-pagarme-payments-billet',
        credit_card: 'woo-pagarme-payments-credit_card',
      }
      const pagarmeMethodTitleMap: Record<PaymentMethod, string> = {
        pix: 'PIX',
        boleto: 'Boleto Bancário',
        credit_card: 'Cartão de Crédito',
      }
      const orderData = {
        payment_method: pagarmeMethodMap[paymentMethod],
        payment_method_title: pagarmeMethodTitleMap[paymentMethod],
        set_paid: false,
        billing: {
          first_name: address.first_name,
          last_name: address.last_name,
          address_1: `${address.address_1}, ${address.address_2}`.trim().replace(/,$/, ''),
          address_2: address.neighborhood,
          city: address.city,
          state: address.state,
          postcode: address.postcode.replace(/\D/g, ''),
          country: 'BR',
          email,
          phone: address.phone,
        },
        shipping: {
          first_name: address.first_name,
          last_name: address.last_name,
          address_1: `${address.address_1}, ${address.address_2}`.trim().replace(/,$/, ''),
          address_2: address.neighborhood,
          city: address.city,
          state: address.state,
          postcode: address.postcode.replace(/\D/g, ''),
          country: 'BR',
        },
        line_items: items.map(item => ({
          product_id: item.databaseId,
          quantity: item.quantity,
        })),
        shipping_lines: [{
          method_id: shipping.id,
          method_title: shipping.label,
          total: shipping.cost.toFixed(2),
        }],
        customer_id: resolvedCustomerId,
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao criar pedido')
        return
      }
      clearCart()
      // Redirect to WooCommerce order-pay page so Pagar.me can process payment
      const wcUrl = process.env.NEXT_PUBLIC_WC_URL || 'https://jaleca.com.br'
      window.location.href = `${wcUrl}/checkout/order-pay/${data.orderId}/?pay_for_order=true&key=${data.orderKey}`
    } catch {
      setError('Erro ao processar pedido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="py-16">
        <div className="container max-w-md text-center">
          <ShoppingBag size={48} className="mx-auto mb-4 text-muted-foreground/40" />
          <h1 className="font-display text-3xl font-semibold mb-3">Sacola vazia</h1>
          <p className="text-muted-foreground mb-6">Adicione produtos antes de finalizar a compra.</p>
          <Link href="/produtos" className="inline-flex items-center gap-2 bg-ink text-background px-6 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-ink/90 transition-all">
            Ver Produtos
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="py-8 md:py-12">
      <div className="container">
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-8">Finalizar Compra</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 items-start">
            {/* Left column */}
            <div className="space-y-8">
              {/* Section 1: Identification */}
              <section className="border border-border p-6">
                <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-ink text-background text-xs flex items-center justify-center font-bold">1</span>
                  Identificação
                </h2>

                {isLoggedIn ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-secondary/20 px-4 py-3">
                      <Check size={16} className="text-green-600" />
                      <div>
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    {/* CPF for logged-in user (needed for Pagar.me) */}
                    <div>
                      <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">CPF *</label>
                      <input
                        type="text"
                        value={cpf}
                        onChange={e => handleCPFChange(e.target.value)}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        required
                        className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* CPF field — drives the entire identification flow */}
                    <div>
                      <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">
                        CPF * {cpfStatus === 'checking' && <span className="text-muted-foreground font-normal normal-case">(verificando...)</span>}
                      </label>
                      <input
                        type="text"
                        value={cpf}
                        onChange={e => handleCPFChange(e.target.value)}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Seu CPF identifica sua conta e é necessário para emissão de nota fiscal.
                      </p>
                    </div>

                    {/* CPF found — show login prompt */}
                    {cpfStatus === 'found' && cpfCustomer && (
                      <div className="border border-green-200 bg-green-50 p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Check size={15} className="text-green-600" />
                          <p className="text-sm font-medium text-green-800">
                            Olá, {cpfCustomer.name.split(' ')[0]}! Você já tem cadastro.
                          </p>
                        </div>
                        <p className="text-xs text-green-700">
                          Conta: <strong>{maskEmail(cpfCustomer.email)}</strong>
                        </p>
                        <div>
                          <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">
                            Senha *
                          </label>
                          <div className="relative">
                            <input
                              type={showCheckoutPassword ? 'text' : 'password'}
                              value={checkoutPassword}
                              onChange={e => setCheckoutPassword(e.target.value)}
                              placeholder="Digite sua senha"
                              className="w-full border border-border bg-background px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-foreground transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCheckoutPassword(v => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showCheckoutPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                          {cpfLoginError && (
                            <p className="text-xs text-red-600 mt-1">{cpfLoginError}</p>
                          )}
                          <button
                            type="button"
                            onClick={async () => {
                              await fetch('/api/auth/forgot-password', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email: cpfCustomer.email }),
                              })
                              setCpfLoginError('Enviamos um link de recuperação para o seu e-mail.')
                            }}
                            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground mt-1 block"
                          >
                            Esqueci minha senha
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CPF not found — new customer */}
                    {cpfStatus === 'not_found' && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200">
                          <Check size={14} className="text-blue-600" />
                          <p className="text-xs text-blue-800">
                            Novo cliente — sua conta será criada automaticamente ao finalizar.
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Email *</label>
                          <input
                            type="email"
                            value={guestEmail}
                            onChange={e => setGuestEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                            className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    {/* CPF idle (not yet validated) — show email as fallback */}
                    {cpfStatus === 'idle' && (
                      <div>
                        <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Email *</label>
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={e => setGuestEmail(e.target.value)}
                          placeholder="seu@email.com"
                          className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                        />
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Section 2: Address */}
              <section className="border border-border p-6">
                <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-ink text-background text-xs flex items-center justify-center font-bold">2</span>
                  Endereço de Entrega
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Nome *</label>
                    <input
                      type="text"
                      value={address.first_name}
                      onChange={e => setAddress(p => ({ ...p, first_name: e.target.value }))}
                      required
                      className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Sobrenome *</label>
                    <input
                      type="text"
                      value={address.last_name}
                      onChange={e => setAddress(p => ({ ...p, last_name: e.target.value }))}
                      required
                      className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Telefone</label>
                    <input
                      type="tel"
                      value={address.phone}
                      onChange={e => setAddress(p => ({ ...p, phone: e.target.value }))}
                      placeholder="(11) 99999-0000"
                      className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">
                      CEP *{cepLoading && <span className="ml-1 text-muted-foreground">(buscando...)</span>}
                    </label>
                    <input
                      type="text"
                      value={address.postcode}
                      onChange={handleCEPChange}
                      placeholder="00000-000"
                      maxLength={9}
                      required
                      className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Endereço *</label>
                    <input
                      type="text"
                      value={address.address_1}
                      onChange={e => setAddress(p => ({ ...p, address_1: e.target.value }))}
                      required
                      placeholder="Rua, Av., etc."
                      className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Número *</label>
                    <input
                      type="text"
                      value={address.address_2}
                      onChange={e => setAddress(p => ({ ...p, address_2: e.target.value }))}
                      required
                      className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Bairro</label>
                    <input
                      type="text"
                      value={address.neighborhood}
                      onChange={e => setAddress(p => ({ ...p, neighborhood: e.target.value }))}
                      className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Cidade *</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={e => setAddress(p => ({ ...p, city: e.target.value }))}
                      required
                      className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Estado *</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={e => setAddress(p => ({ ...p, state: e.target.value.toUpperCase().slice(0, 2) }))}
                      required
                      maxLength={2}
                      placeholder="SP"
                      className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                </div>
              </section>

              {/* Section 3: Shipping */}
              <section className="border border-border p-6">
                <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-ink text-background text-xs flex items-center justify-center font-bold">3</span>
                  Frete
                </h2>
                {calculatedCep ? (
                  <ShippingCalculator
                    key={calculatedCep}
                    onShippingSelected={setShipping}
                    selectedId={shipping?.id}
                    initialCep={calculatedCep}
                    onCepCalculated={cep => {
                      // Frete mudou o CEP → atualiza o endereço (mantém nome/telefone)
                      setAddress(prev => ({ ...prev, postcode: formatCEP(cep) }))
                      lookupCEP(cep)
                    }}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">Preencha o CEP no endereço acima para calcular o frete.</p>
                )}
              </section>

              {/* Section 4: Payment */}
              <section className="border border-border p-6">
                <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-ink text-background text-xs flex items-center justify-center font-bold">4</span>
                  Forma de Pagamento
                </h2>
                <div className="space-y-3">
                  {(['pix', 'boleto', 'credit_card'] as PaymentMethod[]).map(method => (
                    <label
                      key={method}
                      className={`flex items-center gap-3 px-4 py-3 border cursor-pointer transition-colors ${
                        paymentMethod === method ? 'border-foreground bg-secondary/20' : 'border-border hover:border-foreground/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        className="accent-foreground"
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {method === 'pix' && 'PIX'}
                          {method === 'boleto' && 'Boleto Bancário'}
                          {method === 'credit_card' && 'Cartão de Crédito'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {method === 'pix' && 'Aprovação imediata'}
                          {method === 'boleto' && 'Vencimento em 3 dias úteis'}
                          {method === 'credit_card' && 'Você será redirecionado para o site seguro'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </section>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ink text-background py-4 text-xs font-semibold tracking-widest uppercase transition-all hover:bg-ink/90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Processando...</>
                ) : (
                  <>{paymentMethod === 'credit_card' ? 'Ir para Pagamento Seguro' : 'Finalizar Pedido'} <ChevronRight size={16} /></>
                )}
              </button>
            </div>

            {/* Right column: Upsell + Order summary */}
            <aside className="space-y-6">
            {/* Upsell / cross-sell */}
            {upsellProducts.length > 0 && (
              <div className="border border-border p-5">
                <h2 className="font-display text-lg font-semibold mb-4">Você também pode gostar</h2>
                <div className="space-y-3">
                  {upsellProducts.map(product => (
                    <div key={product.id} className="flex items-center gap-3">
                      <div className="relative w-14 h-16 flex-shrink-0 bg-secondary/20 overflow-hidden">
                        {product.image?.sourceUrl ? (
                          <Image
                            src={product.image.sourceUrl}
                            alt={product.image.altText || product.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{product.name.replace(/ - Jaleca$/i, '')}</p>
                        <p className="text-xs text-muted-foreground">{product.price || product.regularPrice}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addItem({
                          id: product.id,
                          databaseId: product.databaseId,
                          slug: product.slug,
                          name: product.name.replace(/ - Jaleca$/i, ''),
                          image: product.image?.sourceUrl,
                          price: product.price || product.regularPrice || '0',
                        })}
                        className="flex-shrink-0 w-7 h-7 bg-foreground text-background flex items-center justify-center hover:bg-foreground/80 transition-colors"
                        aria-label={`Adicionar ${product.name}`}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order summary */}
            <div className="border border-border p-6 lg:sticky lg:top-24">
              <h2 className="font-display text-xl font-semibold mb-4">Resumo do Pedido</h2>
              <div className="space-y-4 divide-y divide-border">
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3">
                      <div className="relative w-14 h-16 flex-shrink-0 bg-secondary/20 overflow-hidden">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                        ) : (
                          <div className="w-full h-full bg-muted" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {[item.color, item.size].filter(Boolean).join(' / ')}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[11px] text-muted-foreground">Qtd: {item.quantity}</span>
                          <span className="text-xs font-semibold">{item.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {shipping && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Frete</span>
                      <span>{shippingCost === 0 ? 'Grátis' : formatCurrency(shippingCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-semibold pt-2 border-t border-border">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
            </aside>
          </div>
        </form>
      </div>
    </main>
  )
}
