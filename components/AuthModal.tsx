'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { formatCPF, validateCPF } from '@/lib/cpf'

type Tab = 'login' | 'register' | 'forgot'

type Props = {
  isOpen: boolean
  onClose: () => void
  initialTab?: Tab
}

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  const { login, register } = useAuth()

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regCPF, setRegCPF] = useState('')
  const [regPhone, setRegPhone] = useState('')

  // Forgot form
  const [forgotEmail, setForgotEmail] = useState('')

  useEffect(() => {
    setTab(initialTab)
    setError('')
    setSuccess('')
  }, [initialTab, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose()
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(loginEmail, loginPassword)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (regPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }
    if (!validateCPF(regCPF)) {
      setError('CPF inválido. Verifique o número digitado.')
      return
    }
    setLoading(true)
    try {
      await register({ name: regName, email: regEmail, password: regPassword, cpf: regCPF, phone: regPhone })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      })
      void res
      setSuccess('Se este email estiver cadastrado, você receberá as instruções em breve.')
    } catch {
      setSuccess('Se este email estiver cadastrado, você receberá as instruções em breve.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="bg-background w-full max-w-md shadow-2xl border border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <h2 className="font-display text-2xl font-semibold">
            {tab === 'login' && 'Entrar'}
            {tab === 'register' && 'Criar Conta'}
            {tab === 'forgot' && 'Recuperar Senha'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors active:scale-95"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(['login', 'register'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); setSuccess('') }}
              className={`flex-1 py-3 text-xs font-semibold tracking-widest uppercase transition-colors ${
                tab === t
                  ? 'text-foreground border-b-2 border-foreground -mb-px'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'login' ? 'Login' : 'Cadastro'}
            </button>
          ))}
        </div>

        <div className="px-6 py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  required
                  className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    required
                    className="w-full border border-border bg-background px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-foreground transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ink text-background py-3 text-xs font-semibold tracking-widest uppercase transition-all hover:bg-ink/90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Entrar
              </button>
              <button
                type="button"
                onClick={() => { setTab('forgot'); setError(''); setSuccess('') }}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 text-center"
              >
                Esqueci minha senha
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Nome Completo</label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  required
                  className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">CPF *</label>
                <input
                  type="text"
                  value={regCPF}
                  onChange={e => setRegCPF(formatCPF(e.target.value))}
                  required
                  maxLength={14}
                  className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  required
                  className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Telefone / WhatsApp</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full border border-border bg-background px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-foreground transition-colors"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Ao criar sua conta você concorda com nossos termos de uso e política de privacidade.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ink text-background py-3 text-xs font-semibold tracking-widest uppercase transition-all hover:bg-ink/90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Criar Conta
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {tab === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Informe seu email e enviaremos as instruções para redefinir sua senha.
              </p>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                  className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ink text-background py-3 text-xs font-semibold tracking-widest uppercase transition-all hover:bg-ink/90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Enviar Instruções
              </button>
              <button
                type="button"
                onClick={() => { setTab('login'); setError(''); setSuccess('') }}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 text-center"
              >
                Voltar ao Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
