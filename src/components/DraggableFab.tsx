import { useEffect, useRef, useState } from 'react'
import { readJson, writeJson } from '../lib/storage'

const SIZE = 56
const MARGIN = 12
const TOP_RESERVED = 64 // 상단 헤더 영역
const BOTTOM_RESERVED = 92 // 하단 탭바 영역
const TAP_THRESHOLD = 6 // 이 이하로 움직이면 '탭'으로 처리

interface Pos {
  x: number
  y: number
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max)
}

function clampToViewport(p: Pos): Pos {
  return {
    x: clamp(p.x, MARGIN, window.innerWidth - SIZE - MARGIN),
    y: clamp(p.y, TOP_RESERVED, window.innerHeight - SIZE - BOTTOM_RESERVED),
  }
}

export default function DraggableFab({ onOpen }: { onOpen: () => void }) {
  const [pos, setPos] = useState<Pos | null>(null)
  const [dragging, setDragging] = useState(false)
  const posRef = useRef<Pos | null>(null)
  const drag = useRef({ active: false, moved: false, offX: 0, offY: 0, startX: 0, startY: 0 })

  useEffect(() => {
    posRef.current = pos
  }, [pos])

  // 초기 위치 (저장된 위치 없으면 우측 하단)
  useEffect(() => {
    const saved = readJson<Pos | null>('fabPos', null)
    const fallback: Pos = {
      x: window.innerWidth - SIZE - 16,
      y: window.innerHeight - SIZE - BOTTOM_RESERVED - 8,
    }
    setPos(clampToViewport(saved ?? fallback))

    const onResize = () => setPos(cur => (cur ? clampToViewport(cur) : cur))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    const rect = e.currentTarget.getBoundingClientRect()
    drag.current = {
      active: true,
      moved: false,
      offX: e.clientX - rect.left,
      offY: e.clientY - rect.top,
      startX: e.clientX,
      startY: e.clientY,
    }
    setDragging(true)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!drag.current.active) return
    const dist = Math.hypot(e.clientX - drag.current.startX, e.clientY - drag.current.startY)
    if (dist > TAP_THRESHOLD) drag.current.moved = true
    setPos(clampToViewport({ x: e.clientX - drag.current.offX, y: e.clientY - drag.current.offY }))
  }

  function endDrag() {
    if (!drag.current.active) return
    const wasMoved = drag.current.moved
    drag.current.active = false
    setDragging(false)
    if (wasMoved) {
      if (posRef.current) writeJson('fabPos', posRef.current)
    } else {
      onOpen()
    }
  }

  if (!pos) return null

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      aria-label="식사 기록 추가 (길게 눌러 드래그로 이동)"
      className={`fixed z-50 rounded-full bg-navy text-white text-3xl flex items-center justify-center shadow-lg shadow-navy/30 select-none ${
        dragging ? 'scale-110 transition-none cursor-grabbing' : 'transition-transform cursor-grab'
      }`}
      style={{ left: pos.x, top: pos.y, width: SIZE, height: SIZE, touchAction: 'none' }}
    >
      +
    </button>
  )
}
