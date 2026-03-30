export default function ResultScreen({ result, wave, onRestart, onHome }) {
  const victory = result === 'victory'
  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: victory ? 'rgba(0,50,0,0.85)' : 'rgba(50,0,0,0.85)',
    }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>{victory ? '🏆' : '💀'}</div>
      <h1 style={{
        fontSize: '56px', fontWeight: 900, letterSpacing: '4px',
        color: victory ? '#4caf50' : '#f44336',
        textShadow: `0 0 30px ${victory ? '#4caf50' : '#f44336'}`,
      }}>
        {victory ? 'VITÓRIA!' : 'DERROTA!'}
      </h1>
      <p style={{ color: '#90a4ae', marginTop: '12px', fontSize: '16px' }}>
        {victory ? `Sobreviveu a todas as ${wave} ondas!` : `Base destruída na onda ${wave}`}
      </p>
      <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
        <button onClick={onRestart} style={{
          background: '#1565c0', color: '#fff', border: 'none', borderRadius: '10px',
          padding: '12px 28px', fontSize: '16px', fontWeight: 700, cursor: 'pointer',
        }}>
          🔄 Jogar Novamente
        </button>
        <button onClick={onHome} style={{
          background: '#37474f', color: '#fff', border: 'none', borderRadius: '10px',
          padding: '12px 28px', fontSize: '16px', cursor: 'pointer',
        }}>
          🏠 Menu
        </button>
      </div>
    </div>
  )
}
