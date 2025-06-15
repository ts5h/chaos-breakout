import { useState } from 'react'
import type { GameState } from '../types/game'
import { COMPLEX_BOUNDARY } from '../constants/game'
import { createInitialBall, createInitialBlocks } from '../utils/gameInit'

export function useGameState(): GameState {
  const [ball] = useState(() => createInitialBall())
  const [blocks] = useState(() => createInitialBlocks())

  return {
    ball,
    blocks,
    boundary: COMPLEX_BOUNDARY,
  }
}
