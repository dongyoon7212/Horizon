'use client'

import { useEffect, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import type { ISourceOptions } from '@tsparticles/engine'

const options: ISourceOptions = {
  fullScreen: { enable: false },
  background: { color: { value: 'transparent' } },
  fpsLimit: 60,
  particles: {
    number: { value: 120 },
    color: { value: ['#d4e1f7', '#a5b4fc', '#22d3ee', '#67e8f9'] },
    opacity: {
      value: { min: 0.1, max: 0.7 },
      animation: { enable: true, speed: 0.5, sync: false },
    },
    size: {
      value: { min: 0.5, max: 2.5 },
      animation: { enable: true, speed: 1, sync: false },
    },
    move: {
      enable: true,
      speed: 0.3,
      direction: 'none',
      random: true,
      outModes: { default: 'out' },
    },
    links: {
      enable: true,
      distance: 120,
      color: '#a5b4fc',
      opacity: 0.15,
      width: 1,
    },
  },
  interactivity: {
    events: {
      onHover: { enable: true, mode: 'grab' },
    },
    modes: {
      grab: { distance: 150 },
    },
  },
  detectRetina: true,
}

export default function StarParticles() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => setReady(true))
  }, [])

  if (!ready) return null

  return (
    <Particles
      id="star-particles"
      className="absolute inset-0 z-0"
      options={options}
    />
  )
}
