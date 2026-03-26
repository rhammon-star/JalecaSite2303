import { createHmac } from 'crypto'

export type BlogUserRole = 'admin' | 'editor' | 'autor'

export type BlogUser = {
  id: string
  name: string
  email: string
  role: BlogUserRole
  wpUsername?: string
  wpAppPassword?: string
  passwordHash?: string
}

// In-memory users store (starts with default admin)
let blogUsers: BlogUser[] = [
  {
    id: '1',
    name: 'Admin',
    email: 'admin@jaleca.com.br',
    role: 'admin',
    // hash of 'jaleca2024' using SHA-256 HMAC
    passwordHash: hashPassword('jaleca2024'),
  },
]

function hashPassword(password: string): string {
  const secret = process.env.BLOG_JWT_SECRET || 'jaleca-blog-secret-2024'
  return createHmac('sha256', secret).update(password).digest('hex')
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

export function getUsers(): BlogUser[] {
  return blogUsers.map(u => ({ ...u, passwordHash: undefined }))
}

export function getUserByEmail(email: string): BlogUser | undefined {
  return blogUsers.find(u => u.email === email)
}

export function getUserById(id: string): BlogUser | undefined {
  return blogUsers.find(u => u.id === id)
}

export function addUser(user: Omit<BlogUser, 'id' | 'passwordHash'> & { password: string }): BlogUser {
  const id = String(Date.now())
  const newUser: BlogUser = {
    id,
    name: user.name,
    email: user.email,
    role: user.role,
    wpUsername: user.wpUsername,
    wpAppPassword: user.wpAppPassword,
    passwordHash: hashPassword(user.password),
  }
  blogUsers.push(newUser)
  return { ...newUser, passwordHash: undefined }
}

export function removeUser(id: string): boolean {
  const before = blogUsers.length
  blogUsers = blogUsers.filter(u => u.id !== id)
  return blogUsers.length < before
}

// Simple JWT using HMAC-SHA256
function base64url(str: string): string {
  return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function base64urlDecode(str: string): string {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - (str.length % 4)) % 4)
  return Buffer.from(padded, 'base64').toString()
}

export type BlogTokenPayload = {
  sub: string
  email: string
  name: string
  role: BlogUserRole
  iat: number
  exp: number
}

export function signBlogToken(user: BlogUser): string {
  const secret = process.env.BLOG_JWT_SECRET || 'jaleca-blog-secret-2024'
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const now = Math.floor(Date.now() / 1000)
  const payload = base64url(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      iat: now,
      exp: now + 60 * 60 * 24 * 7, // 7 days
    })
  )
  const signature = createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
  return `${header}.${payload}.${signature}`
}

export function verifyBlogToken(token: string): BlogTokenPayload | null {
  try {
    const secret = process.env.BLOG_JWT_SECRET || 'jaleca-blog-secret-2024'
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [header, payload, signature] = parts
    const expectedSig = createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
    if (signature !== expectedSig) return null
    const data = JSON.parse(base64urlDecode(payload)) as BlogTokenPayload
    if (data.exp < Math.floor(Date.now() / 1000)) return null
    return data
  } catch {
    return null
  }
}
