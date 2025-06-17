import { useRef } from "react";
import { GAME_CONFIG } from "../constants/game";
import { useGameState } from "../hooks/useGameState";
import { useGameLoop } from "../hooks/useGameLoop";
import { useBackgroundImage } from "../hooks/useBackgroundImage";

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useGameState();
  const backgroundImage = useBackgroundImage();

  // @ts-ignore
  useGameLoop(canvasRef, gameState, backgroundImage);

  return (
    <canvas
      ref={canvasRef}
      width={GAME_CONFIG.WIDTH}
      height={GAME_CONFIG.HEIGHT}
    />
  );
}
