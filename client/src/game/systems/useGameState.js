import { useState, useCallback } from 'react'
import { GAME_CONFIG } from '../constants'

const INITIAL_STATE = {
  phase: 'prep',       // 'prep' | 'battle' | 'result'
  resources: { wood: 0, stone: 0, iron: 0 },
  structures: [],      // { id, type, tileX, tileZ }
  deck: [],            // up to 4 troop ids
  elixir: 5,
  baseHp: GAME_CONFIG.BASE_HP,
  wave: 0,
  result: null,        // 'victory' | 'defeat'
  selectedStructure: null,   // structure type being placed
  selectedTroop: null,       // troop id being placed
}

export default function useGameState() {
  const [state, setState] = useState(INITIAL_STATE)

  const collectResource = useCallback((type) => {
    setState(s => ({
      ...s,
      resources: { ...s.resources, [type]: s.resources[type] + 1 }
    }))
  }, [])

  const placeStructure = useCallback((type, tileX, tileZ, cost) => {
    setState(s => {
      // Check cost
      for (const [res, qty] of Object.entries(cost)) {
        if (s.resources[res] < qty) return s
      }
      const newResources = { ...s.resources }
      for (const [res, qty] of Object.entries(cost)) {
        newResources[res] -= qty
      }
      return {
        ...s,
        resources: newResources,
        structures: [...s.structures, { id: Date.now(), type, tileX, tileZ, hp: null }],
        selectedStructure: null,
      }
    })
  }, [])

  const selectStructure = useCallback((type) => {
    setState(s => ({ ...s, selectedStructure: type, selectedTroop: null }))
  }, [])

  const toggleTroop = useCallback((troopId) => {
    setState(s => {
      const inDeck = s.deck.includes(troopId)
      if (inDeck) return { ...s, deck: s.deck.filter(t => t !== troopId) }
      if (s.deck.length >= 4) return s
      return { ...s, deck: [...s.deck, troopId] }
    })
  }, [])

  const startBattle = useCallback(() => {
    setState(s => ({ ...s, phase: 'battle', wave: 1 }))
  }, [])

  const damageBase = useCallback((dmg) => {
    setState(s => {
      const hp = Math.max(0, s.baseHp - dmg)
      return { ...s, baseHp: hp, result: hp === 0 ? 'defeat' : s.result, phase: hp === 0 ? 'result' : s.phase }
    })
  }, [])

  const nextWave = useCallback((waveNum, totalWaves) => {
    setState(s => {
      if (waveNum > totalWaves) return { ...s, phase: 'result', result: 'victory' }
      return { ...s, wave: waveNum }
    })
  }, [])

  const reset = useCallback(() => setState(INITIAL_STATE), [])

  return { state, collectResource, placeStructure, selectStructure, toggleTroop, startBattle, damageBase, nextWave, reset }
}
