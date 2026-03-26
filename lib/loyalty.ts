/**
 * Loyalty points system for Jaleca.
 * 1 BRL spent = 1 point. 100 points = R$5 discount.
 *
 * Points are stored in a local JSON file (data/loyalty.json) keyed by customerId.
 * In production, these should be stored in WooCommerce customer meta.
 */

import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const FILE = path.join(DATA_DIR, 'loyalty.json')

export { getPointsDiscount } from './loyalty-utils'
import { getPointsDiscount } from './loyalty-utils'

const POINTS_PER_REAL = 1
const DISCOUNT_PER_100_POINTS = 5 // R$5

type LoyaltyRecord = {
  customerId: number | string
  points: number
  updatedAt: string
}

type LoyaltyStore = Record<string, LoyaltyRecord>

async function readStore(): Promise<LoyaltyStore> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    const raw = await fs.readFile(FILE, 'utf-8')
    return JSON.parse(raw) as LoyaltyStore
  } catch {
    return {}
  }
}

async function writeStore(store: LoyaltyStore): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(store, null, 2), 'utf-8')
}

export async function getPoints(customerId: number | string): Promise<number> {
  const store = await readStore()
  return store[String(customerId)]?.points ?? 0
}

export async function addPoints(customerId: number | string, amount: number): Promise<number> {
  const store = await readStore()
  const key = String(customerId)
  const pointsToAdd = Math.floor(amount * POINTS_PER_REAL)
  const current = store[key]?.points ?? 0
  const newTotal = current + pointsToAdd

  store[key] = { customerId, points: newTotal, updatedAt: new Date().toISOString() }
  await writeStore(store)
  return newTotal
}

export async function redeemPoints(
  customerId: number | string,
  points: number
): Promise<{ ok: boolean; remaining: number; discount: number; error?: string }> {
  const store = await readStore()
  const key = String(customerId)
  const current = store[key]?.points ?? 0

  if (points > current) {
    return { ok: false, remaining: current, discount: 0, error: 'Saldo insuficiente' }
  }

  const newTotal = current - points
  store[key] = { customerId, points: newTotal, updatedAt: new Date().toISOString() }
  await writeStore(store)

  return { ok: true, remaining: newTotal, discount: getPointsDiscount(points) }
}

