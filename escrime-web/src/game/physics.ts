import type { FighterState } from './types'

export function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

export function len(vx: number, vy: number) {
  return Math.sqrt(vx * vx + vy * vy)
}

export function normalize(vx: number, vy: number): [number, number] {
  const l = len(vx, vy) || 1
  return [vx / l, vy / l]
}

/** Limite la norme du vecteur vitesse */
export function capSpeed(vx: number, vy: number, maxSpeed: number): [number, number] {
  const l = len(vx, vy)
  if (l > maxSpeed) return [(vx / l) * maxSpeed, (vy / l) * maxSpeed]
  return [vx, vy]
}

/** Contraint un fighter à rester dans le cercle */
export function constrainToCircle(
  f: FighterState,
  cx: number, cy: number, r: number,
  margin = 26,
) {
  const dx   = f.x - cx
  const dy   = f.y - cy
  const dist = len(dx, dy)
  const maxR = r - margin

  if (dist > maxR) {
    const [nx, ny] = normalize(dx, dy)
    f.x  = cx + nx * maxR
    f.y  = cy + ny * maxR
    // Réflexion + amortissement
    const dot = f.vx * nx + f.vy * ny
    f.vx = (f.vx - 2 * dot * nx) * 0.7
    f.vy = (f.vy - 2 * dot * ny) * 0.7
  }
}
