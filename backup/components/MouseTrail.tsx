'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function MouseTrail() {
  const [points, setPoints] = useState<Array<{ x: number; y: number; timestamp: number }>>([])
  const lastMouseMoveRef = useRef(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      // Throttle for smooth line
      if (now - lastMouseMoveRef.current < 10) return // ~100fps for smoother line
      lastMouseMoveRef.current = now

      const newPoint = {
        x: e.clientX,
        y: e.clientY,
        timestamp: now,
      }
      setPoints((prev) => [...prev.slice(-30), newPoint]) // Keep last 30 points for continuous line
      
      // Remove old points
      setTimeout(() => {
        setPoints((prev) => prev.filter((p) => now - p.timestamp < 400))
      }, 400)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  if (points.length < 2) return null

  // Create smooth path for continuous line
  const pathData = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`
    }
    // Use quadratic curves for smooth line
    const prevPoint = points[index - 1]
    const cpX = (prevPoint.x + point.x) / 2
    const cpY = (prevPoint.y + point.y) / 2
    return `${path} Q ${prevPoint.x} ${prevPoint.y} ${cpX} ${cpY}`
  }, '')

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        <motion.path
          d={pathData}
          fill="none"
          stroke="#771967"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: 'blur(2px)',
            opacity: 0.25,
          }}
          initial={{ pathLength: 0, opacity: 0.25 }}
          animate={{ pathLength: 1, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </svg>
    </div>
  )
}

