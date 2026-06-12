import { useState, useRef, useCallback } from 'react'
import type { Player } from '../types'

const API_URL = 'http://localhost:5136'

interface TournamentMatch {
  p1: Player
  p2: Player
}

// Génère toutes les paires round-robin (chaque joueur joue 4 fois avec 5 joueurs)
function generateRoundRobin(players: Player[]): TournamentMatch[] {
  const pairs: TournamentMatch[] = []
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      pairs.push({ p1: players[i], p2: players[j] })
    }
  }
  // Mélanger aléatoirement pour varier l'ordre
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pairs[i], pairs[j]] = [pairs[j], pairs[i]]
  }
  return pairs
}

export interface NextMatchInfo {
  p1Name: string
  p2Name: string
  p1Icon: string
  p2Icon: string
}

export function useTournamentMode(
  playMatch: (p1Id: string, p2Id: string, addToast: (msg: string, type: any) => void) => Promise<void>,
  fetchData: () => Promise<void>,
  addToast: (msg: string, type: any) => void
) {
  const [isTournamentRunning, setIsTournamentRunning] = useState(false)
  const [tournamentMatchIndex, setTournamentMatchIndex] = useState(0)
  const [tournamentTotal, setTournamentTotal] = useState(0)
  const [tournamentFinished, setTournamentFinished] = useState(false)
  const [nextMatchInfo, setNextMatchInfo] = useState<NextMatchInfo | null>(null)

  // Stockés en refs pour être accessibles dans les callbacks sans recréation
  const matchesRef      = useRef<TournamentMatch[]>([])
  const matchIndexRef   = useRef(0)
  const consLossesRef   = useRef<Record<number, number>>({})
  const disqualifiedRef = useRef<Set<number>>(new Set())

  const applyPenalty = async (playerId: number) => {
    try {
      await fetch(
        `${API_URL}/api/Players/${playerId}/penalty?penaltyPoints=10&isDisqualified=true`,
        { method: 'PUT' }
      )
      addToast('⚠️ Joueur disqualifié après 2 défaites consécutives !', 'warning')
    } catch (e) {
      console.error('Erreur pénalité:', e)
    }
  }

  // Appelé par useFight après chaque fin de combat (résultat calculé côté arène)
  const onFightResult = useCallback(async (
    p1Id: number,
    p2Id: number,
    out1: string,
    out2: string
  ) => {
    const cons = consLossesRef.current

    const updateCons = (id: number, outcome: string) => {
      cons[id] = outcome === 'Loss' ? (cons[id] ?? 0) + 1 : 0
    }
    updateCons(p1Id, out1)
    updateCons(p2Id, out2)

    const checkDisq = async (id: number) => {
      if ((cons[id] ?? 0) >= 2 && !disqualifiedRef.current.has(id)) {
        disqualifiedRef.current.add(id)
        await applyPenalty(id)
      }
    }
    await checkDisq(p1Id)
    await checkDisq(p2Id)

    await fetchData()

    const nextIndex = matchIndexRef.current + 1
    matchIndexRef.current = nextIndex

    if (nextIndex >= matchesRef.current.length) {
      // Tournoi terminé — on reste sur l'écran tournoi jusqu'à ce que l'utilisateur ferme
      setNextMatchInfo(null)
      setTournamentFinished(true)
      addToast('🏆 Le tournoi est terminé ! Consultez le classement final.', 'success')
      return
    }

    setTournamentMatchIndex(nextIndex)

    const next = matchesRef.current[nextIndex]
    setNextMatchInfo({ p1Name: next.p1.name, p2Name: next.p2.name, p1Icon: next.p1.icon, p2Icon: next.p2.icon })

    setTimeout(() => {
      playMatch(next.p1.id.toString(), next.p2.id.toString(), addToast)
    }, 1500)
  }, [playMatch, fetchData, addToast])

  const startTournament = useCallback((players: Player[]) => {
    if (players.length < 2) {
      addToast('Il faut au moins 2 joueurs pour lancer un tournoi.', 'warning')
      return
    }

    const matches = generateRoundRobin(players)
    matchesRef.current      = matches
    matchIndexRef.current   = 0
    consLossesRef.current   = {}
    disqualifiedRef.current = new Set()

    setTournamentMatchIndex(0)
    setTournamentTotal(matches.length)
    setTournamentFinished(false)
    setIsTournamentRunning(true)

    const first = matches[0]
    setNextMatchInfo({ p1Name: first.p1.name, p2Name: first.p2.name, p1Icon: first.p1.icon, p2Icon: first.p2.icon })

    addToast(`🏟️ Tournoi lancé ! ${matches.length} combats au programme.`, 'info')
    playMatch(first.p1.id.toString(), first.p2.id.toString(), addToast)
  }, [playMatch, addToast])

  const closeTournament = useCallback(() => {
    setIsTournamentRunning(false)
    setTournamentFinished(false)
    setNextMatchInfo(null)
  }, [])

  return {
    isTournamentRunning,
    tournamentMatchIndex,
    tournamentTotal,
    tournamentFinished,
    nextMatchInfo,
    startTournament,
    onFightResult,
    closeTournament,
  }
}
