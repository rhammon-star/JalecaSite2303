import { NextRequest, NextResponse } from 'next/server'
import { getProductReviews, createProductReview } from '@/lib/woocommerce'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
    const id = Number(productId)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const reviews = await getProductReviews(id)
    return NextResponse.json(reviews)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar avaliações'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
    const body = await request.json()
    const { rating, review, reviewer, reviewer_email } = body

    if (!rating || !review || !reviewer || !reviewer_email) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    const newReview = await createProductReview({
      product_id: Number(productId),
      reviewer,
      reviewer_email,
      review,
      rating: Number(rating),
    })

    return NextResponse.json(newReview, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar avaliação'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
