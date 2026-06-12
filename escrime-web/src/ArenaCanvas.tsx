import { useEffect, useRef } from 'react'
import { getSpriteUrl } from './utils/sprites'
import {
  ARENA_WALL, PREY_SPEED, CHASER_SPEED, HIT_DIST, HIT_DURATION,
  FLEE_STRENGTH, CHASE_STRENGTH, WANDER_FORCE, DAMPING, EMOJI_FONT
} from './game/constants'
import type { FighterState, RuntimeState, ArenaCanvasProps } from './game/types'
import { len, normalize, capSpeed, constrainToCircle } from './game/physics'

// ─── Composant ───────────────────────────────────────────
export function ArenaCanvas({ fighter1, fighter2, showResult, onHit }: ArenaCanvasProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const stateRef   = useRef<RuntimeState | null>(null)
  const onHitRef   = useRef(onHit)
  useEffect(() => { onHitRef.current = onHit }, [onHit])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    // ── Rect de l'image en mode "contain" (garde le ratio 1000/700) ──
    const IMG_ASPECT = 1000 / 700
    const imgRect = () => {
      const canvasAspect = canvas.width / (canvas.height || 1)
      let drawW: number, drawH: number, drawX: number, drawY: number
      if (canvasAspect > IMG_ASPECT) {
        // Canvas plus large → bandes à gauche/droite
        drawH = canvas.height
        drawW = drawH * IMG_ASPECT
        drawX = (canvas.width - drawW) / 2
        drawY = 0
      } else {
        // Canvas plus haut → bandes en haut/bas
        drawW = canvas.width
        drawH = drawW / IMG_ASPECT
        drawX = 0
        drawY = (canvas.height - drawH) / 2
      }
      return { drawX, drawY, drawW, drawH }
    }

    // ── Centre/rayon du mur dans l'espace canvas (relatif à l'image dessinée) ──
    const wall = () => {
      const { drawX, drawY, drawW, drawH } = imgRect()
      return {
        cx: drawX + drawW * ARENA_WALL.cx,
        cy: drawY + drawH * ARENA_WALL.cy,
        r:  drawW * ARENA_WALL.radius,
      }
    }

    // ── Positions initiales ──
    function resetPositions(s: RuntimeState) {
      const { cx, cy, r } = wall()
      const offset = r * 0.45
      const angle = Math.random() * Math.PI * 2
      s.prey.x  = cx + Math.cos(angle) * offset
      s.prey.y  = cy + Math.sin(angle) * offset
      s.prey.vx = 0; s.prey.vy = 0
      s.chaser.x  = cx + Math.cos(angle + Math.PI) * offset
      s.chaser.y  = cy + Math.sin(angle + Math.PI) * offset
      s.chaser.vx = 0; s.chaser.vy = 0
    }

    // ── Taille responsive ──
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width  = rect.width
      canvas.height = rect.height
      if (stateRef.current) resetPositions(stateRef.current)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const createFighter = (f: {name: string, icon: string}) => {
      const charImg = new Image()
      charImg.src = getSpriteUrl(f.name)
      const fs: FighterState = { 
          name: f.name, icon: f.icon, 
          x: 0, y: 0, vx: 0, vy: 0, wanderAngle: Math.random() * Math.PI * 2,
          img: charImg, imgLoaded: false
      }
      charImg.onload = () => { fs.imgLoaded = true }
      return fs
    }

    // ── Init state ──
    const img = new Image()
    img.src = '/arena.jpg'

    const state: RuntimeState = {
      prey:   createFighter(fighter1),
      chaser: createFighter(fighter2),
      preyIsF1: true,
      hitTimer: 0, hitX: 0, hitY: 0,
      frameId: 0,
      img, imgLoaded: false,
    }
    stateRef.current = state
    img.onload = () => { state.imgLoaded = true }
    resetPositions(state)

    // ── Rendu sprite ──
    const drawSprite = (
      f: FighterState, x: number, y: number,
      scale = 1, alpha = 1,
      rotationRad = 0,
    ) => {
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.translate(x, y)
      ctx.rotate(rotationRad)
      
      if (f.imgLoaded && f.img) {
        // Le mode multiply permet de rendre le fond blanc de l'image transparent
        // et de fusionner les traits avec la texture du parchemin !
        ctx.globalCompositeOperation = 'multiply'
        const size = 110 * scale
        ctx.drawImage(f.img, -size/2, -size/2, size, size)
      } else {
        // Fallback emoji
        ctx.font = `${EMOJI_FONT * scale}px serif`
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(f.icon, 0, 0)
      }
      ctx.restore()
    }

    const drawLabel = (name: string, x: number, y: number, alpha = 1) => {
      ctx.save()
      ctx.globalAlpha   = alpha
      ctx.font          = 'bold 12px Inter, sans-serif'
      ctx.textAlign     = 'center'
      ctx.textBaseline  = 'top'
      ctx.fillStyle     = '#ffe6a7'
      ctx.shadowColor   = 'rgba(0,0,0,0.95)'
      ctx.shadowBlur    = 8
      ctx.fillText(name, x, y + 26)
      ctx.restore()
    }

    // ── Boucle principale ──
    const loop = () => {
      const s = stateRef.current!
      const { cx, cy, r } = wall()
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Fond : noir + image en contain
      ctx.fillStyle = '#1a0a06'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      const { drawX, drawY, drawW, drawH } = imgRect()
      if (s.imgLoaded) {
        ctx.drawImage(s.img, drawX, drawY, drawW, drawH)
      }

      // ── Cadre parchemin autour de l'image ──
      // Grain vieilli sur les 4 bords (à l'intérieur de l'image)
      const grainSize = Math.min(drawW, drawH) * 0.07
      ;[
        { x: drawX, y: drawY,            w: drawW, h: grainSize, dir: 'down'  as const },
        { x: drawX, y: drawY+drawH-grainSize, w: drawW, h: grainSize, dir: 'up'   as const },
        { x: drawX, y: drawY,            w: grainSize, h: drawH, dir: 'right' as const },
        { x: drawX+drawW-grainSize, y: drawY, w: grainSize, h: drawH, dir: 'left'  as const },
      ].forEach(({ x, y, w, h, dir }) => {
        const g = dir === 'down'  ? ctx.createLinearGradient(x, y, x, y + h)
                : dir === 'up'   ? ctx.createLinearGradient(x, y + h, x, y)
                : dir === 'right'? ctx.createLinearGradient(x, y, x + w, y)
                :                  ctx.createLinearGradient(x + w, y, x, y)
        g.addColorStop(0, 'rgba(187,148,87,0.22)')
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.fillRect(x, y, w, h)
      })

      // Bordures concentriques autour du rect image
      const layers = [
        { off: 2,  lw: 2, color: 'rgba(187,148,87,0.92)' },
        { off: 5,  lw: 3, color: 'rgba(67,40,24,0.97)'   },
        { off: 9,  lw: 4, color: 'rgba(111,29,27,0.88)'  },
        { off: 13, lw: 2, color: 'rgba(187,148,87,0.65)' },
        { off: 16, lw: 3, color: 'rgba(43,24,8,0.95)'    },
      ]
      for (const { off, lw, color } of layers) {
        ctx.save()
        ctx.strokeStyle = color
        ctx.lineWidth   = lw
        ctx.strokeRect(drawX - off, drawY - off, drawW + off * 2, drawH + off * 2)
        ctx.restore()
      }

      // Ornements ⚜ aux 4 coins
      const cornerOff = 22
      const cornerPositions = [
        { x: drawX - cornerOff, y: drawY - cornerOff,           sx: 1,  sy: 1  },
        { x: drawX + drawW + cornerOff, y: drawY - cornerOff,   sx: -1, sy: 1  },
        { x: drawX - cornerOff, y: drawY + drawH + cornerOff,   sx: 1,  sy: -1 },
        { x: drawX + drawW + cornerOff, y: drawY + drawH + cornerOff, sx: -1, sy: -1 },
      ]
      ctx.save()
      ctx.font = '18px serif'
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle    = '#bb9457'
      ctx.shadowColor  = 'rgba(187,148,87,0.7)'
      ctx.shadowBlur   = 6
      for (const { x, y, sx, sy } of cornerPositions) {
        ctx.save()
        ctx.translate(x, y)
        ctx.scale(sx, sy)
        ctx.fillText('⚜', 0, 0)
        ctx.restore()
      }
      ctx.restore()

      if (showResult) {
        // ── Phase résultat ──
        const renderResult = (
          f: FighterState,
          outcome: string | null,
        ) => {
          if (outcome === 'Win') {
            drawSprite(f, f.x, f.y, 1.4, 1)
            drawLabel(f.name, f.x, f.y)
            ctx.save()
            ctx.font = '20px serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'bottom'
            ctx.fillText('👑', f.x, f.y - 40)
            ctx.restore()
          } else if (outcome === 'Loss') {
            ctx.save()
            ctx.globalCompositeOperation = 'luminosity'
            drawSprite(f, f.x, f.y, 1, 0.4, Math.PI / 2) // Couché
            drawLabel(f.name, f.x, f.y, 0.5)
            ctx.restore()
          } else {
            // Draw
            drawSprite(f, f.x, f.y, 1)
            drawLabel(f.name, f.x, f.y)
          }
        }

        const f1State: FighterState = s.preyIsF1 ? s.prey : s.chaser
        const f2State: FighterState = s.preyIsF1 ? s.chaser : s.prey
        renderResult(f1State, fighter1.outcome)
        renderResult(f2State, fighter2.outcome)

        s.frameId = requestAnimationFrame(loop)
        return
      }

      // --- Calculs de base ---
      const dx = s.prey.x - s.chaser.x
      const dy = s.prey.y - s.chaser.y
      const distChase = len(dx, dy)

      // --- Chasseur : fonce droit sur la proie ---
      // dx = prey - chaser → le chasseur doit aller dans le sens +dx/+dy
      const [toPreyX, toPreyY] = normalize(dx, dy)
      s.chaser.vx += toPreyX * CHASE_STRENGTH
      s.chaser.vy += toPreyY * CHASE_STRENGTH;
      [s.chaser.vx, s.chaser.vy] = capSpeed(s.chaser.vx, s.chaser.vy, CHASER_SPEED)
      s.chaser.vx *= DAMPING
      s.chaser.vy *= DAMPING
      s.chaser.x  += s.chaser.vx
      s.chaser.y  += s.chaser.vy
      constrainToCircle(s.chaser, cx, cy, r)

      // --- Proie : errance aléatoire, panique seulement si le chasseur est TRÈS proche ---
      // L'angle de dérive tourne lentement — mouvement naturel
      s.prey.wanderAngle += (Math.random() - 0.5) * 0.3
      s.prey.vx += Math.cos(s.prey.wanderAngle) * WANDER_FORCE
      s.prey.vy += Math.sin(s.prey.wanderAngle) * WANDER_FORCE

      // Fuite active uniquement dans le tiers intérieur (chasser est proche)
      const panicZone = r * 0.35
      if (distChase < panicZone) {
        const panicStrength = FLEE_STRENGTH * (1 - distChase / panicZone)
        const [fx, fy] = normalize(s.prey.x - s.chaser.x, s.prey.y - s.chaser.y)
        // Ajoute une composante perpendiculaire pour esquiver en arc
        s.prey.vx += fx * panicStrength + (-fy) * panicStrength * 0.5
        s.prey.vy += fy * panicStrength + ( fx) * panicStrength * 0.5
      }

      [s.prey.vx, s.prey.vy] = capSpeed(s.prey.vx, s.prey.vy, PREY_SPEED)
      s.prey.vx *= DAMPING
      s.prey.vy *= DAMPING
      s.prey.x  += s.prey.vx
      s.prey.y  += s.prey.vy
      constrainToCircle(s.prey, cx, cy, r)

      // --- Détection de coup ---
      const hitDist = len(s.prey.x - s.chaser.x, s.prey.y - s.chaser.y)
      if (hitDist < HIT_DIST && s.hitTimer <= 0) {
        s.hitTimer = HIT_DURATION
        s.hitX     = (s.prey.x + s.chaser.x) / 2
        s.hitY     = (s.prey.y + s.chaser.y) / 2
        // Notifie React pour mettre à jour les HP
        onHitRef.current?.(s.preyIsF1)
        // Knock-back de la proie
        const [kx, ky] = normalize(s.prey.x - s.chaser.x, s.prey.y - s.chaser.y)
        s.prey.vx = kx * 5
        s.prey.vy = ky * 5
        // Swap de rôles aléatoire 35%
        if (Math.random() < 0.35) {
          const tmp  = s.prey
          s.prey     = s.chaser
          s.chaser   = tmp
          s.preyIsF1 = !s.preyIsF1
        }
      }
      if (s.hitTimer > 0) s.hitTimer--

      // --- Shake si coup ---
      const shake = (f: FighterState, isHit: boolean) =>
        isHit && s.hitTimer > 0
          ? [f.x + (Math.random() - 0.5) * 5, f.y + (Math.random() - 0.5) * 5] as const
          : [f.x, f.y] as const

      // --- Rendu ---
      // Les sprites regardent dans la direction de leur mouvement (top down)
      const chaserAngle = Math.atan2(s.chaser.vy, s.chaser.vx) + Math.PI / 2
      const preyAngle   = Math.atan2(s.prey.vy,   s.prey.vx)   + Math.PI / 2

      const [cx2, cy2] = shake(s.chaser, true)
      const [px2, py2] = shake(s.prey,   s.hitTimer > HIT_DURATION / 2)

      drawSprite(s.chaser, cx2, cy2, 1.05, 1, chaserAngle)
      drawLabel(s.chaser.name, s.chaser.x, s.chaser.y)

      drawSprite(s.prey,   px2, py2,   0.95, 1, preyAngle)
      drawLabel(s.prey.name,   s.prey.x,   s.prey.y)

      // Effet de frappe
      if (s.hitTimer > 0) {
        const hitAlpha = s.hitTimer / HIT_DURATION
        const symbols  = ['⚡', '💥', '✨']
        const sym      = symbols[Math.floor((1 - hitAlpha) * symbols.length)] ?? '⚡'
        ctx.save()
        ctx.globalAlpha = hitAlpha
        ctx.font = `${20 + (1 - hitAlpha) * 20}px serif`
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(sym, s.hitX, s.hitY)
        ctx.restore()
      }

      s.frameId = requestAnimationFrame(loop)
    }

    state.frameId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(stateRef.current!.frameId)
      ro.disconnect()
    }
  }, [showResult, fighter1.outcome, fighter2.outcome])

  return (
    <canvas
      ref={canvasRef}
      className="arena-canvas"
      aria-label="Arène de combat"
    />
  )
}
