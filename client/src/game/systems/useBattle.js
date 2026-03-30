import { useEffect, useRef, useState } from 'react'
import BattleEngine from './BattleEngine'
import { GAME_CONFIG } from '../constants'

export default function useBattle({ structures, deck, onDefeat, onVictory }) {
  const engineRef = useRef(null)
  const [battleState, setBattleState] = useState({
    enemies: [], troops: [], structures: [],
    elixir: 5, wave: 1, baseHp: GAME_CONFIG.BASE_HP,
  })
  const [waveMsg, setWaveMsg] = useState(null)

  useEffect(() => {
    const engine = new BattleEngine({
      structures,
      deck,
      onStateUpdate: (s) => setBattleState({ ...s }),
      onBaseDamage: () => {},
      onWaveComplete: (waveNum, total) => {
        if (waveNum < total) {
          setWaveMsg(`Onda ${waveNum} completa! Próxima em ${GAME_CONFIG.WAVE_INTERVAL}s...`)
          setTimeout(() => setWaveMsg(null), 4000)
        }
      },
      onVictory,
      onDefeat,
    })
    engineRef.current = engine
    engine.start()
    return () => engine.stop()
  }, [])

  function spawnTroop(troopId, tileX, tileZ) {
    return engineRef.current?.spawnTroop(troopId, tileX, tileZ) ?? false
  }

  return { battleState, spawnTroop, waveMsg }
}
