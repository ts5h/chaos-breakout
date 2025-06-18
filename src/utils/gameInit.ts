import { COMPLEX_BOUNDARY, GAME_CONFIG } from "../constants/game";
import type { Ball, Block } from "../types/game";
import { isPointInside } from "./physics";

export function createInitialBalls(): Ball[] {
  const balls: Ball[] = [];
  const angleStep = (2 * Math.PI) / GAME_CONFIG.BALL_COUNT;

  for (let i = 0; i < GAME_CONFIG.BALL_COUNT; i++) {
    const angle = i * angleStep;

    // Find a random position within the boundary
    let x: number;
    let y: number;
    let attempts = 0;
    const maxAttempts = 1000;

    do {
      // Generate random position within canvas bounds
      x =
        Math.random() * (GAME_CONFIG.WIDTH - 2 * GAME_CONFIG.BALL_RADIUS) +
        GAME_CONFIG.BALL_RADIUS;
      y =
        Math.random() * (GAME_CONFIG.HEIGHT - 2 * GAME_CONFIG.BALL_RADIUS) +
        GAME_CONFIG.BALL_RADIUS;
      attempts++;

      if (attempts >= maxAttempts) {
        // Fallback to center if we can't find a valid position
        x = GAME_CONFIG.WIDTH / 2;
        y = GAME_CONFIG.HEIGHT / 2;
        break;
      }
    } while (!isPointInside(x, y, COMPLEX_BOUNDARY));

    balls.push({
      x,
      y,
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

      // Skip blocks that would extend outside the boundary by checking all four corners
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
