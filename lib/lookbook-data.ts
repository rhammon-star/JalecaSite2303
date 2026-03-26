import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'lookbook.json')

export type LookProduct = { name: string; slug: string; price: string }
export type Look = {
  id: string
  title: string
  image: string
  description: string
  products: LookProduct[]
}

export function getLooks(): Look[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(raw) as Look[]
  } catch {
    return []
  }
}

export function saveLook(look: Look): void {
  const looks = getLooks()
  const idx = looks.findIndex(l => l.id === look.id)
  if (idx >= 0) {
    looks[idx] = look
  } else {
    looks.push(look)
  }
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(looks, null, 2))
}

export function deleteLook(id: string): void {
  const looks = getLooks().filter(l => l.id !== id)
  fs.writeFileSync(DATA_FILE, JSON.stringify(looks, null, 2))
}
