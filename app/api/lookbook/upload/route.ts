import { NextRequest, NextResponse } from 'next/server'
import { verifyBlogToken } from '@/lib/blog-auth'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('blog-token')?.value
  if (!token || !verifyBlogToken(token)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Arquivo obrigatório' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const filename = `look-${Date.now()}.${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'lookbook')
  fs.mkdirSync(uploadDir, { recursive: true })
  fs.writeFileSync(path.join(uploadDir, filename), buffer)

  return NextResponse.json({ url: `/lookbook/${filename}` })
}
