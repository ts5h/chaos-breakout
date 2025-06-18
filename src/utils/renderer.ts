import { GAME_CONFIG } from "../constants/game";
import type { Ball, Block, Boundary } from "../types/game";

export function clearCanvas(ctx: CanvasRenderingContext2D): void {
  ctx.clearRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
}

export function drawBoundary(
  ctx: CanvasRenderingContext2D,
  boundary: Boundary,
): void {
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(boundary[0][0], boundary[0][1]);
  for (let i = 1; i < boundary.length; i++) {
    ctx.lineTo(boundary[i][0], boundary[i][1]);
  }
  ctx.closePath();
  ctx.stroke();
}

export function drawBalls(ctx: CanvasRenderingContext2D, balls: Ball[]): void {
  ctx.fillStyle = "#fff";
  for (const ball of balls) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawBlocks(
  ctx: CanvasRenderingContext2D,
  blocks: Block[],
): void {
  ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`;
  for (const block of blocks) {
    if (!block.destroyed) {
      ctx.fillRect(block.x, block.y, block.width, block.height);
    }
  }
}
