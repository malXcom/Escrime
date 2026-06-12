import { getSpriteUrl } from '../utils/sprites'

export function HpBar({ name, hp, reversed }: {
  name: string; hp: number; reversed?: boolean
}) {
  const pct = Math.max(0, hp)
  const color = pct > 60 ? '#5cb85c' : pct > 30 ? '#e6a817' : '#c0392b'

  return (
    <div className={`hp-bar-container ${reversed ? 'hp-bar-container--reversed' : ''}`}>
      <div className="hp-bar-header">
        <div className="hp-bar-avatar">
          <div className="ui-sprite-container">
            <img src={getSpriteUrl(name)} alt={name} className="ui-sprite" />
          </div>
          <span className="hp-bar-name">{name}</span>
        </div>
        <span className="hp-bar-value">{pct}</span>
      </div>
      <div className="hp-bar-track">
        <div
          className="hp-bar-fill"
          style={{
            width: `${pct}%`,
            background: color,
          }}
        />
      </div>
    </div>
  )
}
