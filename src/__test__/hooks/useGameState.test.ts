import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { COMPLEX_BOUNDARY } from "../../constants/game";
import { useGameState } from "../../hooks/useGameState";

// Mock the game initialization utilities
vi.mock("../../utils/gameInit", () => ({
  createInitialBalls: vi.fn(),
  createInitialBlocks: vi.fn(),
}));

import { createInitialBalls, createInitialBlocks } from "../../utils/gameInit";

describe("useGameState hook", () => {
  const mockBalls = [
    { x: 100, y: 100, vx: 5, vy: 3, radius: 8 },
    { x: 200, y: 150, vx: -4, vy: 2, radius: 8 },
  ];

  const mockBlocks = [
    { x: 50, y: 50, width: 40, height: 14, destroyed: false },
    { x: 100, y: 50, width: 40, height: 14, destroyed: false },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createInitialBalls).mockReturnValue(mockBalls);
    vi.mocked(createInitialBlocks).mockReturnValue(mockBlocks);
  });

  it("should initialize with balls from createInitialBalls", () => {
    const { result } = renderHook(() => useGameState());

    expect(createInitialBalls).toHaveBeenCalledOnce();
    expect(result.current.balls).toBe(mockBalls);
  });

  it("should initialize with blocks from createInitialBlocks", () => {
    const { result } = renderHook(() => useGameState());

    expect(createInitialBlocks).toHaveBeenCalledOnce();
    expect(result.current.blocks).toBe(mockBlocks);
  });

  it("should initialize with complex boundary", () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.boundary).toBe(COMPLEX_BOUNDARY);
  });

  it("should return consistent game state structure", () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current).toHaveProperty("balls");
    expect(result.current).toHaveProperty("blocks");
    expect(result.current).toHaveProperty("boundary");

    expect(Array.isArray(result.current.balls)).toBe(true);
    expect(Array.isArray(result.current.blocks)).toBe(true);
    expect(Array.isArray(result.current.boundary)).toBe(true);
  });

  it("should only initialize once (not on re-render)", () => {
    const { result, rerender } = renderHook(() => useGameState());

    const initialBalls = result.current.balls;
    const initialBlocks = result.current.blocks;

    // Re-render the hook
    rerender();

    // Should return the same references (not re-initialize)
    expect(result.current.balls).toBe(initialBalls);
    expect(result.current.blocks).toBe(initialBlocks);

    // Creation functions should only be called once
    expect(createInitialBalls).toHaveBeenCalledOnce();
    expect(createInitialBlocks).toHaveBeenCalledOnce();
  });

  it("should handle empty initialization gracefully", () => {
    vi.mocked(createInitialBalls).mockReturnValue([]);
    vi.mocked(createInitialBlocks).mockReturnValue([]);

    const { result } = renderHook(() => useGameState());

    expect(result.current.balls).toEqual([]);
    expect(result.current.blocks).toEqual([]);
    expect(result.current.boundary).toBe(COMPLEX_BOUNDARY);
  });

  it("should preserve mutable state in returned objects", () => {
    const { result } = renderHook(() => useGameState());

    // Modify ball position (simulating game physics)
    const firstBall = result.current.balls[0];
    if (firstBall) {
      const originalX = firstBall.x;
      firstBall.x = 999;
      expect(firstBall.x).toBe(999);
      expect(firstBall.x).not.toBe(originalX);
    }

    // Modify block state (simulating destruction)
    const firstBlock = result.current.blocks[0];
    if (firstBlock) {
      expect(firstBlock.destroyed).toBe(false);
      firstBlock.destroyed = true;
      expect(firstBlock.destroyed).toBe(true);
    }
  });
});
