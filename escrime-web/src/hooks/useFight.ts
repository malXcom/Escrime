import { useState, useRef, useCallback } from 'react'

const MAX_HP      = 100
const HIT_DMG_MIN = 15
const HIT_DMG_MAX = 30
const API_URL     = 'http://localhost:5136'

export function useFight(
  onFightEndCallback: () => void,
  onFightResult?: (p1Id: number, p2Id: number, out1: string, out2: string) => Promise<void>
) {
  const [isFighting, setIsFighting] = useState(false)
  const [fightResult, setFightResult] = useState<any>(null)
  const [showResult, setShowResult] = useState(false)
  const [hp1, setHp1]               = useState(MAX_HP)
  const [hp2, setHp2]               = useState(MAX_HP)
  const [outcome1, setOutcome1]     = useState<string | null>(null)
  const [outcome2, setOutcome2]     = useState<string | null>(null)
  const [kingIntervened, setKingIntervened] = useState(false)

  const hp1Ref         = useRef(MAX_HP)
  const hp2Ref         = useRef(MAX_HP)
  const fightEndedRef  = useRef(false)
  const kingRef        = useRef(false)       // ce combat est un "combat du roi"
  const kingFightRef   = useRef(false)       // 17% de chance de combat du roi
  const hitCountRef    = useRef(0)           // compteur de coups total
  const safetyTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null) // timer de fin d'affichage résultat

  const saveMatchResult = async (playerId: number, outcome: number) => {
    try {
      await fetch(`${API_URL}/api/Players/${playerId}/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome })
      })
    } catch (e) {
      console.error('Erreur saveMatchResult:', e)
    }
  }

  const endFight = useCallback(() => {
    if (fightEndedRef.current) return
    fightEndedRef.current = true
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)

    let out1Str = 'Draw'
    let out2Str = 'Draw'
    let out1Num = 1 // Draw = 1
    let out2Num = 1

    if (!kingRef.current) {
      if (hp1Ref.current <= 0 && hp2Ref.current > 0) {
        out1Str = 'Loss'; out2Str = 'Win'
        out1Num = 2;      out2Num = 0 // Win = 0, Loss = 2
      } else if (hp2Ref.current <= 0 && hp1Ref.current > 0) {
        out1Str = 'Win';  out2Str = 'Loss'
        out1Num = 0;      out2Num = 2
      } else if (hp1Ref.current > hp2Ref.current) {
        out1Str = 'Win';  out2Str = 'Loss'
        out1Num = 0;      out2Num = 2
      } else if (hp2Ref.current > hp1Ref.current) {
        out1Str = 'Loss'; out2Str = 'Win'
        out1Num = 2;      out2Num = 0
      }
    }
    
    setOutcome1(out1Str)
    setOutcome2(out2Str)

    // Save results to backend then notify listeners
    if (fightResult) {
      Promise.all([
        saveMatchResult(fightResult.player1.id, out1Num),
        saveMatchResult(fightResult.player2.id, out2Num)
      ]).then(async () => {
        setShowResult(true)
        // Notify tournament mode (async: penalty + schedule next match)
        if (onFightResult) {
          await onFightResult(fightResult.player1.id, fightResult.player2.id, out1Str, out2Str)
        }
        // Timer de nettoyage — annulé par playMatch si un prochain combat commence avant
        cleanupTimerRef.current = setTimeout(() => {
          setIsFighting(false)
          onFightEndCallback()
        }, 3000)
      })
    } else {
      setShowResult(true)
      cleanupTimerRef.current = setTimeout(() => {
        setIsFighting(false)
        onFightEndCallback()
      }, 3000)
    }
  }, [onFightEndCallback, onFightResult, fightResult])

  const playMatch = async (player1Id: string, player2Id: string, addToast: (msg: string, type: any) => void) => {
    if (player1Id === player2Id) {
      addToast('Un joueur ne peut pas se battre contre lui-même !', 'warning')
      return
    }
    // Annuler le timer de nettoyage du combat précédent s'il est encore actif
    if (cleanupTimerRef.current) {
      clearTimeout(cleanupTimerRef.current)
      cleanupTimerRef.current = null
    }
    try {
      const res = await fetch(`${API_URL}/api/tournament/play-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player1Id: parseInt(player1Id),
          player2Id: parseInt(player2Id),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        hp1Ref.current      = MAX_HP
        hp2Ref.current      = MAX_HP
        fightEndedRef.current = false
        kingRef.current       = false
        hitCountRef.current   = 0
        kingFightRef.current  = Math.random() < 0.17 // 17% probability
        setHp1(MAX_HP)
        setHp2(MAX_HP)
        setOutcome1(null)
        setOutcome2(null)
        setKingIntervened(false)
        setFightResult(data)
        setIsFighting(true)
        setShowResult(false)

        safetyTimerRef.current = setTimeout(endFight, 15000)
      } else {
        addToast('Erreur lors du lancement du combat.', 'error')
      }
    } catch (error) {
      console.error(error)
      addToast('Impossible de joindre le serveur.', 'error')
    }
  }

  const handleHit = useCallback((preyIsF1: boolean) => {
    if (fightEndedRef.current) return

    hitCountRef.current++

    if (kingFightRef.current && hitCountRef.current >= 3) {
      kingRef.current = true
      setKingIntervened(true)
      endFight()
      return
    }

    const dmg = HIT_DMG_MIN + Math.floor(Math.random() * (HIT_DMG_MAX - HIT_DMG_MIN))
    if (preyIsF1) {
      hp1Ref.current = Math.max(0, hp1Ref.current - dmg)
      setHp1(hp1Ref.current)
      if (hp1Ref.current <= 0) endFight()
    } else {
      hp2Ref.current = Math.max(0, hp2Ref.current - dmg)
      setHp2(hp2Ref.current)
      if (hp2Ref.current <= 0) endFight()
    }
  }, [endFight])

  return {
    isFighting, fightResult, showResult,
    hp1, hp2, outcome1, outcome2, kingIntervened,
    playMatch, handleHit
  }
}
