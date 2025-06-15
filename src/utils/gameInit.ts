import type { Ball, Block } from '../types/game'
import { GAME_CONFIG, COMPLEX_BOUNDARY } from '../constants/game'
import { isPointInside } from './physics'

export function createInitialBall(): Ball {
  return {
    x: GAME_CONFIG.WIDTH / 2,
    y: GAME_CONFIG.HEIGHT / 2,
    vx: GAME_CONFIG.BALL_SPEED,
    vy: GAME_CONFIG.BALL_SPEED,
    radius: GAME_CONFIG.BALL_RADIUS,
  }
}

export function createInitialBlocks(): Block[] {
  const blocks: Block[] = []

  for (let row = 0; row < GAME_CONFIG.BLOCK_ROWS; row++) {
    for (let col = 0; col < GAME_CONFIG.BLOCK_COLS; col++) {
      const blockX =
        col * GAME_CONFIG.BLOCK_SPACING_X + GAME_CONFIG.BLOCK_OFFSET_X
      const blockY =
        row * GAME_CONFIG.BLOCK_SPACING_Y + GAME_CONFIG.BLOCK_OFFSET_Y

      // 境界内にブロックを大量配置
      if (
        isPointInside(
          blockX + GAME_CONFIG.BLOCK_WIDTH / 2,
          blockY + GAME_CONFIG.BLOCK_HEIGHT / 2,
          COMPLEX_BOUNDARY,
        ) &&
        Math.abs(blockX + GAME_CONFIG.BLOCK_WIDTH / 2 - GAME_CONFIG.WIDTH / 2) <
          300 &&
        Math.abs(
          blockY + GAME_CONFIG.BLOCK_HEIGHT / 2 - GAME_CONFIG.HEIGHT / 2,
        ) < 200
      ) {
        blocks.push({
          x: blockX,
          y: blockY,
          width: GAME_CONFIG.BLOCK_WIDTH,
          height: GAME_CONFIG.BLOCK_HEIGHT,
          destroyed: false,
        })
      }
    }
  }

  return blocks
}
