export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg-primary)', color: 'var(--text-body)', padding: '2rem', textAlign: 'center' }}>
      <div>
        <p style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', textTransform: 'lowercase', marginBottom: '0.75rem' }}>404</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 8vw, 4rem)', marginBottom: '1rem' }}>S.A.S.H.A</h1>
        <a href="/" style={{ color: 'var(--accent)' }}>На главную →</a>
      </div>
    </main>
  )
}
