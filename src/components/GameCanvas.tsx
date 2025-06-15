import { useRef } from 'react'
import { GAME_CONFIG } from '../constants/game'
import { useGameState } from '../hooks/useGameState'
import { useGameLoop } from '../hooks/useGameLoop'

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameState = useGameState()

  useGameLoop(canvasRef, gameState)

  return (
    <canvas
      ref={canvasRef}
      width={GAME_CONFIG.WIDTH}
      height={GAME_CONFIG.HEIGHT}
      style={{ border: '1px solid #333' }}
    />
  )
}
