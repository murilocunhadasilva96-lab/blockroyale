import { useEffect, useState } from 'react'
import { GAME_CONFIG } from '../game/constants'

const STRUCTURES_DEF = [
  { type: 'archer_tower', label: 'Torre Arqueiro', icon: '🏹', cost: { wood: 2 }, color: '#8d6e63' },
  { type: 'cannon',       label: 'Canhão de Pedra', icon: '💣', cost: { stone: 3 }, color: '#616161' },
  { type: 'trap',         label: 'Armadilha', icon: '⚡', cost: { iron: 2 }, color: '#b0bec5' },
  { type: 'wall',         label: 'Muro', icon: '🧱', cost: { stone: 1 }, color: '#78909c' },
]

const TROOPS_DEF = [
  { id: 'palito',            label: 'Palito',                 icon: '🦴', cost: 2 },
  { id: 'gigantinho',        label: 'Gigantinho',             icon: '💪', cost: 5 },
  { id: 'mira_torta',        label: 'Mira Torta',             icon: '🏹', cost: 3 },
  { id: 'bombinha',          label: 'Bombinha',               icon: '💥', cost: 4 },
  { id: 'cavaleiro_papelao', label: 'Cavaleiro de Papelão',  icon: '🛡️', cost: 3 },
  { id: 'porquinho',         label: 'Porquinho de Bicicleta', icon: '🐷', cost: 4 },
  { id: 'lagartixa',         label: 'Lagartixa',              icon: '🦎', cost: 4 },
  { id: 'fofoca',            label: 'FOFOCA',                 icon: '👁️', cost: 7 },
]

function canAfford(cost, resources) {
  return Object.entries(cost).every(([r, q]) => resources[r] >= q)
}

export default function PrepHUD({ resources, deck, selectedStructure, onSelectStructure, onToggleTroop, onReady }) {
  const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.PREP_DURATION)

  useEffect(() => {
    if (timeLeft <= 0) { onReady(); return }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft])

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 20px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
        pointerEvents: 'auto',
      }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Resource icon="🪵" label="Madeira" value={resources.wood} />
          <Resource icon="🪨" label="Pedra"   value={resources.stone} />
          <Resource icon="⚙️" label="Ferro"   value={resources.iron} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: timeLeft <= 10 ? '#f44336' : '#ffeb3b', fontSize: '28px', fontWeight: 900 }}>
            {String(Math.floor(timeLeft / 60)).padStart(2,'0')}:{String(timeLeft % 60).padStart(2,'0')}
          </div>
          <div style={{ color: '#78909c', fontSize: '11px' }}>PREPARAÇÃO</div>
        </div>
        <button
          onClick={onReady}
          style={{
            background: deck.length === 4 ? '#2e7d32' : '#37474f',
            color: '#fff', border: 'none', borderRadius: '8px',
            padding: '10px 20px', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
            pointerEvents: 'auto',
          }}
        >
          {deck.length === 4 ? '✅ PRONTO!' : `Deck: ${deck.length}/4`}
        </button>
      </div>

      {/* Hint */}
      {selectedStructure && (
        <div style={{
          alignSelf: 'center', marginTop: '8px',
          background: 'rgba(0,0,0,0.7)', borderRadius: '8px', padding: '6px 16px',
          color: '#ffeb3b', fontSize: '13px', pointerEvents: 'none',
        }}>
          Clique em um tile adjacente ao caminho para colocar
        </div>
      )}

      {/* Bottom panels */}
      <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', padding: '12px', pointerEvents: 'auto' }}>

        {/* Structures */}
        <div style={{
          background: 'rgba(0,0,0,0.75)', borderRadius: '12px',
          padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px', flex: '0 0 auto',
        }}>
          <div style={{ color: '#78909c', fontSize: '11px', letterSpacing: '1px' }}>DEFESAS</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {STRUCTURES_DEF.map(s => {
              const affordable = canAfford(s.cost, resources)
              const selected = selectedStructure === s.type
              return (
                <button key={s.type} onClick={() => onSelectStructure(selected ? null : s.type)} style={{
                  background: selected ? s.color : (affordable ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.3)'),
                  border: selected ? '2px solid #ffeb3b' : '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px', padding: '8px', cursor: affordable ? 'pointer' : 'not-allowed',
                  opacity: affordable ? 1 : 0.5, color: '#fff', minWidth: '64px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '22px' }}>{s.icon}</div>
                  <div style={{ fontSize: '10px', marginTop: '2px' }}>{s.label}</div>
                  <div style={{ fontSize: '10px', color: '#aaa' }}>{Object.entries(s.cost).map(([r,q]) => `${q}${r[0].toUpperCase()}`).join(' ')}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Deck selector */}
        <div style={{
          background: 'rgba(0,0,0,0.75)', borderRadius: '12px',
          padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px',
        }}>
          <div style={{ color: '#78909c', fontSize: '11px', letterSpacing: '1px' }}>
            DECK DE TROPAS — escolha 4
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {TROOPS_DEF.map(t => {
              const inDeck = deck.includes(t.id)
              const disabled = !inDeck && deck.length >= 4
              return (
                <button key={t.id} onClick={() => !disabled && onToggleTroop(t.id)} style={{
                  background: inDeck ? '#1565c0' : 'rgba(255,255,255,0.08)',
                  border: inDeck ? '2px solid #42a5f5' : '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px', padding: '6px 8px', cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.4 : 1, color: '#fff', minWidth: '60px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '18px' }}>{t.icon}</div>
                  <div style={{ fontSize: '9px', marginTop: '2px' }}>{t.label}</div>
                  <div style={{ fontSize: '10px', color: '#a78bfa' }}>💜{t.cost}</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function Resource({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', padding: '6px 12px' }}>
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <div>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '16px', lineHeight: 1 }}>{value}</div>
        <div style={{ color: '#78909c', fontSize: '10px' }}>{label}</div>
      </div>
    </div>
  )
}
