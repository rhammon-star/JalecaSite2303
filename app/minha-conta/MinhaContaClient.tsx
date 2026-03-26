'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Loader2, Eye, EyeOff, Star, ChevronDown, ChevronUp,
  Package, User, MapPin, Award, LogOut, Phone, Mail,
  ShoppingBag, CheckCircle, Clock, XCircle, AlertCircle,
  Edit2, Save, X
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getPointsDiscount } from '@/lib/loyalty-utils'

type Tab = 'orders' | 'profile' | 'addresses' | 'points'

type WCOrder = {
  id: number
  number: string
  status: string
  total: string
  date_created: string
  line_items: Array<{
    id: number
    name: string
    quantity: number
    total: string
    image?: { src: string }
  }>
  shipping_lines: Array<{ method_title: string; total: string }>
}

type WCAddress = {
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  state: string
  postcode: string
  country: string
  phone?: string
  email?: string
}

type WCCustomer = {
  id: number
  email: string
  first_name: string
  last_name: string
  billing?: WCAddress
  shipping?: WCAddress
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: 'Aguardando pagamento', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: <Clock size={12} /> },
  processing: { label: 'Em processamento',     color: 'bg-blue-50 text-blue-700 border-blue-200',     icon: <Package size={12} /> },
  on_hold:    { label: 'Aguardando',           color: 'bg-orange-50 text-orange-700 border-orange-200', icon: <AlertCircle size={12} /> },
  completed:  { label: 'Concluído',            color: 'bg-green-50 text-green-700 border-green-200',  icon: <CheckCircle size={12} /> },
  cancelled:  { label: 'Cancelado',            color: 'bg-red-50 text-red-700 border-red-200',        icon: <XCircle size={12} /> },
  refunded:   { label: 'Reembolsado',          color: 'bg-gray-50 text-gray-600 border-gray-200',     icon: <XCircle size={12} /> },
  failed:     { label: 'Falhou',               color: 'bg-red-50 text-red-700 border-red-200',        icon: <XCircle size={12} /> },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-secondary text-foreground border-border', icon: null }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold border ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatCurrency(value: string | number) {
  return `R$ ${parseFloat(String(value)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}

function formatCEP(cep: string) {
  const d = cep.replace(/\D/g, '')
  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : cep
}

export default function MinhaContaClient() {
  const { user, isLoggedIn, isLoading, logout, updateProfile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('orders')

  // Orders
  const [orders, setOrders] = useState<WCOrder[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null)

  // Customer (for addresses)
  const [customer, setCustomer] = useState<WCCustomer | null>(null)
  const [customerLoading, setCustomerLoading] = useState(false)

  // Loyalty points
  const [loyaltyPoints, setLoyaltyPoints] = useState<number | null>(null)
  const [loyaltyLoading, setLoyaltyLoading] = useState(false)

  // Profile form
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState('')

  // Address editing
  const [editingBilling, setEditingBilling] = useState(false)
  const [editingShipping, setEditingShipping] = useState(false)
  const [billingForm, setBillingForm] = useState<WCAddress>({ first_name: '', last_name: '', address_1: '', city: '', state: '', postcode: '', country: 'BR' })
  const [shippingForm, setShippingForm] = useState<WCAddress>({ first_name: '', last_name: '', address_1: '', city: '', state: '', postcode: '', country: 'BR' })
  const [addressSaving, setAddressSaving] = useState(false)
  const [addressSuccess, setAddressSuccess] = useState('')

  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.push('/')
  }, [isLoggedIn, isLoading, router])

  useEffect(() => {
    if (user) {
      const [first, ...rest] = (user.name || '').split(' ')
      setFirstName(first || '')
      setLastName(rest.join(' '))
      setEmail(user.email)
    }
  }, [user])

  const fetchOrders = useCallback(() => {
    if (!user) return
    setOrdersLoading(true)
    fetch(`/api/orders?customerId=${user.id}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setOrders(data) })
      .catch(() => {})
      .finally(() => setOrdersLoading(false))
  }, [user])

  const fetchCustomer = useCallback(() => {
    if (!user) return
    setCustomerLoading(true)
    fetch(`/api/auth/profile?userId=${user.id}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.customer) {
          setCustomer(data.customer)
          if (data.customer.billing) setBillingForm(data.customer.billing)
          if (data.customer.shipping) setShippingForm(data.customer.shipping)
          if (data.customer.billing?.phone) setPhone(data.customer.billing.phone)
        }
      })
      .catch(() => {})
      .finally(() => setCustomerLoading(false))
  }, [user])

  const fetchPoints = useCallback(() => {
    if (!user) return
    setLoyaltyLoading(true)
    fetch(`/api/loyalty?customerId=${user.id}`)
      .then(r => r.json())
      .then((data: { points?: number }) => {
        if (typeof data.points === 'number') setLoyaltyPoints(data.points)
      })
      .catch(() => {})
      .finally(() => setLoyaltyLoading(false))
  }, [user])

  useEffect(() => {
    if (!user) return
    if (activeTab === 'orders') fetchOrders()
    if (activeTab === 'addresses') fetchCustomer()
    if (activeTab === 'points') fetchPoints()
    if (activeTab === 'profile') fetchCustomer()
  }, [activeTab, user, fetchOrders, fetchCustomer, fetchPoints])

  // Always load stats on mount
  useEffect(() => {
    if (user) {
      fetchOrders()
      fetchPoints()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess(false)
    setProfileLoading(true)
    try {
      const name = `${firstName} ${lastName}`.trim()
      const updates: Record<string, string> = {}
      if (name !== user?.name) updates.name = name
      if (email !== user?.email) updates.email = email
      if (password) updates.password = password
      if (phone) updates.phone = phone
      await updateProfile(updates)
      // Also update phone in WooCommerce billing
      if (phone) {
        await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
          body: JSON.stringify({ userId: user?.id, phone }),
        })
      }
      setProfileSuccess(true)
      setPassword('')
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setProfileLoading(false)
    }
  }

  async function handleSaveAddress(type: 'billing' | 'shipping') {
    setAddressSaving(true)
    setAddressSuccess('')
    try {
      const body: Record<string, unknown> = { userId: user?.id }
      body[type] = type === 'billing' ? billingForm : shippingForm
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
        body: JSON.stringify(body),
      })
      setAddressSuccess(type)
      if (type === 'billing') setEditingBilling(false)
      else setEditingShipping(false)
      fetchCustomer()
    } catch {
      // ignore
    } finally {
      setAddressSaving(false)
    }
  }

  function handleLogout() {
    logout()
    router.push('/')
  }

  if (isLoading) {
    return (
      <main className="py-16 flex justify-center">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </main>
    )
  }

  if (!isLoggedIn) return null

  const totalSpent = orders.reduce((acc, o) => acc + parseFloat(o.total || '0'), 0)
  const nextRewardAt = Math.ceil((loyaltyPoints ?? 0) / 100) * 100
  const pointsProgress = loyaltyPoints !== null ? ((loyaltyPoints % 100) / 100) * 100 : 0

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'orders',    label: 'Meus Pedidos',  icon: <Package size={16} /> },
    { id: 'profile',   label: 'Meus Dados',    icon: <User size={16} /> },
    { id: 'addresses', label: 'Endereços',      icon: <MapPin size={16} /> },
    { id: 'points',    label: 'Pontos',         icon: <Award size={16} /> },
  ]

  return (
    <main className="py-8 md:py-12">
      <div className="container">

        {/* Welcome + Stats */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-semibold">Olá, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground text-sm mt-1">{user?.email}</p>
          <div className="grid grid-cols-3 gap-4 mt-6 max-w-lg">
            <div className="border border-border p-4 text-center">
              <p className="text-2xl font-bold tabular-nums">{orders.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Pedidos</p>
            </div>
            <div className="border border-border p-4 text-center">
              <p className="text-2xl font-bold tabular-nums">
                {orders.length > 0 ? `R$${Math.round(totalSpent)}` : '—'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Total gasto</p>
            </div>
            <div className="border border-border p-4 text-center">
              <p className="text-2xl font-bold tabular-nums text-yellow-600">{loyaltyPoints ?? '—'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Pontos</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar */}
          <aside className="w-full md:w-52 flex-shrink-0">
            <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-left whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-ink text-background'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
                  }`}
                >
                  {tab.icon}{tab.label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-left text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap"
              >
                <LogOut size={16} />Sair
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* ORDERS */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="font-display text-2xl font-semibold mb-6">Meus Pedidos</h2>
                {ordersLoading ? (
                  <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16 border border-border">
                    <ShoppingBag size={40} className="mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground mb-4">Nenhum pedido encontrado.</p>
                    <a href="/produtos" className="inline-flex items-center gap-2 bg-ink text-background px-6 py-2.5 text-xs font-semibold tracking-widest uppercase hover:bg-ink/90 transition-colors">
                      Ver Produtos
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map(order => {
                      const isExpanded = expandedOrder === order.id
                      return (
                        <div key={order.id} className="border border-border">
                          {/* Order header */}
                          <button
                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                            className="w-full text-left p-4 hover:bg-secondary/10 transition-colors"
                            aria-expanded={isExpanded}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                {/* Thumbnails */}
                                <div className="flex -space-x-2">
                                  {order.line_items?.slice(0, 3).map((item, idx) =>
                                    item.image?.src ? (
                                      <div key={idx} className="w-10 h-10 border-2 border-background bg-secondary overflow-hidden">
                                        <Image src={item.image.src} alt={item.name} width={40} height={40} className="object-cover w-full h-full" />
                                      </div>
                                    ) : (
                                      <div key={idx} className="w-10 h-10 border-2 border-background bg-secondary flex items-center justify-center">
                                        <Package size={14} className="text-muted-foreground" />
                                      </div>
                                    )
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm">Pedido #{order.number}</p>
                                  <p className="text-xs text-muted-foreground">{formatDate(order.date_created)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="font-semibold text-sm">{formatCurrency(order.total)}</p>
                                  <StatusBadge status={order.status} />
                                </div>
                                {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                              </div>
                            </div>
                          </button>

                          {/* Order detail */}
                          {isExpanded && (
                            <div className="border-t border-border p-4 bg-secondary/5 space-y-3">
                              <div className="space-y-2">
                                {order.line_items?.map(item => (
                                  <div key={item.id} className="flex items-center gap-3">
                                    {item.image?.src ? (
                                      <div className="w-12 h-12 bg-secondary overflow-hidden flex-shrink-0">
                                        <Image src={item.image.src} alt={item.name} width={48} height={48} className="object-cover w-full h-full" />
                                      </div>
                                    ) : (
                                      <div className="w-12 h-12 bg-secondary flex items-center justify-center flex-shrink-0">
                                        <Package size={16} className="text-muted-foreground" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{item.name}</p>
                                      <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-medium flex-shrink-0">{formatCurrency(item.total)}</p>
                                  </div>
                                ))}
                              </div>
                              {order.shipping_lines?.length > 0 && (
                                <div className="flex justify-between text-sm pt-2 border-t border-border">
                                  <span className="text-muted-foreground">{order.shipping_lines[0].method_title}</span>
                                  <span>{formatCurrency(order.shipping_lines[0].total)}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-semibold text-sm pt-2 border-t border-border">
                                <span>Total</span>
                                <span>{formatCurrency(order.total)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* PROFILE */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="font-display text-2xl font-semibold mb-6">Meus Dados</h2>
                {profileSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
                    <CheckCircle size={16} />Dados atualizados com sucesso!
                  </div>
                )}
                {profileError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">{profileError}</div>
                )}
                <form onSubmit={handleProfileSave} className="space-y-4 max-w-md">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Nome</label>
                      <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                        className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Sobrenome</label>
                      <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                        className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">
                      <Mail size={12} className="inline mr-1" />Email
                    </label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">
                      <Phone size={12} className="inline mr-1" />Telefone
                    </label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(00) 00000-0000"
                      className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Nova Senha</label>
                    <p className="text-xs text-muted-foreground mb-2">Deixe em branco para manter a senha atual</p>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••" className="w-full border border-border bg-background px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-foreground transition-colors" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={profileLoading}
                    className="bg-ink text-background px-6 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-ink/90 transition-all disabled:opacity-60 flex items-center gap-2">
                    {profileLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Salvar Alterações
                  </button>
                </form>
              </div>
            )}

            {/* ADDRESSES */}
            {activeTab === 'addresses' && (
              <div>
                <h2 className="font-display text-2xl font-semibold mb-6">Meus Endereços</h2>
                {addressSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
                    <CheckCircle size={16} />Endereço salvo com sucesso!
                  </div>
                )}
                {customerLoading ? (
                  <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Billing */}
                    <AddressCard
                      title="Endereço de Cobrança"
                      address={customer?.billing}
                      isEditing={editingBilling}
                      form={billingForm}
                      onFormChange={setBillingForm}
                      onEdit={() => { setBillingForm(customer?.billing || billingForm); setEditingBilling(true) }}
                      onCancel={() => setEditingBilling(false)}
                      onSave={() => handleSaveAddress('billing')}
                      saving={addressSaving}
                      showEmail
                    />
                    {/* Shipping */}
                    <AddressCard
                      title="Endereço de Entrega"
                      address={customer?.shipping}
                      isEditing={editingShipping}
                      form={shippingForm}
                      onFormChange={setShippingForm}
                      onEdit={() => { setShippingForm(customer?.shipping || shippingForm); setEditingShipping(true) }}
                      onCancel={() => setEditingShipping(false)}
                      onSave={() => handleSaveAddress('shipping')}
                      saving={addressSaving}
                    />
                  </div>
                )}
              </div>
            )}

            {/* POINTS */}
            {activeTab === 'points' && (
              <div>
                <h2 className="font-display text-2xl font-semibold mb-6">Meus Pontos</h2>
                {loyaltyLoading ? (
                  <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
                ) : (
                  <div className="space-y-6 max-w-md">
                    {/* Balance card */}
                    <div className="border border-border p-8 text-center">
                      <Star size={40} className="mx-auto mb-3 text-yellow-500 fill-yellow-400" />
                      <p className="text-5xl font-bold tabular-nums mb-1">{loyaltyPoints ?? 0}</p>
                      <p className="text-sm text-muted-foreground mb-4">pontos acumulados</p>
                      {(loyaltyPoints ?? 0) >= 100 && (
                        <p className="text-base font-semibold text-green-600">
                          = {formatCurrency(getPointsDiscount(loyaltyPoints ?? 0))} de desconto disponível
                        </p>
                      )}
                    </div>

                    {/* Progress to next reward */}
                    <div className="border border-border p-5">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Próxima recompensa</span>
                        <span className="text-muted-foreground">{loyaltyPoints ?? 0} / {nextRewardAt} pts</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(pointsProgress, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Faltam {Math.max(0, nextRewardAt - (loyaltyPoints ?? 0))} pontos para ganhar {formatCurrency(5)} de desconto
                      </p>
                    </div>

                    {/* How it works */}
                    <div className="border border-border p-5 space-y-3">
                      <h3 className="font-display text-lg font-semibold">Como funciona</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                          <span>A cada <strong>R$ 1,00</strong> gasto você ganha <strong>1 ponto</strong></span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                          <span><strong>100 pontos</strong> = <strong>R$ 5,00</strong> de desconto na próxima compra</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                          <span>Pontos são creditados após a <strong>confirmação do pagamento</strong></span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Para resgatar seus pontos, entre em contato pelo WhatsApp ou use o campo de cupom no checkout.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

// Address card sub-component
type AddressCardProps = {
  title: string
  address?: WCAddress
  isEditing: boolean
  form: WCAddress
  onFormChange: (f: WCAddress) => void
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
  saving: boolean
  showEmail?: boolean
}

function AddressCard({ title, address, isEditing, form, onFormChange, onEdit, onCancel, onSave, saving, showEmail }: AddressCardProps) {
  const hasAddress = address && address.address_1

  return (
    <div className="border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        {!isEditing && (
          <button onClick={onEdit} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Edit2 size={13} />{hasAddress ? 'Editar' : 'Adicionar'}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">Nome</label>
              <input value={form.first_name} onChange={e => onFormChange({ ...form, first_name: e.target.value })}
                className="w-full border border-border bg-background px-2.5 py-2 text-sm focus:outline-none focus:border-foreground transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">Sobrenome</label>
              <input value={form.last_name} onChange={e => onFormChange({ ...form, last_name: e.target.value })}
                className="w-full border border-border bg-background px-2.5 py-2 text-sm focus:outline-none focus:border-foreground transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">Endereço</label>
            <input value={form.address_1} onChange={e => onFormChange({ ...form, address_1: e.target.value })}
              className="w-full border border-border bg-background px-2.5 py-2 text-sm focus:outline-none focus:border-foreground transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">CEP</label>
              <input value={form.postcode} onChange={e => onFormChange({ ...form, postcode: e.target.value })}
                className="w-full border border-border bg-background px-2.5 py-2 text-sm focus:outline-none focus:border-foreground transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">Bairro</label>
              <input value={form.address_2 || ''} onChange={e => onFormChange({ ...form, address_2: e.target.value })}
                className="w-full border border-border bg-background px-2.5 py-2 text-sm focus:outline-none focus:border-foreground transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">Cidade</label>
              <input value={form.city} onChange={e => onFormChange({ ...form, city: e.target.value })}
                className="w-full border border-border bg-background px-2.5 py-2 text-sm focus:outline-none focus:border-foreground transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">Estado</label>
              <input value={form.state} onChange={e => onFormChange({ ...form, state: e.target.value.toUpperCase().slice(0, 2) })} maxLength={2} placeholder="SP"
                className="w-full border border-border bg-background px-2.5 py-2 text-sm focus:outline-none focus:border-foreground transition-colors" />
            </div>
          </div>
          {showEmail && (
            <div>
              <label className="block text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">Telefone</label>
              <input value={form.phone || ''} onChange={e => onFormChange({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000"
                className="w-full border border-border bg-background px-2.5 py-2 text-sm focus:outline-none focus:border-foreground transition-colors" />
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button onClick={onSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-1.5 bg-ink text-background py-2 text-xs font-semibold tracking-widest uppercase hover:bg-ink/90 transition-colors disabled:opacity-60">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}Salvar
            </button>
            <button onClick={onCancel}
              className="flex items-center gap-1 px-3 py-2 text-xs border border-border hover:bg-secondary/20 transition-colors">
              <X size={13} />
            </button>
          </div>
        </div>
      ) : hasAddress ? (
        <div className="text-sm space-y-1 text-muted-foreground">
          <p className="text-foreground font-medium">{address.first_name} {address.last_name}</p>
          <p>{address.address_1}{address.address_2 ? `, ${address.address_2}` : ''}</p>
          <p>{address.city} — {address.state} — {formatCEP(address.postcode)}</p>
          {address.phone && <p className="flex items-center gap-1"><Phone size={12} />{address.phone}</p>}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhum endereço cadastrado.</p>
      )}
    </div>
  )
}
