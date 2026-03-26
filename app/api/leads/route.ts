import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const LEADS_FILE = path.join(DATA_DIR, 'leads.json')

type Lead = {
  email: string
  source: string
  createdAt: string
}

async function readLeads(): Promise<Lead[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    const raw = await fs.readFile(LEADS_FILE, 'utf-8')
    return JSON.parse(raw) as Lead[]
  } catch {
    return []
  }
}

async function writeLeads(leads: Lead[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8')
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; source?: string }
    const { email, source = 'popup' } = body

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    const leads = await readLeads()

    // Avoid duplicate emails
    const exists = leads.some(l => l.email === email)
    if (!exists) {
      leads.push({ email, source, createdAt: new Date().toISOString() })
      await writeLeads(leads)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao salvar lead'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const leads = await readLeads()
    return NextResponse.json(leads)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao ler leads'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
