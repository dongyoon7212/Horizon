import { cn } from '@/lib/utils'

interface SkeletonCardProps {
  className?: string
  lines?: number
}

export default function SkeletonCard({ className, lines = 3 }: SkeletonCardProps) {
  return (
    <div className={cn('horizon-card p-5 space-y-3', className)}>
      {/* 헤더 라인 */}
      <div className="skeleton-horizon h-5 w-2/3" />
      {/* 콘텐츠 라인들 */}
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton-horizon h-4"
          style={{ width: `${90 - i * 15}%` }}
        />
      ))}
      {/* 푸터 배지 */}
      <div className="skeleton-horizon h-6 w-20 rounded-full" />
    </div>
  )
}
