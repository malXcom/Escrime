import { useState, useEffect } from 'react'
import { useToast, Toaster } from './toast'
import { Dashboard } from './components/Dashboard'
import { FightScreen } from './components/FightScreen'
import { TournamentScreen } from './components/TournamentScreen'
import { useTournament } from './hooks/useTournament'
import { useFight } from './hooks/useFight'
import { useTournamentMode } from './hooks/useTournamentMode'

function App() {
  const { toasts, addToast, removeToast } = useToast()
  const { ranking, champion, loading, fetchData, seedDatabase } = useTournament()

  const effectiveChampion = ranking.length > 0 && ranking.some(r => r.totalScore > 0)
    ? champion
    : null

  const [player1Id, setPlayer1Id] = useState<string>('')
  const [player2Id, setPlayer2Id] = useState<string>('')

  // Synchronize selected players with the ranking list.
  useEffect(() => {
    if (ranking.length >= 2) {
      const p1Exists = ranking.some(r => r.player.id.toString() === player1Id)
      const p2Exists = ranking.some(r => r.player.id.toString() === player2Id)
      if (!p1Exists || !p2Exists) {
        setPlayer1Id(ranking[0].player.id.toString())
        setPlayer2Id(ranking[1].player.id.toString())
      }
    }
  }, [ranking, player1Id, player2Id])

  const {
    isTournamentRunning,
    tournamentMatchIndex,
    tournamentTotal,
    tournamentFinished,
    nextMatchInfo,
    startTournament,
    onFightResult,
    closeTournament,
  } = useTournamentMode(
    async (p1Id, p2Id, addToast) => { await playMatch(p1Id, p2Id, addToast) },
    fetchData,
    addToast
  )

  const {
    isFighting, fightResult, showResult,
    hp1, hp2, outcome1, outcome2, kingIntervened,
    playMatch, handleHit
  } = useFight(
    () => { fetchData() },
    (p1Id, p2Id, out1, out2) => onFightResult(p1Id, p2Id, out1, out2)
  )

  const isLocked = isFighting || isTournamentRunning

  // ── Vue Tournoi (prioritaire, jamais quittée pendant un tournoi) ──
  if (isTournamentRunning) {
    return (
      <>
        <Toaster toasts={toasts} onRemove={removeToast} />
        <TournamentScreen
          fightResult={fightResult}
          isFighting={isFighting}
          showResult={showResult}
          hp1={hp1}
          hp2={hp2}
          outcome1={outcome1}
          outcome2={outcome2}
          kingIntervened={kingIntervened}
          onHit={handleHit}
          tournamentMatchIndex={tournamentMatchIndex}
          tournamentTotal={tournamentTotal}
          tournamentFinished={tournamentFinished}
          nextMatchInfo={nextMatchInfo}
          ranking={ranking}
          onClose={closeTournament}
        />
      </>
    )
  }

  // ── Vue combat solo plein écran ──
  if (isFighting && fightResult) {
    return (
      <>
        <Toaster toasts={toasts} onRemove={removeToast} />
        <FightScreen
          fightResult={fightResult}
          showResult={showResult}
          hp1={hp1}
          hp2={hp2}
          outcome1={outcome1}
          outcome2={outcome2}
          kingIntervened={kingIntervened}
          onHit={handleHit}
        />
      </>
    )
  }

  // ── Vue accueil ──
  return (
    <>
      <Toaster toasts={toasts} onRemove={removeToast} />
      <header className="app-header">
        <h1>⚔️ Escrime Fantastique</h1>
        <p className="app-subtitle">Tournoi des Champions</p>
      </header>

      <main className="app-main">
        {loading ? (
          <div className="loading">Chargement de l'arène…</div>
        ) : (
          <>
            {/* Contrôles combat */}
            <section className="fight-section">
              <div className="fight-controls">
                <select id="player1-select" className="select-hero" value={player1Id} onChange={(e) => setPlayer1Id(e.target.value)}>
                  {ranking.map(r => (
                    <option key={`p1-${r.player.id}`} value={r.player.id}>
                      {r.player.icon} {r.player.name}
                    </option>
                  ))}
                </select>

                <span className="vs-label">CONTRE</span>

                <select id="player2-select" className="select-hero" value={player2Id} onChange={(e) => setPlayer2Id(e.target.value)}>
                  {ranking.map(r => (
                    <option key={`p2-${r.player.id}`} value={r.player.id}>
                      {r.player.icon} {r.player.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="fight-buttons">
                <button
                  id="play-match-btn"
                  className="btn-primary"
                  onClick={() => playMatch(player1Id, player2Id, addToast)}
                  disabled={isLocked}
                >
                  ⚔️ Lancer le Combat !
                </button>

                <button
                  id="tournament-btn"
                  className="btn-tournament"
                  onClick={() => startTournament(ranking.map(r => r.player))}
                  disabled={isLocked}
                >
                  🏟️ Lancer un Tournoi
                </button>
              </div>

              <button id="seed-btn" className="btn-secondary" onClick={seedDatabase} disabled={isLocked}>
                Réinitialiser les joueurs par défaut
              </button>
            </section>

            <div className="ornament-divider">─────── ✦ ───────</div>

            <Dashboard
              champion={effectiveChampion}
              ranking={ranking}
              onRefresh={fetchData}
            />
          </>
        )}
      </main>
    </>
  )
}

export default App
