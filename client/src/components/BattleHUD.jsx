import { GAME_CONFIG } from '../game/constants'

const TROOPS_DEF = [
  { id: 'palito',            icon: '🦴', cost: 2 },
  { id: 'gigantinho',        icon: '💪', cost: 5 },
  { id: 'mira_torta',        icon: '🏹', cost: 3 },
  { id: 'bombinha',          icon: '💥', cost: 4 },
  { id: 'cavaleiro_papelao', icon: '🛡️', cost: 3 },
  { id: 'porquinho',         icon: '🐷', cost: 4 },
  { id: 'lagartixa',         icon: '🦎', cost: 4 },
  { id: 'fofoca',            icon: '👁️', cost: 7 },
]

export default function BattleHUD({ elixir, baseHp, wave, waveMsg, deck, selectedTroop, onSelectTroop }) {
  const hpPct = (baseHp / GAME_CONFIG.BASE_HP) * 100
  const elixirPct = (elixir / GAME_CONFIG.ELIXIR_MAX) * 100
  const deckTroops = TROOPS_DEF.filter(t => deck.includes(t.id))

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>

      {/* Top bar — HP + wave */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
        padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '16px',
      }}>
        {/* Base HP */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>🏰 Base</span>
            <span style={{ color: hpPct > 50 ? '#4caf50' : hpPct > 25 ? '#ff9800' : '#f44336', fontSize: '12px', fontWeight: 700 }}>
              {baseHp}/{GAME_CONFIG.BASE_HP}
            </span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '4px',
              background: hpPct > 50 ? '#4caf50' : hpPct > 25 ? '#ff9800' : '#f44336',
              width: `${hpPct}%`, transition: 'width 0.3s',
            }} />
          </div>
        </div>

        {/* Wave indicator */}
        <div style={{ textAlign: 'center', minWidth: '80px' }}>
          <div style={{ color: '#ffeb3b', fontWeight: 900, fontSize: '20px' }}>Onda {wave}</div>
          <div style={{ color: '#78909c', fontSize: '11px' }}>de {GAME_CONFIG.WAVE_COUNT}</div>
        </div>
      </div>

      {/* Wave message */}
      {waveMsg && (
        <div style={{
          position: 'absolute', top: '70px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)', borderRadius: '8px', padding: '8px 20px',
          color: '#4caf50', fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap',
        }}>
          {waveMsg}
        </div>
      )}

      {/* Hint */}
      {selectedTroop && (
        <div style={{
          position: 'absolute', top: '70px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)', borderRadius: '8px', padding: '6px 16px',
          color: '#ffeb3b', fontSize: '13px', whiteSpace: 'nowrap',
        }}>
          Clique no mapa para invocar a tropa
        </div>
      )}

      {/* Bottom — Elixir + Deck */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
        padding: '12px 16px', pointerEvents: 'auto',
      }}>
        {/* Elixir bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <span style={{ fontSize: '18px' }}>💜</span>
          <div style={{ flex: 1, height: '10px', background: 'rgba(255,255,255,0.15)', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '5px',
              background: 'linear-gradient(to right, #7b1fa2, #e040fb)',
              width: `${elixirPct}%`, transition: 'width 0.2s',
            }} />
          </div>
          <span style={{ color: '#e040fb', fontWeight: 900, fontSize: '18px', minWidth: '28px' }}>{Math.floor(elixir)}</span>
        </div>

        {/* Deck cards */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {deckTroops.map(t => {
            const canAfford = elixir >= t.cost
            const isSelected = selectedTroop === t.id
            return (
              <button key={t.id} onClick={() => onSelectTroop(isSelected ? null : t.id)} style={{
                background: isSelected ? '#7b1fa2' : canAfford ? 'rgba(123,31,162,0.4)' : 'rgba(0,0,0,0.5)',
                border: isSelected ? '2px solid #e040fb' : '1px solid rgba(224,64,251,0.3)',
                borderRadius: '10px', padding: '8px 12px', cursor: canAfford ? 'pointer' : 'not-allowed',
                opacity: canAfford ? 1 : 0.4, color: '#fff', minWidth: '64px', textAlign: 'center',
                transition: 'transform 0.1s',
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
              }}>
                <div style={{ fontSize: '24px' }}>{t.icon}</div>
                <div style={{ fontSize: '11px', color: '#e040fb', fontWeight: 700 }}>💜{t.cost}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
