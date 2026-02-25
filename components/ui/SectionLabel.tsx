'use client'

import { motion } from 'framer-motion'

export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="font-display text-xs uppercase tracking-widest"
      style={{ color: 'var(--text-dim)' }}
    >
      {children}
    </motion.p>
  )
}
