import type { Ball, Block, Boundary } from '../types/game'
import { GAME_CONFIG } from '../constants/game'

export function isPointInside(
  x: number,
  y: number,
  polygon: Boundary,
): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0]
    const yi = polygon[i][1]
    const xj = polygon[j][0]
    const yj = polygon[j][1]

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

export function handleBoundaryCollision(ball: Ball, boundary: Boundary): void {
  if (!isPointInside(ball.x + ball.vx, ball.y + ball.vy, boundary)) {
    const nextX = ball.x + ball.vx
    const nextY = ball.y + ball.vy

    const hitX = !isPointInside(nextX, ball.y, boundary)
    const hitY = !isPointInside(ball.x, nextY, boundary)

    // 単純で確実な反射：該当する軸の速度を反転
    if (hitX) {
      ball.vx = -ball.vx
    }
    if (hitY) {
      ball.vy = -ball.vy
    }

    // 両方に当たった場合（角）は両軸を反転
    if (hitX && hitY) {
      // 角での反射：両軸反転 + 追加のランダム要素
      const randomFactor =
        GAME_CONFIG.CORNER_RANDOM_FACTOR_MIN +
        Math.random() *
          (GAME_CONFIG.CORNER_RANDOM_FACTOR_MAX -
            GAME_CONFIG.CORNER_RANDOM_FACTOR_MIN)
      ball.vx *= randomFactor
      ball.vy *= randomFactor
    }

    // 反発角にランダムなブレを追加
    const currentAngle = Math.atan2(ball.vy, ball.vx)
    const angleVariation =
      (Math.random() - 0.5) * GAME_CONFIG.REFLECTION_ANGLE_VARIATION
    const newAngle = currentAngle + angleVariation
    const currentSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)

    ball.vx = Math.cos(newAngle) * currentSpeed
    ball.vy = Math.sin(newAngle) * currentSpeed
  }
}

export function handleBlockCollision(ball: Ball, blocks: Block[]): void {
  for (const block of blocks) {
    if (
      !block.destroyed &&
      ball.x + ball.radius > block.x &&
      ball.x - ball.radius < block.x + block.width &&
      ball.y + ball.radius > block.y &&
      ball.y - ball.radius < block.y + block.height
    ) {
      block.destroyed = true
      // ブロックとの衝突時も反発角にブレを追加
      ball.vy = -ball.vy
      const angle = Math.atan2(ball.vy, ball.vx)
      const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
      const angleVariation =
        (Math.random() - 0.5) * GAME_CONFIG.REFLECTION_ANGLE_VARIATION
      const newAngle = angle + angleVariation
      ball.vx = Math.cos(newAngle) * speed
      ball.vy = Math.sin(newAngle) * speed
    }
  }
}

export function updateBallPosition(ball: Ball): void {
  ball.x += ball.vx
  ball.y += ball.vy
}
