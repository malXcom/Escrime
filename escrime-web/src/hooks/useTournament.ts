import { useState, useEffect } from 'react'
import type { PlayerScore, Player } from '../types'

const API_URL = 'http://localhost:5136'

export function useTournament() {
  const [ranking, setRanking] = useState<PlayerScore[]>([])
  const [champion, setChampion] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const rankingRes = await fetch(`${API_URL}/api/tournament/ranking`)
      if (rankingRes.ok) {
        const data: PlayerScore[] = await rankingRes.json()
        setRanking(data)
      }
      const champRes = await fetch(`${API_URL}/api/tournament/champion`)
      if (champRes.ok) {
        const champData: Player = await champRes.json()
        setChampion(champData)
      } else {
        setChampion(null)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error)
    } finally {
      setLoading(false)
    }
  }

  const seedDatabase = async () => {
    try {
      await fetch(`${API_URL}/api/tournament/seed`, { method: 'POST' })
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { ranking, champion, loading, fetchData, seedDatabase }
}
