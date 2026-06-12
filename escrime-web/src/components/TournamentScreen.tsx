import { HpBar } from './HpBar'
import { ArenaCanvas } from '../ArenaCanvas'
import { getSpriteUrl } from '../utils/sprites'
import type { PlayerScore } from '../types'
import type { NextMatchInfo } from '../hooks/useTournamentMode'

interface TournamentScreenProps {
  // Données combat
  fightResult: any
  isFighting: boolean
  showResult: boolean
  hp1: number
  hp2: number
  outcome1: string | null
  outcome2: string | null
  kingIntervened: boolean
  onHit: (preyIsF1: boolean) => void
  // Données tournoi
  tournamentMatchIndex: number
  tournamentTotal: number
  tournamentFinished: boolean
  nextMatchInfo: NextMatchInfo | null
  // Classement live
  ranking: PlayerScore[]
  onClose: () => void
}

const getRankLabel = (i: number) => ['🥇', '🥈', '🥉'][i] ?? `${i + 1}.`

export function TournamentScreen({
  fightResult, isFighting, showResult, hp1, hp2, outcome1, outcome2,
  kingIntervened, onHit,
  tournamentMatchIndex, tournamentTotal, tournamentFinished, nextMatchInfo,
  ranking, onClose,
}: TournamentScreenProps) {

  return (
    <div className="tournament-screen">

      {/* ── Bandeau supérieur ── */}
      <div className="tournament-header">
        <div className="tournament-header-title">
          🏟️ Tournoi — {tournamentFinished
            ? 'Terminé !'
            : `Match ${tournamentMatchIndex + 1} / ${tournamentTotal}`
          }
        </div>
        {tournamentFinished && (
          <button className="btn-ghost tournament-close-btn" onClick={onClose}>
            ✕ Fermer le tournoi
          </button>
        )}
      </div>

      {/* ── HUD combat (barres de vie) ── */}
      {isFighting && fightResult ? (
        <div className="fight-hud">
          <HpBar name={fightResult.player1.name} hp={hp1} />
          <div className="fight-hud-center">
            {showResult
              ? <span className="fight-result-badge">⚔️ FIN</span>
              : <span className="fight-vs-badge">VS</span>
            }
          </div>
          <HpBar name={fightResult.player2.name} hp={hp2} reversed />
        </div>
      ) : (
        <div className="tournament-idle-hud">
          {tournamentFinished ? (
            <span className="tournament-idle-label">🏆 Les combats sont terminés !</span>
          ) : nextMatchInfo ? (
            <span className="tournament-idle-label">
              ⚡ Prochain combat : {nextMatchInfo.p1Icon} {nextMatchInfo.p1Name} <span className="tournament-idle-vs">VS</span> {nextMatchInfo.p2Icon} {nextMatchInfo.p2Name}
            </span>
          ) : null}
        </div>
      )}

      {/* ── Corps principal : arène + classement live ── */}
      <div className="tournament-body">

        {/* Arène */}
        <div className="tournament-arena-col">
          {isFighting && fightResult ? (
            <div className="arena-frame">
              <ArenaCanvas
                fighter1={{ name: fightResult.player1.name, icon: fightResult.player1.icon, outcome: showResult ? outcome1 : null }}
                fighter2={{ name: fightResult.player2.name, icon: fightResult.player2.icon, outcome: showResult ? outcome2 : null }}
                showResult={showResult}
                onHit={onHit}
              />
            </div>
          ) : (
            <div className="tournament-arena-idle">
              {tournamentFinished ? (
                <div className="tournament-finished-msg">
                  <span className="tournament-trophy">🏆</span>
                  <p>Le tournoi est terminé.</p>
                  <p className="tournament-champion-hint">Le champion est en tête du classement !</p>
                </div>
              ) : (
                <div className="tournament-preparing">
                  <div className="tournament-preparing-spinner" />
                  <p>Préparation du prochain combat…</p>
                </div>
              )}
            </div>
          )}

          {/* Bannière résultat */}
          {showResult && !kingIntervened && isFighting && fightResult && (
            <div className="fight-result-banner">
              {outcome1 === 'Win'
                ? `🏆 ${fightResult.player1.name} remporte le combat !`
                : outcome2 === 'Win'
                  ? `🏆 ${fightResult.player2.name} remporte le combat !`
                  : '⚔️ Match nul — les deux combattants tombent !'
              }
            </div>
          )}

          {/* Overlay roi */}
          {kingIntervened && (
            <div className="king-overlay">
              <div className="king-overlay-content">
                <span className="king-hand">✋</span>
                <p className="king-message">Le roi a décidé d'arrêter le combat, c'est une égalité</p>
              </div>
            </div>
          )}
        </div>

        {/* Classement live */}
        <div className="tournament-scoreboard-col">
          <h3 className="tournament-scoreboard-title">📊 Classement Live</h3>
          <ul className="tournament-score-list">
            {ranking.map((score, i) => {
              const isCurrentP1 = isFighting && fightResult?.player1.id === score.player.id
              const isCurrentP2 = isFighting && fightResult?.player2.id === score.player.id
              const isActive    = isCurrentP1 || isCurrentP2
              return (
                <li
                  key={score.player.id}
                  className={[
                    'tournament-score-row',
                    score.player.isDisqualified ? 'tournament-score-row--disq' : '',
                    isActive ? 'tournament-score-row--active' : '',
                  ].join(' ').trim()}
                >
                  <span className="tscore-rank">{getRankLabel(i)}</span>
                  <span className="tscore-sprite">
                    <img src={getSpriteUrl(score.player.name)} alt={score.player.name} />
                  </span>
                  <span className="tscore-name">
                    {score.player.name}
                    {score.player.isDisqualified && <span className="tscore-disq"> ❌</span>}
                    {isActive && <span className="tscore-fighting"> ⚔️</span>}
                  </span>
                  <span className="tscore-pts">{score.totalScore} pts</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
