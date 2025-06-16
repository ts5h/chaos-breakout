import type { Ball, Block, Boundary } from "../types/game";
import { GAME_CONFIG } from "../constants/game";

export function isPointInside(
  x: number,
  y: number,
  polygon: Boundary,
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

export function handleBoundaryCollision(ball: Ball, boundary: Boundary): void {
  if (!isPointInside(ball.x + ball.vx, ball.y + ball.vy, boundary)) {
    const nextX = ball.x + ball.vx;
    const nextY = ball.y + ball.vy;

    const hitX = !isPointInside(nextX, ball.y, boundary);
    const hitY = !isPointInside(ball.x, nextY, boundary);

    // Store original velocity before reflection
    const originalVx = ball.vx;
    const originalVy = ball.vy;

    // Simple and reliable reflection: reverse velocity on affected axis
    if (hitX) {
      ball.vx = -ball.vx;
    }
    if (hitY) {
      ball.vy = -ball.vy;
    }

    // If hit both axes (corner), apply additional random factor
    if (hitX && hitY) {
      // Corner reflection: add random speed variation
      const randomFactor =
        GAME_CONFIG.CORNER_RANDOM_FACTOR_MIN +
        Math.random() *
          (GAME_CONFIG.CORNER_RANDOM_FACTOR_MAX -
            GAME_CONFIG.CORNER_RANDOM_FACTOR_MIN);
      const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      const angle = Math.atan2(ball.vy, ball.vx);
      ball.vx = Math.cos(angle) * speed * randomFactor;
      ball.vy = Math.sin(angle) * speed * randomFactor;
    } else {
      // For non-corner collisions, add small angle variation
      // but ensure it doesn't exceed 90 degrees from the reflected angle
      const reflectedAngle = Math.atan2(ball.vy, ball.vx);
      const angleVariation =
        (Math.random() - 0.5) * GAME_CONFIG.REFLECTION_ANGLE_VARIATION;

      // Ensure the new angle maintains the reflection
      // by limiting variation to prevent going back to incident direction
      const incidentAngle = Math.atan2(originalVy, originalVx);
      let newAngle = reflectedAngle + angleVariation;

      // Normalize angles to [-π, π]
      const normalizeAngle = (a: number) => {
        while (a > Math.PI) a -= 2 * Math.PI;
        while (a < -Math.PI) a += 2 * Math.PI;
        return a;
      };

      // Check if new angle is too close to incident angle
      const angleDiff = Math.abs(normalizeAngle(newAngle - incidentAngle));
      if (angleDiff < Math.PI / 2) {
        // If too close to incident angle, use reflected angle without variation
        newAngle = reflectedAngle;
      }

      const currentSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      ball.vx = Math.cos(newAngle) * currentSpeed;
      ball.vy = Math.sin(newAngle) * currentSpeed;
    }
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
      block.destroyed = true;
      // Add angle variation to block collision reflection as well
      ball.vy = -ball.vy;
      const angle = Math.atan2(ball.vy, ball.vx);
      const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      const angleVariation =
        (Math.random() - 0.5) * GAME_CONFIG.REFLECTION_ANGLE_VARIATION;
      const newAngle = angle + angleVariation;
      ball.vx = Math.cos(newAngle) * speed;
      ball.vy = Math.sin(newAngle) * speed;
    }
  }
}

export function handleBallToBallCollision(balls: Ball[]): void {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const ball1 = balls[i];
      const ball2 = balls[j];
      
      const dx = ball2.x - ball1.x;
      const dy = ball2.y - ball1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = ball1.radius + ball2.radius;
      
      if (distance < minDistance) {
        // Balls are colliding
        // Calculate collision normal
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Relative velocity
        const dvx = ball2.vx - ball1.vx;
        const dvy = ball2.vy - ball1.vy;
        
        // Relative velocity in collision normal direction
        const dvn = dvx * nx + dvy * ny;
        
        // Do not resolve if velocities are separating
        if (dvn > 0) continue;
        
        // Collision impulse
        const impulse = 2 * dvn / 2; // Equal mass assumption
        
        // Update velocities
        ball1.vx -= impulse * nx;
        ball1.vy -= impulse * ny;
        ball2.vx += impulse * nx;
        ball2.vy += impulse * ny;
        
        // Separate balls to prevent overlap
        const overlap = minDistance - distance;
        const separationX = nx * overlap * 0.5;
        const separationY = ny * overlap * 0.5;
        
        ball1.x -= separationX;
        ball1.y -= separationY;
        ball2.x += separationX;
        ball2.y += separationY;
        
        // Add some chaos to ball collisions
        const angleVariation = (Math.random() - 0.5) * GAME_CONFIG.REFLECTION_ANGLE_VARIATION;
        
        // Apply angle variation to ball1
        const speed1 = Math.sqrt(ball1.vx * ball1.vx + ball1.vy * ball1.vy);
        const angle1 = Math.atan2(ball1.vy, ball1.vx) + angleVariation;
        ball1.vx = Math.cos(angle1) * speed1;
        ball1.vy = Math.sin(angle1) * speed1;
        
        // Apply opposite angle variation to ball2
        const speed2 = Math.sqrt(ball2.vx * ball2.vx + ball2.vy * ball2.vy);
        const angle2 = Math.atan2(ball2.vy, ball2.vx) - angleVariation;
        ball2.vx = Math.cos(angle2) * speed2;
        ball2.vy = Math.sin(angle2) * speed2;
      }
    }
  }
}

export function updateBallPosition(ball: Ball): void {
  ball.x += ball.vx;
  ball.y += ball.vy;
}
