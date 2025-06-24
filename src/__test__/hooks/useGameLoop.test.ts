import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGameLoop } from "../../hooks/useGameLoop";
import type { GameState } from "../../types/game";

// Mock the physics utilities
vi.mock("../../utils/physics", () => ({
  handleBallToBallCollision: vi.fn(),
  handleBlockCollision: vi.fn(),
  handleBoundaryCollision: vi.fn(),
  updateBallPosition: vi.fn(),
}));

// Mock the renderer utilities
vi.mock("../../utils/renderer", () => ({
  clearCanvas: vi.fn(),
  drawBalls: vi.fn(),
  drawBlocks: vi.fn(),
}));

import {
  handleBallToBallCollision,
  handleBlockCollision,
  handleBoundaryCollision,
  updateBallPosition,
} from "../../utils/physics";
import { clearCanvas, drawBalls, drawBlocks } from "../../utils/renderer";

describe("useGameLoop hook", () => {
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;
  let mockCanvasRef: React.RefObject<HTMLCanvasElement>;
  let mockGameState: GameState;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock canvas and context
    mockContext = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    } as any;

    mockCanvas = {
      getContext: vi.fn().mockReturnValue(mockContext),
      width: 1200,
      height: 1200,
    } as any;

    mockCanvasRef = { current: mockCanvas };

    mockGameState = {
      balls: [
        { x: 100, y: 100, vx: 5, vy: 3, radius: 8 },
        { x: 200, y: 150, vx: -4, vy: 2, radius: 8 },
      ],
      blocks: [
        { x: 50, y: 50, width: 40, height: 14, destroyed: false },
        { x: 100, y: 50, width: 40, height: 14, destroyed: false },
      ],
      boundary: [
        [0, 0],
        [100, 0],
        [100, 100],
        [0, 100],
      ],
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should perform initial rendering on mount", () => {
    renderHook(() => useGameLoop(mockCanvasRef, mockGameState, false));

    expect(clearCanvas).toHaveBeenCalledWith(mockContext);
    expect(drawBalls).toHaveBeenCalledWith(mockContext, mockGameState.balls);
    expect(drawBlocks).toHaveBeenCalledWith(mockContext, mockGameState.blocks);
  });

  it("should not draw balls when paused during initial render", () => {
    renderHook(() => useGameLoop(mockCanvasRef, mockGameState, true));

    expect(clearCanvas).toHaveBeenCalledWith(mockContext);
    expect(drawBalls).not.toHaveBeenCalled();
    expect(drawBlocks).toHaveBeenCalledWith(mockContext, mockGameState.blocks);
  });

  it("should handle case when canvas is not available", () => {
    const nullCanvasRef = { current: null };

    expect(() => {
      renderHook(() => useGameLoop(nullCanvasRef, mockGameState, false));
    }).not.toThrow();

    expect(clearCanvas).not.toHaveBeenCalled();
  });

  it("should handle case when context is not available", () => {
    const canvasWithoutContext = {
      getContext: vi.fn().mockReturnValue(null),
    } as any;
    const canvasRef = { current: canvasWithoutContext };

    expect(() => {
      renderHook(() => useGameLoop(canvasRef, mockGameState, false));
    }).not.toThrow();

    expect(clearCanvas).not.toHaveBeenCalled();
  });

  it("should call physics updates when not paused", async () => {
    renderHook(() => useGameLoop(mockCanvasRef, mockGameState, false));

    // Wait for animation frame
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Verify physics functions are called for each ball
    expect(updateBallPosition).toHaveBeenCalledTimes(2);
    expect(handleBoundaryCollision).toHaveBeenCalledTimes(2);
    expect(handleBlockCollision).toHaveBeenCalledTimes(2);
    expect(handleBallToBallCollision).toHaveBeenCalledWith(mockGameState.balls);
  });

  it("should not call physics updates when paused", async () => {
    renderHook(() => useGameLoop(mockCanvasRef, mockGameState, true));

    // Wait for animation frame
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Physics functions should not be called when paused
    expect(updateBallPosition).not.toHaveBeenCalled();
    expect(handleBoundaryCollision).not.toHaveBeenCalled();
    expect(handleBlockCollision).not.toHaveBeenCalled();
    expect(handleBallToBallCollision).not.toHaveBeenCalled();
  });

  it("should update game loop when isPaused changes", () => {
    const { rerender } = renderHook(
      ({ isPaused }) => useGameLoop(mockCanvasRef, mockGameState, isPaused),
      { initialProps: { isPaused: true } },
    );

    // Initially paused - clear previous calls
    vi.clearAllMocks();

    // Change to not paused
    rerender({ isPaused: false });

    // Should re-render with balls visible
    expect(clearCanvas).toHaveBeenCalledWith(mockContext);
    expect(drawBalls).toHaveBeenCalledWith(mockContext, mockGameState.balls);
    expect(drawBlocks).toHaveBeenCalledWith(mockContext, mockGameState.blocks);
  });

  it("should update game loop when gameState changes", () => {
    const newGameState = {
      ...mockGameState,
      balls: [{ x: 300, y: 300, vx: 2, vy: 1, radius: 8 }],
    };

    const { rerender } = renderHook(
      ({ gameState }) => useGameLoop(mockCanvasRef, gameState, false),
      { initialProps: { gameState: mockGameState } },
    );

    // Clear previous calls
    vi.clearAllMocks();

    // Change game state
    rerender({ gameState: newGameState });

    // Should re-render with new game state
    expect(clearCanvas).toHaveBeenCalledWith(mockContext);
    expect(drawBalls).toHaveBeenCalledWith(mockContext, newGameState.balls);
    expect(drawBlocks).toHaveBeenCalledWith(mockContext, newGameState.blocks);
  });

  it("should cleanup animation frame on unmount", () => {
    const cancelAnimationFrameSpy = vi.spyOn(global, "cancelAnimationFrame");

    const { unmount } = renderHook(() =>
      useGameLoop(mockCanvasRef, mockGameState, false),
    );

    unmount();

    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
  });

  it("should handle physics updates correctly for individual balls", async () => {
    renderHook(() => useGameLoop(mockCanvasRef, mockGameState, false));

    // Wait for animation frame
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Verify each ball gets updated individually
    mockGameState.balls.forEach((ball, index) => {
      expect(updateBallPosition).toHaveBeenNthCalledWith(index + 1, ball);
      expect(handleBoundaryCollision).toHaveBeenNthCalledWith(
        index + 1,
        ball,
        mockGameState.boundary,
      );
      expect(handleBlockCollision).toHaveBeenNthCalledWith(
        index + 1,
        ball,
        mockGameState.blocks,
      );
    });
  });

  it("should render blocks regardless of pause state", () => {
    const { rerender } = renderHook(
      ({ isPaused }) => useGameLoop(mockCanvasRef, mockGameState, isPaused),
      { initialProps: { isPaused: false } },
    );

    expect(drawBlocks).toHaveBeenCalledWith(mockContext, mockGameState.blocks);

    vi.clearAllMocks();

    rerender({ isPaused: true });

    expect(drawBlocks).toHaveBeenCalledWith(mockContext, mockGameState.blocks);
  });
});
