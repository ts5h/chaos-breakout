import { useState } from "react";
import type { GameState } from "../types/game";
import { COMPLEX_BOUNDARY } from "../constants/game";
import { createInitialBalls, createInitialBlocks } from "../utils/gameInit";

export function useGameState(): GameState {
  const [balls] = useState(() => createInitialBalls());
  const [blocks] = useState(() => createInitialBlocks());

  return {
    balls,
    blocks,
    boundary: COMPLEX_BOUNDARY,
  };
}
