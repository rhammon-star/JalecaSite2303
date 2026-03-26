import { NextRequest, NextResponse } from 'next/server'
import { verifyBlogToken, getUsers, addUser, removeUser, BlogUserRole } from '@/lib/blog-auth'
import { cookies } from 'next/headers'

async function requireAdmin(request: NextRequest) {
  const cookieStore = await cookies()
  const tokenCookie = cookieStore.get('blog-token')
  const authHeader = request.headers.get('Authorization')
  const token = tokenCookie?.value || authHeader?.replace('Bearer ', '')

  if (!token) return null
  const payload = verifyBlogToken(token)
  if (!payload || payload.role !== 'admin') return null
  return payload
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const users = getUsers()
  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json() as {
      name?: string
      email?: string
      password?: string
      role?: BlogUserRole
      wpUsername?: string
      wpAppPassword?: string
    }

    if (!body.name || !body.email || !body.password || !body.role) {
      return NextResponse.json({ error: 'Nome, email, senha e role são obrigatórios' }, { status: 400 })
    }

    const validRoles: BlogUserRole[] = ['admin', 'editor', 'autor']
    if (!validRoles.includes(body.role)) {
      return NextResponse.json({ error: 'Role inválido' }, { status: 400 })
    }

    const newUser = addUser({
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role,
      wpUsername: body.wpUsername,
      wpAppPassword: body.wpAppPassword,
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json() as { id?: string }
    if (!body.id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }
    if (body.id === '1') {
      return NextResponse.json({ error: 'Não é possível remover o admin padrão' }, { status: 400 })
    }

    const removed = removeUser(body.id)
    if (!removed) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao remover usuário' }, { status: 500 })
  }
}
