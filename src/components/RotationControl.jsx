// Component to control the automatic rotation of the Earth

export default function RotationControl({ autoRotate, onToggle }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '2rem',
        left: '2rem',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        alignItems: 'flex-start',
      }}>
      <span
        style={{
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'rgba(255,255,255,0.4)',
          marginBottom: '0.25rem',
        }}>
        World
      </span>
      <button
        onClick={onToggle}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
          color: 'rgba(255,255,255,0.8)',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.85rem',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          transition: 'all 0.2s ease',
          minWidth: '120px',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '0.5rem',
        }}>
        <span>{autoRotate ? '⏸ Pause' : '▶️ Play'}</span>
        <span
          style={{
            fontSize: '0.7rem',
            opacity: 0.5,
            textTransform: 'uppercase',
          }}>
          Rotation
        </span>
      </button>
    </div>
  );
}
