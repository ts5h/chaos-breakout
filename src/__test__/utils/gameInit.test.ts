import { beforeEach, describe, expect, it, vi } from "vitest";
import { GAME_CONFIG } from "../../constants/game";
import { createInitialBalls, createInitialBlocks } from "../../utils/gameInit";

// Mock the physics module
vi.mock("../../utils/physics", () => ({
  isPointInside: vi.fn(),
}));

import { isPointInside } from "../../utils/physics";

describe("Game initialization utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createInitialBalls", () => {
    it("should create correct number of balls", () => {
      vi.mocked(isPointInside).mockReturnValue(true);

      const balls = createInitialBalls();

      expect(balls).toHaveLength(GAME_CONFIG.BALL_COUNT);
    });

    it("should create balls with correct properties", () => {
      vi.mocked(isPointInside).mockReturnValue(true);

      const balls = createInitialBalls();

      balls.forEach((ball) => {
        expect(ball).toHaveProperty("x");
        expect(ball).toHaveProperty("y");
        expect(ball).toHaveProperty("vx");
        expect(ball).toHaveProperty("vy");
        expect(ball.radius).toBe(GAME_CONFIG.BALL_RADIUS);

        // Check position is within bounds
        expect(ball.x).toBeGreaterThanOrEqual(GAME_CONFIG.BALL_RADIUS);
        expect(ball.x).toBeLessThanOrEqual(
          GAME_CONFIG.WIDTH - GAME_CONFIG.BALL_RADIUS,
        );
        expect(ball.y).toBeGreaterThanOrEqual(GAME_CONFIG.BALL_RADIUS);
        expect(ball.y).toBeLessThanOrEqual(
          GAME_CONFIG.HEIGHT - GAME_CONFIG.BALL_RADIUS,
        );
      });
    });

    it("should create balls with correct speed", () => {
      vi.mocked(isPointInside).mockReturnValue(true);

      const balls = createInitialBalls();

      balls.forEach((ball) => {
        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        expect(speed).toBeCloseTo(GAME_CONFIG.BALL_SPEED, 1);
      });
    });

    it("should distribute balls at different angles", () => {
      vi.mocked(isPointInside).mockReturnValue(true);

      const balls = createInitialBalls();

      // Calculate angles for each ball
      const angles = balls.map((ball) => Math.atan2(ball.vy, ball.vx));

      // Should have different angles (assuming BALL_COUNT > 1)
      if (balls.length > 1) {
        const uniqueAngles = new Set(
          angles.map((a) => Math.round(a * 100) / 100),
        );
        expect(uniqueAngles.size).toBeGreaterThan(1);
      }
    });

    it("should fallback to center when no valid position found", () => {
      vi.mocked(isPointInside).mockReturnValue(false);

      const balls = createInitialBalls();

      // Should still create balls even when no valid position found
      expect(balls).toHaveLength(GAME_CONFIG.BALL_COUNT);

      // All balls should be at center (fallback position)
      balls.forEach((ball) => {
        expect(ball.x).toBe(GAME_CONFIG.WIDTH / 2);
        expect(ball.y).toBe(GAME_CONFIG.HEIGHT / 2);
      });
    });

    it("should retry finding valid positions", () => {
      // Mock to return false for first few calls, then true
      vi.mocked(isPointInside)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true)
        .mockReturnValue(true); // For remaining balls

      const balls = createInitialBalls();

      expect(balls).toHaveLength(GAME_CONFIG.BALL_COUNT);
      // Should have called isPointInside multiple times due to retries
      expect(isPointInside).toHaveBeenCalledTimes(GAME_CONFIG.BALL_COUNT + 2);
    });
  });

  describe("createInitialBlocks", () => {
    it("should create blocks in grid formation", () => {
      vi.mocked(isPointInside).mockReturnValue(true);

      const blocks = createInitialBlocks();

      // Should create some blocks (exact number depends on boundary)
      expect(blocks.length).toBeGreaterThan(0);
      expect(blocks.length).toBeLessThanOrEqual(
        GAME_CONFIG.BLOCK_ROWS * GAME_CONFIG.BLOCK_COLS,
      );
    });

    it("should create blocks with correct properties", () => {
      vi.mocked(isPointInside).mockReturnValue(true);

      const blocks = createInitialBlocks();

      blocks.forEach((block) => {
        expect(block).toHaveProperty("x");
        expect(block).toHaveProperty("y");
        expect(block.width).toBe(GAME_CONFIG.BLOCK_WIDTH);
        expect(block.height).toBe(GAME_CONFIG.BLOCK_HEIGHT);
        expect(block.destroyed).toBe(false);
      });
    });

    it("should position blocks correctly in grid", () => {
      vi.mocked(isPointInside).mockReturnValue(true);

      const blocks = createInitialBlocks();

      // Check that blocks are positioned at expected grid positions
      const expectedPositions = new Set();
      for (let row = 0; row < GAME_CONFIG.BLOCK_ROWS; row++) {
        for (let col = 0; col < GAME_CONFIG.BLOCK_COLS; col++) {
          const x =
            col * GAME_CONFIG.BLOCK_SPACING_X + GAME_CONFIG.BLOCK_OFFSET_X;
          const y =
            row * GAME_CONFIG.BLOCK_SPACING_Y + GAME_CONFIG.BLOCK_OFFSET_Y;
          expectedPositions.add(`${x},${y}`);
        }
      }

      blocks.forEach((block) => {
        const position = `${block.x},${block.y}`;
        expect(expectedPositions.has(position)).toBe(true);
      });
    });

    it("should skip blocks outside boundary", () => {
      // Mock to return false for some positions
      vi.mocked(isPointInside).mockImplementation((x, y) => {
        // Simulate boundary that excludes some positions
        return x < 500 && y < 500;
      });

      const blocks = createInitialBlocks();

      // Should have fewer blocks than total grid positions
      expect(blocks.length).toBeLessThan(
        GAME_CONFIG.BLOCK_ROWS * GAME_CONFIG.BLOCK_COLS,
      );

      // All blocks should be within our simulated boundary
      blocks.forEach((block) => {
        expect(block.x).toBeLessThan(500);
        expect(block.y).toBeLessThan(500);
      });
    });

    it("should check all four corners of each block", () => {
      vi.mocked(isPointInside).mockReturnValue(true);

      createInitialBlocks();

      // Should call isPointInside 4 times per grid position
      const expectedCalls = GAME_CONFIG.BLOCK_ROWS * GAME_CONFIG.BLOCK_COLS * 4;
      expect(isPointInside).toHaveBeenCalledTimes(expectedCalls);
    });

    it("should only create blocks when all corners are inside boundary", () => {
      // Mock to return true for first 3 corner checks, false for 4th
      vi.mocked(isPointInside)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false) // 4th corner outside
        .mockReturnValue(true); // All subsequent calls return true

      const blocks = createInitialBlocks();

      // First block should be skipped due to one corner being outside
      // Remaining blocks should be created normally
      expect(blocks.length).toBeLessThan(
        GAME_CONFIG.BLOCK_ROWS * GAME_CONFIG.BLOCK_COLS,
      );
    });
  });
});
