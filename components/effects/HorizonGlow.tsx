export default function HorizonGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* 지평선 오렌지 광원 */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: '15%',
          width: '60%',
          height: '200px',
          background: 'radial-gradient(ellipse at center bottom, rgba(255,107,53,0.25) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />

      {/* 좌측 보라 달빛 */}
      <div
        className="absolute"
        style={{
          top: '20%',
          left: '-10%',
          width: '40%',
          height: '300px',
          background: 'radial-gradient(ellipse, rgba(155,89,182,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* 우측 골드 빛 */}
      <div
        className="absolute"
        style={{
          top: '30%',
          right: '-5%',
          width: '30%',
          height: '200px',
          background: 'radial-gradient(ellipse, rgba(255,179,71,0.06) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />
    </div>
  )
}
