/**
 * GeoRadarAnimation — reusable pulsing radar SVG + CSS animation
 *
 * Props:
 *   status: 'idle' | 'scanning' | 'inRange' | 'outOfRange' | 'active'
 *   size: number (default 160)
 */

const STATUS_CONFIG = {
  idle: {
    ringColor:   'var(--surface-container-high)',
    pinColor:    'var(--outline)',
    pulseOpacity: 0,
    label:       'No Active Session',
  },
  scanning: {
    ringColor:   'var(--tertiary-fixed-dim)',
    pinColor:    'var(--tertiary)',
    pulseOpacity: 1,
    label:       'Scanning Location…',
  },
  inRange: {
    ringColor:   'var(--primary-fixed-dim)',
    pinColor:    'var(--primary)',
    pulseOpacity: 1,
    label:       'You\'re In Range',
  },
  outOfRange: {
    ringColor:   'var(--error-container)',
    pinColor:    'var(--error)',
    pulseOpacity: 0.6,
    label:       'Out of Range',
  },
  active: {
    ringColor:   'var(--primary-fixed)',
    pinColor:    'var(--primary)',
    pulseOpacity: 1,
    label:       'Session Active',
  },
};

export default function GeoRadarAnimation({ status = 'idle', size = 160 }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  const cx = size / 2;
  const isPulsing = cfg.pulseOpacity > 0;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible' }}
      >
        {/* Outer ring */}
        <circle cx={cx} cy={cx} r={cx * 0.88}
          fill="none" stroke={cfg.ringColor} strokeWidth="1.5"
          style={{ transition: 'stroke 0.4s ease' }}
        />
        {/* Middle ring */}
        <circle cx={cx} cy={cx} r={cx * 0.62}
          fill="none" stroke={cfg.ringColor} strokeWidth="1.5"
          style={{ transition: 'stroke 0.4s ease', opacity: 0.7 }}
        />
        {/* Inner ring */}
        <circle cx={cx} cy={cx} r={cx * 0.36}
          fill={cfg.ringColor} stroke="none"
          style={{ transition: 'fill 0.4s ease', opacity: 0.4 }}
        />

        {/* Pulse rings — only shown when active */}
        {isPulsing && (
          <>
            <circle cx={cx} cy={cx} r={cx * 0.36}
              fill="none" stroke={cfg.pinColor} strokeWidth="2"
              style={{ opacity: cfg.pulseOpacity }}
              className="geo-pulse geo-pulse-1"
            />
            <circle cx={cx} cy={cx} r={cx * 0.36}
              fill="none" stroke={cfg.pinColor} strokeWidth="2"
              style={{ opacity: cfg.pulseOpacity }}
              className="geo-pulse geo-pulse-2"
            />
            <circle cx={cx} cy={cx} r={cx * 0.36}
              fill="none" stroke={cfg.pinColor} strokeWidth="2"
              style={{ opacity: cfg.pulseOpacity }}
              className="geo-pulse geo-pulse-3"
            />
          </>
        )}

        {/* Radar sweep — only for scanning */}
        {status === 'scanning' && (
          <line
            x1={cx} y1={cx}
            x2={cx} y2={cx * 0.12}
            stroke={cfg.pinColor}
            strokeWidth="2"
            strokeLinecap="round"
            style={{ transformOrigin: `${cx}px ${cx}px`, opacity: 0.8 }}
            className="geo-sweep"
          />
        )}

        {/* Center pin */}
        <circle cx={cx} cy={cx} r={cx * 0.12}
          fill={cfg.pinColor}
          style={{ transition: 'fill 0.4s ease' }}
        />
        <circle cx={cx} cy={cx} r={cx * 0.055}
          fill="white"
        />
      </svg>
    </div>
  );
}
