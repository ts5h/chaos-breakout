import { useCallback, useEffect, useRef } from "react";
import type { GameState } from "../types/game";
import {
  updateBallPosition,
  handleBoundaryCollision,
  handleBlockCollision,
  handleBallToBallCollision,
} from "../utils/physics";
import {
  drawBackground,
  drawBoundary,
  drawBalls,
  drawBlocks,
} from "../utils/renderer";

export function useGameLoop(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  gameState: GameState,
  backgroundImage: HTMLImageElement | null,
) {
  const animationIdRef = useRef<number | undefined>(undefined);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Physics simulation
    gameState.balls.forEach(ball => {
      updateBallPosition(ball);
      handleBoundaryCollision(ball, gameState.boundary);
      handleBlockCollision(ball, gameState.blocks);
    });
    handleBallToBallCollision(gameState.balls);

    // Rendering
    drawBackground(ctx, backgroundImage);
    drawBoundary(ctx, gameState.boundary);
    drawBalls(ctx, gameState.balls);
    drawBlocks(ctx, gameState.blocks);

    animationIdRef.current = requestAnimationFrame(gameLoop);
  }, [canvasRef, gameState, backgroundImage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initial rendering
    drawBackground(ctx, backgroundImage);
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
  }, [gameLoop, canvasRef, gameState, backgroundImage]);
}
