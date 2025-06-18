import { type RefObject, useCallback, useEffect, useRef } from "react";
import type { GameState } from "../types/game";
import {
  handleBallToBallCollision,
  handleBlockCollision,
  handleBoundaryCollision,
  updateBallPosition,
} from "../utils/physics";
import { clearCanvas, drawBalls, drawBlocks } from "../utils/renderer";

export function useGameLoop(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  gameState: GameState,
  isPaused: boolean,
) {
  const animationIdRef = useRef<number | undefined>(undefined);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Physics simulation (only when not paused)
    if (!isPaused) {
      gameState.balls.forEach((ball) => {
        updateBallPosition(ball);
        handleBoundaryCollision(ball, gameState.boundary);
        handleBlockCollision(ball, gameState.blocks);
      });
      handleBallToBallCollision(gameState.balls);
    }

    // Rendering
    clearCanvas(ctx);
    if (!isPaused) {
      drawBalls(ctx, gameState.balls);
    }
    drawBlocks(ctx, gameState.blocks);

    animationIdRef.current = requestAnimationFrame(gameLoop);
  }, [canvasRef, gameState, isPaused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initial rendering
    clearCanvas(ctx);
    if (!isPaused) {
      drawBalls(ctx, gameState.balls);
    }
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
