/**
 * Pure utility functions for the loyalty points system.
 * Safe to import in both client and server components.
 */

export const DISCOUNT_PER_100_POINTS = 5 // R$5

export function getPointsDiscount(points: number): number {
  return Math.floor(points / 100) * DISCOUNT_PER_100_POINTS
}
