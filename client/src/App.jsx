import { useState } from 'react'
import HomeScreen from './components/HomeScreen'
import GameScreen from './components/GameScreen'
import './App.css'

export default function App() {
  const [screen, setScreen] = useState('home') // 'home' | 'game'
  const [gameMode, setGameMode] = useState(null) // 'vs_machine' | '1v1'

  function startGame(mode) {
    setGameMode(mode)
    setScreen('game')
  }

  function goHome() {
    setScreen('home')
    setGameMode(null)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#0f1923' }}>
      {screen === 'home' && <HomeScreen onStart={startGame} />}
      {screen === 'game' && <GameScreen mode={gameMode} onHome={goHome} />}
    </div>
  )
}
