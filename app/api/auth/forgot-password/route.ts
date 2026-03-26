import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    // Trigger WordPress lost password email via REST API
    const wcUrl = process.env.NEXT_PUBLIC_WC_URL || 'https://jaleca.com.br'
    const res = await fetch(`${wcUrl}/wp-json/wp/v2/users/lostpassword`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    // Even if the endpoint returns an error, we don't reveal whether the email exists
    void res

    return NextResponse.json({ success: true })
  } catch {
    // Always return success to avoid email enumeration
    return NextResponse.json({ success: true })
  }
}
