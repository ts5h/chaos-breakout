import { useRef } from "react";
import backgroundImage from "../assets/background.jpg";
import { GAME_CONFIG } from "../constants/game";
import { useGameLoop } from "../hooks/useGameLoop";
import { useGameState } from "../hooks/useGameState";

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useGameState();

  useGameLoop(canvasRef, gameState);

  return (
    <div
      style={{
        position: "relative",
        width: GAME_CONFIG.WIDTH,
        height: GAME_CONFIG.HEIGHT,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: `${GAME_CONFIG.WIDTH}px`,
          height: `${GAME_CONFIG.HEIGHT}px`,
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
        }}
      />
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.WIDTH}
        height={GAME_CONFIG.HEIGHT}
        style={{
          position: "relative",
          zIndex: 1,
        }}
      />
    </div>
  );
}
