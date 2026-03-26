import { NextRequest, NextResponse } from 'next/server'
import { getPosts } from '@/lib/wordpress'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const perPage = searchParams.get('per_page') ? Number(searchParams.get('per_page')) : undefined
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : undefined
    const search = searchParams.get('search') || undefined

    const posts = await getPosts({ per_page: perPage, page, search })
    return NextResponse.json(posts)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar posts'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
