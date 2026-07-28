import { getTimeUntilExpiry } from '../../utils/formatters';

/**
 * Signature element: a circular "freshness ring" that visually communicates
 * how much time remains before a donation expires — like a countdown timer
 * on a kitchen dish, reinforcing the urgency at the heart of food rescue.
 */
export default function FreshnessRing({ expiresAt, size = 56, strokeWidth = 4 }) {
  const { text, percent, urgent } = getTimeUntilExpiry(expiresAt);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="freshness-ring-track"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`freshness-ring-progress ${urgent ? 'urgent' : ''}`}
        />
      </svg>
      {urgent && (
        <span className="absolute w-2 h-2 rounded-full bg-tomato-500 animate-pulse-slow" />
      )}
      <span className="sr-only">{text}</span>
    </div>
  );
}
