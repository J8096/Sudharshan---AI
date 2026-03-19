import { Component } from 'react';

const G  = '#C97700';
const GL = '#E8920A';
const GD = '#3D1F00';
const GM = '#7A4F00';

function ChakraIcon({ size = 48 }) {
  const spokes = Array.from({ length: 16 }, (_, i) => {
    const a = (i * 22.5 * Math.PI) / 180;
    return { id: i, x1: 50 + 21 * Math.cos(a), y1: 50 + 21 * Math.sin(a), x2: 50 + 43 * Math.cos(a), y2: 50 + 43 * Math.sin(a) };
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block', opacity: 0.35 }}>
      <circle cx="50" cy="50" r="46" fill="none" stroke={G} strokeWidth="3.5" />
      {spokes.map(s => <line key={s.id} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={G} strokeWidth="2.5" strokeLinecap="round" />)}
      <circle cx="50" cy="50" r="17" fill="#FFFDF5" stroke={G} strokeWidth="2.5" />
      <circle cx="50" cy="50" r="5.5" fill={G} />
    </svg>
  );
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production you'd send this to a logging service (Sentry etc.)
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'linear-gradient(155deg,#fffdf5,#fff8e5,#fef3d0)',
        fontFamily: 'Outfit, sans-serif', padding: 24,
      }}>
        <div style={{
          maxWidth: 420, width: '100%', textAlign: 'center',
          padding: '40px 32px',
          background: 'linear-gradient(145deg,#fffdf5,#fff8e5)',
          border: '1px solid rgba(201,119,0,.22)',
          borderRadius: 24,
          boxShadow: '0 8px 40px rgba(201,119,0,.12)',
        }}>
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
            <ChakraIcon size={56} />
          </div>

          <div style={{
            fontFamily: 'Cinzel, serif', fontSize: 18, fontWeight: 800,
            color: GD, marginBottom: 8, letterSpacing: '0.02em',
          }}>
            Something went wrong
          </div>

          <p style={{ fontSize: 13, color: GM, lineHeight: 1.7, marginBottom: 24 }}>
            An unexpected error occurred. Your session is safe —
            try refreshing the page to continue.
          </p>

          {this.state.error && (
            <div style={{
              background: 'rgba(220,38,38,.06)', border: '1px solid rgba(220,38,38,.18)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 20,
              fontSize: 11, color: '#b91c1c', textAlign: 'left',
              fontFamily: 'monospace', wordBreak: 'break-word',
            }}>
              {this.state.error.message}
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 28px', borderRadius: 12, border: 'none',
              background: `linear-gradient(135deg,${G},${GL})`,
              color: 'white', fontSize: 13.5, fontWeight: 700,
              fontFamily: 'Outfit, sans-serif', cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(201,119,0,.35)',
            }}>
            ↺ Reload Page
          </button>

          <p style={{
            marginTop: 20, fontSize: 9.5, color: 'rgba(122,79,0,.35)',
            fontFamily: 'Cinzel, serif', letterSpacing: '0.1em',
          }}>
            ॐ नमो भगवते वासुदेवाय
          </p>
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@800&family=Outfit:wght@400;700&display=swap');`}</style>
      </div>
    );
  }
}
