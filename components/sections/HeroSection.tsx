'use client'

import dynamic from 'next/dynamic'
import { TypeAnimation } from 'react-type-animation'
import { motion } from 'framer-motion'

const StarParticles = dynamic(() => import('@/components/effects/StarParticles'), {
  ssr: false,
})

export default function HeroSection() {
  return (
    <section
      className="relative flex flex-col items-center justify-center"
      style={{ minHeight: '78vh', paddingBottom: '8rem' }}
    >
      {/* 파티클 — overflow-hidden 으로 클립 */}
      <div className="absolute inset-0 overflow-hidden">
        <StarParticles />
      </div>

      {/* 하단 페이드 — 콘텐츠로 자연스럽게 용해 */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
        style={{
          height: '30%',
          background: 'linear-gradient(to bottom, transparent 0%, #060a14 100%)',
        }}
      />

      {/* 콘텐츠 */}
      <div className="relative z-20 text-center px-6">
        <motion.h1
          initial={{ y: 28, opacity: 0, filter: 'blur(6px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-bold mb-5 hero-glow hero-title-gradient"
          style={{
            fontSize: 'clamp(3.5rem, 10vw, 7rem)',
            letterSpacing: '0.04em',
          }}
        >
          Horizon
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="text-base sm:text-lg font-body min-h-[1.75rem]"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.02em' }}
        >
          <TypeAnimation
            sequence={[
              1200,
              'AI trends rise and set on the Horizon',
              3000,
              "What's rising today 🌅",
              2000,
              "What's fading tonight 🌙",
              2000,
              'AI trends rise and set on the Horizon',
              6000,
            ]}
            speed={55}
            repeat={Infinity}
          />
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.6 }}
          className="mt-12"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}
          >
            ↓
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
