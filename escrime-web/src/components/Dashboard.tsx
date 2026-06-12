import type { Player, PlayerScore } from '../types'
import { getSpriteUrl } from '../utils/sprites'

interface DashboardProps {
  champion: Player | null
  ranking: PlayerScore[]
  onRefresh: () => void
}

export function Dashboard({ champion, ranking, onRefresh }: DashboardProps) {
  const getRankClass = (index: number) => {
    if (index === 0) return 'player-rank top-1'
    if (index === 1) return 'player-rank top-2'
    if (index === 2) return 'player-rank top-3'
    return 'player-rank'
  }

  const getRankLabel = (index: number) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `${index + 1}.`
  }

  return (
    <div className="dashboard">
      <div className="card champion-card">
        <h2 className="card-title">🏆 Champion Actuel</h2>
        {champion ? (
          <>
            <div className="champion-icon ui-sprite-container">
              <img src={getSpriteUrl(champion.name)} alt={champion.name} className="ui-sprite" />
            </div>
            <div className="champion-name">{champion.name}</div>
            <p className="champion-class">{champion.characterClass}</p>
          </>
        ) : (
          <p className="no-champion">Aucun champion pour le moment.</p>
        )}
        <button id="refresh-btn" className="btn-ghost" onClick={onRefresh}>
          ↻ Actualiser
        </button>
      </div>

      <div className="card">
        <h2 className="card-title">Classement du Tournoi</h2>
        {ranking.length > 0 ? (
          <ul className="player-list">
            {ranking.map((score, index) => (
              <li
                key={score.player.id}
                className={`player-item${score.player.isDisqualified ? ' player-disqualified' : ''}`}
              >
                <span className={getRankClass(index)}>{getRankLabel(index)}</span>
                <span className="player-icon ui-sprite-container">
                  <img src={getSpriteUrl(score.player.name)} alt={score.player.name} className="ui-sprite" />
                </span>
                <div className="player-info">
                  <div className="player-name">
                    {score.player.name}
                    {score.player.isDisqualified && ' ❌'}
                  </div>
                  <div className="player-class">{score.player.characterClass}</div>
                </div>
                <span className="player-score">{score.totalScore} pts</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-list">
            L'arène est vide — cliquez sur "Réinitialiser les joueurs par défaut".
          </p>
        )}
      </div>
    </div>
  )
}
