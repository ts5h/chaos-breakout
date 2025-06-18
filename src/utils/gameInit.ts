import type { Ball, Block } from "../types/game";
import { GAME_CONFIG, COMPLEX_BOUNDARY } from "../constants/game";
import { isPointInside } from "./physics";

export function createInitialBalls(): Ball[] {
  const balls: Ball[] = [];
  const angleStep = (2 * Math.PI) / 3;

  for (let i = 0; i < 3; i++) {
    const angle = i * angleStep;

    balls.push({
      x: GAME_CONFIG.WIDTH / 2,
      y: GAME_CONFIG.HEIGHT / 2,
      vx: Math.cos(angle) * GAME_CONFIG.BALL_SPEED,
      vy: Math.sin(angle) * GAME_CONFIG.BALL_SPEED,
      radius: GAME_CONFIG.BALL_RADIUS,
    });
  }

  return balls;
}

export function createInitialBlocks(): Block[] {
  const blocks: Block[] = [];

  for (let row = 0; row < GAME_CONFIG.BLOCK_ROWS; row++) {
    for (let col = 0; col < GAME_CONFIG.BLOCK_COLS; col++) {
      const blockX =
        col * GAME_CONFIG.BLOCK_SPACING_X + GAME_CONFIG.BLOCK_OFFSET_X;
      const blockY =
        row * GAME_CONFIG.BLOCK_SPACING_Y + GAME_CONFIG.BLOCK_OFFSET_Y;

      // Check all four corners of the block to ensure it's completely inside the boundary
      const topLeft = isPointInside(blockX, blockY, COMPLEX_BOUNDARY);
      const topRight = isPointInside(
        blockX + GAME_CONFIG.BLOCK_WIDTH,
        blockY,
        COMPLEX_BOUNDARY,
      );
      const bottomLeft = isPointInside(
        blockX,
        blockY + GAME_CONFIG.BLOCK_HEIGHT,
        COMPLEX_BOUNDARY,
      );
      const bottomRight = isPointInside(
        blockX + GAME_CONFIG.BLOCK_WIDTH,
        blockY + GAME_CONFIG.BLOCK_HEIGHT,
        COMPLEX_BOUNDARY,
      );

      // Only place block if all corners are inside the boundary
      if (topLeft && topRight && bottomLeft && bottomRight) {
        blocks.push({
          x: blockX,
          y: blockY,
          width: GAME_CONFIG.BLOCK_WIDTH,
          height: GAME_CONFIG.BLOCK_HEIGHT,
          destroyed: false,
        });
      }
    }
  }

  return blocks;
}
