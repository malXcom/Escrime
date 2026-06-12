// ─── Paramètres du mur (en % de l'image) ─────────────────
export const ARENA_WALL = {
  cx:     0.545,
  cy:     0.50,
  radius: 0.285,
}

// ─── Constantes physique ──────────────────────────────────
export const PREY_SPEED    = 3.8   // vitesse max de la proie
export const CHASER_SPEED  = 4.8   // vitesse max du chasseur
export const HIT_DIST      = 52    // distance de frappe en px canvas
export const HIT_DURATION  = 28    // frames de l'effet de coup
export const FLEE_STRENGTH = 0.35  // force de fuite de la proie
export const CHASE_STRENGTH= 0.25  // force d'attraction du chasseur vers la proie
export const WANDER_FORCE  = 0.14  // dérive aléatoire de la proie
export const DAMPING       = 0.96  // amortissement vitesse

export const EMOJI_FONT = 44
