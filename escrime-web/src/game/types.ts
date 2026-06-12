export interface FighterState {
  name:  string
  icon:  string
  x:     number
  y:     number
  vx:    number
  vy:    number
  wanderAngle: number
  img?: HTMLImageElement
  imgLoaded?: boolean
}

export interface RuntimeState {
  prey:    FighterState
  chaser:  FighterState
  /** qui est qui dans les props (pour les outcomes) */
  preyIsF1: boolean
  hitTimer: number   // >0 = en cours de coup
  hitX:    number
  hitY:    number
  frameId: number
  img:     HTMLImageElement
  imgLoaded: boolean
}

export interface ArenaCanvasProps {
  fighter1: { name: string; icon: string; outcome: string | null }
  fighter2: { name: string; icon: string; outcome: string | null }
  showResult: boolean
  onHit?: (preyIsF1: boolean) => void
}
