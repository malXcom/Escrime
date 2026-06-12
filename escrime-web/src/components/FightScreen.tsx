import { HpBar } from './HpBar'
import { ArenaCanvas } from '../ArenaCanvas'

interface FightScreenProps {
  fightResult: any
  showResult: boolean
  hp1: number
  hp2: number
  outcome1: string | null
  outcome2: string | null
  kingIntervened: boolean
  onHit: (preyIsF1: boolean) => void
  tournamentInfo?: { current: number; total: number }
}

export function FightScreen({
  fightResult, showResult, hp1, hp2, outcome1, outcome2, kingIntervened, onHit, tournamentInfo
}: FightScreenProps) {
  if (!fightResult) return null

  return (
    <div className="fight-fullscreen">
      {/* HUD : barres de vie */}
      <div className="fight-hud">
        <HpBar
          name={fightResult.player1.name}
          hp={hp1}
        />
        <div className="fight-hud-center">
          {tournamentInfo && (
            <span className="tournament-progress">
              🏟️ {tournamentInfo.current + 1}<span className="tournament-total">/{tournamentInfo.total}</span>
            </span>
          )}
          {showResult
            ? <span className="fight-result-badge">⚔️ FIN</span>
            : <span className="fight-vs-badge">VS</span>
          }
        </div>
        <HpBar
          name={fightResult.player2.name}
          hp={hp2}
          reversed
        />
      </div>

      {/* Arène avec cadre parchemin (dessiné sur canvas) */}
      <div className="arena-frame">
        <ArenaCanvas
          fighter1={{ name: fightResult.player1.name, icon: fightResult.player1.icon, outcome: showResult ? outcome1 : null }}
          fighter2={{ name: fightResult.player2.name, icon: fightResult.player2.icon, outcome: showResult ? outcome2 : null }}
          showResult={showResult}
          onHit={onHit}
        />
      </div>

      {/* Overlay roi — centré sur l'arène */}
      {kingIntervened && (
        <div className="king-overlay">
          <div className="king-overlay-content">
            <span className="king-hand">✋</span>
            <p className="king-message">Le roi a décidé d'arrêter le combat, c'est une égalité</p>
          </div>
        </div>
      )}

      {/* Bannière résultat normale (hors intervention roi) */}
      {showResult && !kingIntervened && (
        <div className="fight-result-banner">
          {outcome1 === 'Win'
            ? `🏆 ${fightResult.player1.name} remporte le combat !`
            : outcome2 === 'Win'
              ? `🏆 ${fightResult.player2.name} remporte le combat !`
              : '⚔️ Match nul — les deux combattants tombent !'
          }
        </div>
      )}
    </div>
  )
}
