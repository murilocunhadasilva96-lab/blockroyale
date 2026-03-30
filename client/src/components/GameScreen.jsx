import { useMemo, useState, useRef } from 'react'
import IsoScene, { isOnPath, isNearPath } from '../game/scene/IsoScene'
import BattleScene from '../game/scene/BattleScene'
import PrepHUD from './PrepHUD'
import BattleHUD from './BattleHUD'
import ResultScreen from './ResultScreen'
import useGameState from '../game/systems/useGameState'
import useBattle from '../game/systems/useBattle'

const STRUCTURES_COST = {
  archer_tower: { wood: 2 },
  cannon:       { stone: 3 },
  trap:         { iron: 2 },
  wall:         { stone: 1 },
}

function generateResources(isOnPath, isNearPath) {
  const types = ['wood','wood','wood','wood','stone','stone','stone','stone','iron','iron','iron','iron']
  const nodes = [], used = new Set()
  let i = 0
  while (nodes.length < types.length && i < 500) {
    i++
    const x = 1 + Math.floor(Math.random() * 18)
    const z = 1 + Math.floor(Math.random() * 18)
    const key = `${x},${z}`
    if (!isOnPath(x,z) && !isNearPath(x,z) && !used.has(key)) {
      used.add(key)
      nodes.push({ id: key, type: types[nodes.length], x, z })
    }
  }
  return nodes
}

function BattleWrapper({ mode, structures, deck, onHome, onRestart }) {
  const [selectedTroop, setSelectedTroop] = useState(null)
  const [result, setResult] = useState(null)
  const [finalWave, setFinalWave] = useState(1)

  const { battleState, spawnTroop, waveMsg } = useBattle({
    structures, deck,
    onDefeat: () => { setResult('defeat'); setFinalWave(battleState.wave) },
    onVictory: () => { setResult('victory'); setFinalWave(3) },
  })

  function handleTileClick(data) {
    if (!selectedTroop || result) return
    if (!data.onPath && !data.nearPath) return
    spawnTroop(selectedTroop, data.tileX, data.tileZ)
    setSelectedTroop(null)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <BattleScene battleState={battleState} structures={structures} onTileClick={handleTileClick} />
      {!result && (
        <BattleHUD
          elixir={battleState.elixir}
          baseHp={battleState.baseHp}
          wave={battleState.wave}
          waveMsg={waveMsg}
          deck={deck}
          selectedTroop={selectedTroop}
          onSelectTroop={setSelectedTroop}
        />
      )}
      {result && <ResultScreen result={result} wave={finalWave} onRestart={onRestart} onHome={onHome} />}
      <button onClick={onHome} style={{
        position: 'absolute', bottom: '16px', left: '16px', zIndex: 20,
        background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid #455a64',
        borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', fontSize: '12px',
      }}>← Menu</button>
    </div>
  )
}

export default function GameScreen({ mode, onHome }) {
  const { state, collectResource, placeStructure, selectStructure, toggleTroop, startBattle, reset } = useGameState()
  const allResources = useMemo(() => generateResources(isOnPath, isNearPath), [])
  const collectedIdsRef = useRef(new Set())
  const [key, setKey] = useState(0)

  const liveResources = allResources.filter(r => !collectedIdsRef.current.has(r.id))

  function handlePrepTileClick(data) {
    if (state.phase !== 'prep') return
    if (data.isResource) {
      if (!collectedIdsRef.current.has(data.resourceId)) {
        collectedIdsRef.current.add(data.resourceId)
        collectResource(data.resourceType)
      }
      return
    }
    if (state.selectedStructure) {
      const { tileX, tileZ, onPath, nearPath } = data
      const occupied = state.structures.some(s => s.tileX === tileX && s.tileZ === tileZ)
      if (!onPath && nearPath && !occupied) {
        placeStructure(state.selectedStructure, tileX, tileZ, STRUCTURES_COST[state.selectedStructure])
      }
    }
  }

  function handleRestart() {
    collectedIdsRef.current = new Set()
    reset()
    setKey(k => k + 1)
  }

  if (state.phase === 'battle' || state.phase === 'result') {
    return (
      <BattleWrapper
        key={key}
        mode={mode}
        structures={state.structures}
        deck={state.deck}
        onHome={onHome}
        onRestart={handleRestart}
      />
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <IsoScene
        onTileClick={handlePrepTileClick}
        structures={state.structures}
        resources={liveResources}
      />
      <PrepHUD
        resources={state.resources}
        deck={state.deck}
        selectedStructure={state.selectedStructure}
        onSelectStructure={selectStructure}
        onToggleTroop={toggleTroop}
        onReady={startBattle}
      />
      {/* Top label */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none',
        display: 'flex', justifyContent: 'space-between', padding: '8px 16px',
      }}>
        <span style={{ color: '#fff', fontWeight: 700 }}>⚔️ BlockRoyale</span>
        <span style={{
          background: mode === 'vs_machine' ? '#2e7d32' : '#1565c0',
          color: '#fff', padding: '3px 10px', borderRadius: '20px', fontSize: '12px',
        }}>
          {mode === 'vs_machine' ? '🤖 vs Máquina' : '⚔️ 1v1'}
        </span>
      </div>
      <button onClick={onHome} style={{
        position: 'absolute', bottom: '16px', left: '16px', zIndex: 10,
        background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid #455a64',
        borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', fontSize: '12px',
      }}>← Menu</button>
    </div>
  )
}
