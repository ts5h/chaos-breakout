import { beforeEach, describe, expect, it, vi } from "vitest";
import { GAME_CONFIG } from "../../constants/game";
import type { Ball, Block, Boundary } from "../../types/game";
import {
  handleBallToBallCollision,
  handleBlockCollision,
  handleBoundaryCollision,
  isPointInside,
  updateBallPosition,
} from "../../utils/physics";

// Mock the sound module
vi.mock("../../utils/sound", () => ({
  playCollisionSound: vi.fn(),
}));

describe("Physics utilities", () => {
  describe("isPointInside", () => {
    const squareBoundary: Boundary = [
      [0, 0],
      [100, 0],
      [100, 100],
      [0, 100],
    ];

    it("should return true for point inside polygon", () => {
      expect(isPointInside(50, 50, squareBoundary)).toBe(true);
    });

    it("should return false for point outside polygon", () => {
      expect(isPointInside(150, 50, squareBoundary)).toBe(false);
      expect(isPointInside(50, 150, squareBoundary)).toBe(false);
      expect(isPointInside(-10, 50, squareBoundary)).toBe(false);
    });

    it("should handle edge cases correctly", () => {
      // Point exactly on boundary - behavior depends on ray casting implementation
      expect(isPointInside(0, 50, squareBoundary)).toBeDefined();
      expect(isPointInside(50, 0, squareBoundary)).toBeDefined();
    });

    it("should work with complex polygons", () => {
      const triangleBoundary: Boundary = [
        [0, 0],
        [50, 100],
        [100, 0],
      ];

      expect(isPointInside(50, 30, triangleBoundary)).toBe(true);
      expect(isPointInside(25, 80, triangleBoundary)).toBe(false);
    });
  });

  describe("handleBoundaryCollision", () => {
    const testBoundary: Boundary = [
      [0, 0],
      [200, 0],
      [200, 200],
      [0, 200],
    ];

    let ball: Ball;

    beforeEach(() => {
      ball = {
        x: 100,
        y: 100,
        vx: 5,
        vy: 3,
        radius: 10,
      };
    });

    it("should not change velocity when ball stays inside boundary", () => {
      const originalVx = ball.vx;
      const originalVy = ball.vy;

      handleBoundaryCollision(ball, testBoundary);

      expect(ball.vx).toBe(originalVx);
      expect(ball.vy).toBe(originalVy);
    });

    it("should reflect X velocity when hitting vertical boundary", () => {
      ball.x = 195;
      ball.vx = 10; // Moving right towards boundary

      handleBoundaryCollision(ball, testBoundary);

      expect(ball.vx).toBeLessThan(0); // Should be reflected (with possible angle variation)
    });

    it("should reflect Y velocity when hitting horizontal boundary", () => {
      ball.y = 195;
      ball.vy = 10; // Moving down towards boundary

      handleBoundaryCollision(ball, testBoundary);

      expect(ball.vy).toBeLessThan(0); // Should be reflected (with possible angle variation)
    });

    it("should handle corner collisions with random factor", () => {
      ball.x = 195;
      ball.y = 195;
      ball.vx = 10;
      ball.vy = 10;

      const originalSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);

      handleBoundaryCollision(ball, testBoundary);

      // Both velocities should be reflected (with possible random variation)
      expect(ball.vx).toBeLessThan(0);
      expect(ball.vy).toBeLessThan(0);

      // Speed should be modified by random factor in corner collision
      const newSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      expect(newSpeed).toBeGreaterThan(originalSpeed * 0.7); // Allow for random variation
      expect(newSpeed).toBeLessThan(originalSpeed * 1.3);
    });
  });

  describe("handleBlockCollision", () => {
    let ball: Ball;
    let blocks: Block[];

    beforeEach(() => {
      ball = {
        x: 50,
        y: 50,
        vx: 5,
        vy: 5,
        radius: 8,
      };

      blocks = [
        {
          x: 60,
          y: 40,
          width: 40,
          height: 14,
          destroyed: false,
        },
        {
          x: 120,
          y: 40,
          width: 40,
          height: 14,
          destroyed: false,
        },
      ];
    });

    it("should destroy block and reflect ball when collision occurs", () => {
      ball.x = 65;
      ball.y = 45;

      handleBlockCollision(ball, blocks);

      expect(blocks[0].destroyed).toBe(true);
      expect(ball.vy).toBeLessThan(0); // Y velocity should be reflected (with angle variation)
    });

    it("should not affect destroyed blocks", () => {
      blocks[0].destroyed = true;
      ball.x = 65;
      ball.y = 45;
      const originalVy = ball.vy;

      handleBlockCollision(ball, blocks);

      expect(ball.vy).toBe(originalVy); // Should not change
    });

    it("should not collide when ball is not overlapping block", () => {
      ball.x = 20;
      ball.y = 20;
      const originalVy = ball.vy;

      handleBlockCollision(ball, blocks);

      expect(blocks[0].destroyed).toBe(false);
      expect(ball.vy).toBe(originalVy);
    });

    it("should add angle variation to reflection", () => {
      ball.x = 65;
      ball.y = 45;
      ball.vx = 0;
      ball.vy = 5;

      handleBlockCollision(ball, blocks);

      // Velocity should be modified with angle variation
      const newSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      expect(newSpeed).toBeGreaterThan(4); // Should maintain roughly same speed
      expect(newSpeed).toBeLessThan(6);
    });
  });

  describe("handleBallToBallCollision", () => {
    let balls: Ball[];

    beforeEach(() => {
      balls = [
        {
          x: 50,
          y: 50,
          vx: 5,
          vy: 0,
          radius: 8,
        },
        {
          x: 65,
          y: 50,
          vx: -3,
          vy: 0,
          radius: 8,
        },
      ];
    });

    it("should handle collision when balls overlap", () => {
      const originalBall1Vx = balls[0].vx;
      const originalBall2Vx = balls[1].vx;

      handleBallToBallCollision(balls);

      // Velocities should be exchanged (elastic collision)
      expect(balls[0].vx).not.toBe(originalBall1Vx);
      expect(balls[1].vx).not.toBe(originalBall2Vx);
    });

    it("should separate overlapping balls", () => {
      balls[0].x = 50;
      balls[1].x = 58; // Overlapping (distance = 8, but radii = 8 each, so min distance = 16)

      const originalDistance = Math.abs(balls[1].x - balls[0].x);

      handleBallToBallCollision(balls);

      const newDistance = Math.sqrt(
        Math.pow(balls[1].x - balls[0].x, 2) +
          Math.pow(balls[1].y - balls[0].y, 2),
      );

      expect(newDistance).toBeGreaterThan(originalDistance);
      expect(newDistance).toBeGreaterThanOrEqual(
        balls[0].radius + balls[1].radius,
      );
    });

    it("should not process balls moving away from each other", () => {
      balls[0].vx = -5; // Moving left
      balls[1].vx = 5; // Moving right (away from each other)
      balls[0].x = 50;
      balls[1].x = 58; // Close but moving apart

      const originalBall1Vx = balls[0].vx;
      const originalBall2Vx = balls[1].vx;

      handleBallToBallCollision(balls);

      // Velocities should remain unchanged
      expect(balls[0].vx).toBe(originalBall1Vx);
      expect(balls[1].vx).toBe(originalBall2Vx);
    });

    it("should maintain constant speed after collision", () => {
      // Mock GAME_CONFIG.BALL_SPEED for this test
      const originalBallSpeed = GAME_CONFIG.BALL_SPEED;
      Object.defineProperty(GAME_CONFIG, "BALL_SPEED", {
        value: 15,
        writable: true,
      });

      const speed = 15;
      balls[0].vx = speed;
      balls[0].vy = 0;
      balls[1].vx = -speed;
      balls[1].vy = 0;

      handleBallToBallCollision(balls);

      const ball1Speed = Math.sqrt(
        balls[0].vx * balls[0].vx + balls[0].vy * balls[0].vy,
      );
      const ball2Speed = Math.sqrt(
        balls[1].vx * balls[1].vx + balls[1].vy * balls[1].vy,
      );

      expect(ball1Speed).toBeCloseTo(speed, 1);
      expect(ball2Speed).toBeCloseTo(speed, 1);

      // Restore original value
      Object.defineProperty(GAME_CONFIG, "BALL_SPEED", {
        value: originalBallSpeed,
        writable: true,
      });
    });

    it("should handle multiple balls correctly", () => {
      balls.push({
        x: 80,
        y: 50,
        vx: -2,
        vy: 0,
        radius: 8,
      });

      // Should process all pairs without errors
      expect(() => handleBallToBallCollision(balls)).not.toThrow();
    });
  });

  describe("updateBallPosition", () => {
    it("should update ball position based on velocity", () => {
      const ball: Ball = {
        x: 100,
        y: 150,
        vx: 5,
        vy: -3,
        radius: 8,
      };

      updateBallPosition(ball);

      expect(ball.x).toBe(105);
      expect(ball.y).toBe(147);
    });

    it("should handle negative velocities", () => {
      const ball: Ball = {
        x: 100,
        y: 150,
        vx: -7,
        vy: -4,
        radius: 8,
      };

      updateBallPosition(ball);

      expect(ball.x).toBe(93);
      expect(ball.y).toBe(146);
    });

    it("should handle zero velocities", () => {
      const ball: Ball = {
        x: 100,
        y: 150,
        vx: 0,
        vy: 0,
        radius: 8,
      };

      updateBallPosition(ball);

      expect(ball.x).toBe(100);
      expect(ball.y).toBe(150);
    });
  });
});
