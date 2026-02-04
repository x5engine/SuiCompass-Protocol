/**
 * Particle Background Component
 * Adds "sick" crypto vibes with floating particles
 */
import { useEffect, useRef } from 'react'

export default function ParticleBackground() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const particleCount = 20
        const particles: HTMLDivElement[] = []

        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div')
            p.className = 'particle'
            p.style.left = `${Math.random() * 100}%`
            p.style.top = `${Math.random() * 100}%`
            p.style.animationDelay = `${Math.random() * 5}s`
            p.style.opacity = `${Math.random() * 0.5 + 0.1}`
            container.appendChild(p)
            particles.push(p)
        }

        return () => {
            particles.forEach(p => p.remove())
        }
    }, [])

    return (
        <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden" />
    )
}
