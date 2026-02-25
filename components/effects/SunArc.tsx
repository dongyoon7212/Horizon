export default function SunArc() {
  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl pointer-events-none z-10">
      <svg
        viewBox="0 0 800 400"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full sun-arc-glow"
        aria-hidden="true"
      >
        <defs>
          {/* 태양 본체 그라데이션 */}
          <radialGradient id="sunGlow" cx="50%" cy="100%" r="60%">
            <stop offset="0%"   stopColor="#ffb347" stopOpacity="0.9" />
            <stop offset="30%"  stopColor="#ff6b35" stopOpacity="0.6" />
            <stop offset="70%"  stopColor="#ff6b35" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ff6b35" stopOpacity="0" />
          </radialGradient>

          {/* 아크 스트로크 그라데이션 */}
          <linearGradient id="arcStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#9b59b6" stopOpacity="0.3" />
            <stop offset="30%"  stopColor="#ff6b35" stopOpacity="0.8" />
            <stop offset="50%"  stopColor="#ffb347" stopOpacity="1" />
            <stop offset="70%"  stopColor="#ff6b35" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#9b59b6" stopOpacity="0.3" />
          </linearGradient>

          {/* 내부 글로우 필터 */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 배경 광원 */}
        <ellipse
          cx="400"
          cy="400"
          rx="380"
          ry="200"
          fill="url(#sunGlow)"
        />

        {/* 태양 아크 (반원) */}
        <path
          d="M 60 400 A 340 340 0 0 1 740 400"
          fill="none"
          stroke="url(#arcStroke)"
          strokeWidth="2"
          filter="url(#glow)"
        />

        {/* 내부 광선들 */}
        {[30, 60, 90, 120, 150].map((angle, i) => {
          const rad = (angle * Math.PI) / 180
          const cx = 400
          const cy = 400
          const r1 = 300
          const r2 = 340
          const x1 = cx + r1 * Math.cos(Math.PI - rad)
          const y1 = cy - r1 * Math.sin(rad)
          const x2 = cx + r2 * Math.cos(Math.PI - rad)
          const y2 = cy - r2 * Math.sin(rad)
          return (
            <line
              key={i}
              x1={x1} y1={y1}
              x2={x2} y2={y2}
              stroke="#ffb347"
              strokeWidth="1"
              strokeOpacity="0.4"
              filter="url(#glow)"
            />
          )
        })}

        {/* 중심 태양 원형 */}
        <circle
          cx="400"
          cy="400"
          r="18"
          fill="#ffb347"
          fillOpacity="0.9"
          filter="url(#glow)"
        />
        <circle
          cx="400"
          cy="400"
          r="10"
          fill="#fff"
          fillOpacity="0.8"
        />
      </svg>
    </div>
  )
}
