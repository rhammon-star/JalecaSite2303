'use client'

import { useState, useEffect } from 'react'
import { Loader2, Trash2, Plus, X } from 'lucide-react'

type BlogUser = {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'autor'
  wpUsername?: string
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<BlogUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'autor' as BlogUser['role'],
    wpUsername: '',
    wpAppPassword: '',
  })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await fetch('/api/blog/auth/users')
      if (!res.ok) throw new Error('Erro ao buscar usuários')
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  async function handleDelete(id: string) {
    try {
      const res = await fetch('/api/blog/auth/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      setUsers(prev => prev.filter(u => u.id !== id))
      setDeleteId(null)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)
    try {
      const res = await fetch('/api/blog/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      const newUser = await res.json()
      setUsers(prev => [...prev, newUser])
      setShowModal(false)
      setFormData({ name: '', email: '', password: '', role: 'autor', wpUsername: '', wpAppPassword: '' })
    } catch (err) {
      setFormError((err as Error).message)
    } finally {
      setFormLoading(false)
    }
  }

  const roleLabels: Record<BlogUser['role'], string> = {
    admin: 'Admin',
    editor: 'Editor',
    autor: 'Autor',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-semibold">Usuários</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-ink text-background px-4 py-2.5 text-xs font-semibold tracking-widest uppercase hover:bg-ink/90 transition-all"
        >
          <Plus size={14} /> Adicionar
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="border border-border divide-y divide-border">
          <div className="grid grid-cols-[1fr_200px_100px_60px] gap-4 px-4 py-3 bg-secondary/20">
            <span className="text-xs font-semibold tracking-widests uppercase text-muted-foreground">Nome</span>
            <span className="text-xs font-semibold tracking-widests uppercase text-muted-foreground">Email</span>
            <span className="text-xs font-semibold tracking-widests uppercase text-muted-foreground">Role</span>
            <span></span>
          </div>
          {users.map(user => (
            <div
              key={user.id}
              className="grid grid-cols-[1fr_200px_100px_60px] gap-4 px-4 py-4 items-center hover:bg-secondary/10 transition-colors"
            >
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                {user.wpUsername && (
                  <p className="text-[10px] text-muted-foreground">WP: {user.wpUsername}</p>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <span className="text-xs px-2 py-0.5 border border-border capitalize">
                {roleLabels[user.role]}
              </span>
              <div>
                {user.id !== '1' && (
                  <button
                    onClick={() => setDeleteId(user.id)}
                    className="text-muted-foreground hover:text-red-600 transition-colors"
                    title="Excluir usuário"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border p-6 max-w-sm w-full">
            <h3 className="font-display text-lg font-semibold mb-3">Confirmar exclusão</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-border py-2.5 text-xs font-semibold tracking-widests uppercase hover:bg-secondary/20 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-600 text-white py-2.5 text-xs font-semibold tracking-widests uppercase hover:bg-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create user modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold">Adicionar Usuário</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold tracking-widests uppercase text-muted-foreground mb-1.5">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  required
                  className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widests uppercase text-muted-foreground mb-1.5">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  required
                  className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widests uppercase text-muted-foreground mb-1.5">Senha *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                  required
                  className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widests uppercase text-muted-foreground mb-1.5">Role *</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData(p => ({ ...p, role: e.target.value as BlogUser['role'] }))}
                  className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                >
                  <option value="autor">Autor</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widests uppercase text-muted-foreground mb-1.5">WP Username (opcional)</label>
                <input
                  type="text"
                  value={formData.wpUsername}
                  onChange={e => setFormData(p => ({ ...p, wpUsername: e.target.value }))}
                  className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widests uppercase text-muted-foreground mb-1.5">WP App Password (opcional)</label>
                <input
                  type="password"
                  value={formData.wpAppPassword}
                  onChange={e => setFormData(p => ({ ...p, wpAppPassword: e.target.value }))}
                  className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                />
              </div>

              {formError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2">{formError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-border py-2.5 text-xs font-semibold tracking-widests uppercase hover:bg-secondary/20 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-ink text-background py-2.5 text-xs font-semibold tracking-widests uppercase hover:bg-ink/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {formLoading && <Loader2 size={14} className="animate-spin" />}
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
