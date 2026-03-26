'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type User = {
  id: number
  name: string
  email: string
  token: string
}

type AuthContextType = {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { name: string; email: string; password: string; cpf?: string; phone?: string }) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<{ name: string; email: string; password: string }>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY = 'jaleca-auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setUser(JSON.parse(saved))
    } catch {}
    setIsLoading(false)
  }, [])

  const persistUser = (u: User) => {
    setUser(u)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
  }

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao fazer login')
      }
      const data = await res.json()
      persistUser(data.user)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (data: { name: string; email: string; password: string; cpf?: string; phone?: string }) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao criar conta')
      }
      const result = await res.json()
      persistUser(result.user)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const updateProfile = useCallback(async (data: Partial<{ name: string; email: string; password: string }>) => {
    if (!user) throw new Error('Não autenticado')
    setIsLoading(true)
    try {
      const res = await fetch(`/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ userId: user.id, ...data }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao atualizar perfil')
      }
      const result = await res.json()
      persistUser({ ...user, ...result.user })
    } finally {
      setIsLoading(false)
    }
  }, [user])

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
