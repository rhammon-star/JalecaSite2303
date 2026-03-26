'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

type Props = {
  src: string
  alt: string
  priority?: boolean
}

export default function ImageZoom({ src, alt, priority = false }: Props) {
  const [zoomed, setZoomed] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin(`${x}% ${y}%`)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-crosshair"
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
      onMouseMove={handleMouseMove}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        priority={priority}
        className="object-cover transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: zoomed ? 'scale(2)' : 'scale(1)',
          transformOrigin: origin,
        }}
      />
    </div>
  )
}
