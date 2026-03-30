export default function HomeScreen({ onStart }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', gap: '32px',
      background: 'linear-gradient(135deg, #0f1923 0%, #1a2a3a 100%)',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '64px', fontWeight: 900, letterSpacing: '4px',
          color: '#fff', textShadow: '0 0 40px #4fc3f7, 0 4px 0 #0d47a1',
        }}>
          ⚔️ BLOCK<span style={{ color: '#4fc3f7' }}>ROYALE</span>
        </h1>
        <p style={{ color: '#78909c', fontSize: '16px', marginTop: '8px', letterSpacing: '2px' }}>
          CONSTRUA · DEFENDA · CONQUISTE
        </p>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '280px' }}>
        <button onClick={() => onStart('vs_machine')} style={btnStyle('#2e7d32', '#43a047')}>
          🤖 vs Máquina
          <span style={{ fontSize: '12px', display: 'block', opacity: 0.8 }}>Tower Defense — sobreviva às ondas</span>
        </button>
        <button onClick={() => onStart('1v1')} style={btnStyle('#1565c0', '#1976d2')}>
          ⚔️ 1v1 Online
          <span style={{ fontSize: '12px', display: 'block', opacity: 0.8 }}>Destrua o castelo inimigo</span>
        </button>
      </div>

      <p style={{ color: '#37474f', fontSize: '12px' }}>v0.1.0 — MVP</p>
    </div>
  )
}

function btnStyle(bg, hover) {
  return {
    background: bg, color: '#fff', border: 'none', borderRadius: '12px',
    padding: '16px 24px', fontSize: '18px', fontWeight: 700, cursor: 'pointer',
    transition: 'transform 0.1s, filter 0.1s', textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
    lineHeight: 1.4,
  }
}
