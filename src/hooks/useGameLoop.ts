import { useCallback, useEffect, useRef } from 'react'
import type { GameState } from '../types/game'
import {
  updateBallPosition,
  handleBoundaryCollision,
  handleBlockCollision,
} from '../utils/physics'
import {
  clearCanvas,
  drawBoundary,
  drawBall,
  drawBlocks,
} from '../utils/renderer'

export function useGameLoop(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  gameState: GameState,
) {
  const animationIdRef = useRef<number>()

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Physics simulation
    updateBallPosition(gameState.ball)
    handleBoundaryCollision(gameState.ball, gameState.boundary)
    handleBlockCollision(gameState.ball, gameState.blocks)

    // Rendering
    clearCanvas(ctx)
    drawBoundary(ctx, gameState.boundary)
    drawBall(ctx, gameState.ball)
    drawBlocks(ctx, gameState.blocks)

    animationIdRef.current = requestAnimationFrame(gameLoop)
  }, [canvasRef, gameState])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Initial rendering
    clearCanvas(ctx)
    drawBoundary(ctx, gameState.boundary)
    drawBall(ctx, gameState.ball)
    drawBlocks(ctx, gameState.blocks)

    // Start game loop
    animationIdRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [gameLoop, canvasRef, gameState])
}
