'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HorizonCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  variant?: 'rising' | 'setting' | 'neutral'
  delay?: number
  onClick?: () => void
}

export default function HorizonCard({
  children,
  className,
  style,
  variant = 'neutral',
  delay = 0,
  onClick,
}: HorizonCardProps) {
  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'horizon-card p-5',
        variant === 'setting' && 'setting',
        onClick && 'cursor-pointer',
        className
      )}
      style={style}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
