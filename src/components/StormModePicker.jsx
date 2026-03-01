// Automatic rotation toggle functionality added near storm modes

export const STORM_MODES = [
  { key: 'live', label: '🛰 Live', description: 'Real-time NOAA data' },
  { key: 'substorm', label: '⚡ G1–G2', description: 'Substorm simulation' },
  { key: 'storm', label: '🌌 G4–G5', description: 'Severe storm simulation' },
];

export default function StormModePicker({ stormMode, onChange }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '2rem',
        right: '2rem',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        alignItems: 'flex-end',
      }}>
      <span
        style={{
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'rgba(255,255,255,0.4)',
          marginBottom: '0.25rem',
        }}>
        Aurora Mode
      </span>

      {STORM_MODES.map(({ key, label, description }) => {
        const active = stormMode === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            title={description}
            style={{
              background: active
                ? 'rgba(100, 220, 180, 0.15)'
                : 'rgba(255,255,255,0.05)',
              border: active
                ? '1px solid rgba(100, 220, 180, 0.5)'
                : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: active
                ? 'rgba(140, 255, 210, 1)'
                : 'rgba(255,255,255,0.6)',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              fontWeight: active ? 600 : 400,
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              transition: 'all 0.2s ease',
              minWidth: '120px',
              textAlign: 'right',
            }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}
