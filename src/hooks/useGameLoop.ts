import { useCallback, useEffect, useRef, type RefObject } from "react";
import type { GameState } from "../types/game";
import {
  updateBallPosition,
  handleBoundaryCollision,
  handleBlockCollision,
  handleBallToBallCollision,
} from "../utils/physics";
import {
  clearCanvas,
  drawBoundary,
  drawBalls,
  drawBlocks,
} from "../utils/renderer";

export function useGameLoop(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  gameState: GameState,
) {
  const animationIdRef = useRef<number | undefined>(undefined);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Physics simulation
    gameState.balls.forEach((ball) => {
      updateBallPosition(ball);
      handleBoundaryCollision(ball, gameState.boundary);
      handleBlockCollision(ball, gameState.blocks);
    });
    handleBallToBallCollision(gameState.balls);

    // Rendering
    clearCanvas(ctx);
    drawBoundary(ctx, gameState.boundary);
    drawBalls(ctx, gameState.balls);
    drawBlocks(ctx, gameState.blocks);

    animationIdRef.current = requestAnimationFrame(gameLoop);
  }, [canvasRef, gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initial rendering
    clearCanvas(ctx);
    drawBoundary(ctx, gameState.boundary);
    drawBalls(ctx, gameState.balls);
    drawBlocks(ctx, gameState.blocks);

    // Start game loop
    animationIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [gameLoop, canvasRef, gameState]);
}
