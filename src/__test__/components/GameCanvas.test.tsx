import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GameCanvas } from "../../components/GameCanvas";
import { GAME_CONFIG } from "../../constants/game";

// Mock the hooks
vi.mock("../../hooks/useGameState", () => ({
  useGameState: vi.fn(),
}));

vi.mock("../../hooks/useGameLoop", () => ({
  useGameLoop: vi.fn(),
}));

// Mock the sound utilities
vi.mock("../../utils/sound", () => ({
  initializeAudio: vi.fn(),
}));

// Mock the background image import
vi.mock("../../assets/background.jpg", () => ({
  default: "mock-background.jpg",
}));

import { useGameLoop } from "../../hooks/useGameLoop";
import { useGameState } from "../../hooks/useGameState";
import { initializeAudio } from "../../utils/sound";

describe("GameCanvas component", () => {
  const mockGameState = {
    balls: [{ x: 100, y: 100, vx: 5, vy: 3, radius: 8 }],
    blocks: [{ x: 50, y: 50, width: 40, height: 14, destroyed: false }],
    boundary: [
      [0, 0],
      [100, 0],
      [100, 100],
      [0, 100],
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGameState).mockReturnValue(mockGameState);
    vi.mocked(useGameLoop).mockImplementation(() => {});
    vi.mocked(initializeAudio).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render canvas with correct dimensions", () => {
    render(<GameCanvas />);

    const canvas = document.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute("width", GAME_CONFIG.WIDTH.toString());
    expect(canvas).toHaveAttribute("height", GAME_CONFIG.HEIGHT.toString());
  });

  it("should render container with correct dimensions", () => {
    render(<GameCanvas />);

    const container = document.querySelector(
      'div[style*="position: relative"]',
    );
    expect(container).toHaveStyle({
      width: `${GAME_CONFIG.WIDTH}px`,
      height: `${GAME_CONFIG.HEIGHT}px`,
      position: "relative",
    });
  });

  it("should render background image", () => {
    render(<GameCanvas />);

    const backgroundDiv = document.querySelector(
      'div[style*="background-image"]',
    );
    expect(backgroundDiv).toHaveStyle({
      backgroundImage: "url(mock-background.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      position: "absolute",
      zIndex: "0",
    });
  });

  it("should initialize with game paused", () => {
    render(<GameCanvas />);

    expect(useGameLoop).toHaveBeenCalledWith(
      expect.objectContaining({ current: expect.any(HTMLElement) }),
      mockGameState,
      true, // isPaused should be true initially
    );
  });

  it("should call useGameState hook", () => {
    render(<GameCanvas />);

    expect(useGameState).toHaveBeenCalledOnce();
  });

  it("should initialize audio and unpause on click", async () => {
    render(<GameCanvas />);

    // Click anywhere on the document
    await act(async () => {
      fireEvent.click(document);
      await vi.waitFor(() => {
        expect(initializeAudio).toHaveBeenCalledOnce();
      });
    });

    // Check that game is unpaused after click
    expect(useGameLoop).toHaveBeenLastCalledWith(
      expect.objectContaining({ current: expect.any(HTMLElement) }),
      mockGameState,
      false, // isPaused should be false after click
    );
  });

  it("should initialize audio and unpause on keydown", async () => {
    render(<GameCanvas />);

    // Press any key
    await act(async () => {
      fireEvent.keyDown(document, { key: "Space" });
      await vi.waitFor(() => {
        expect(initializeAudio).toHaveBeenCalledOnce();
      });
    });

    // Check that game is unpaused after keydown
    expect(useGameLoop).toHaveBeenLastCalledWith(
      expect.objectContaining({ current: expect.any(HTMLElement) }),
      mockGameState,
      false, // isPaused should be false after keydown
    );
  });

  it("should remove event listeners after first interaction", async () => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    render(<GameCanvas />);

    // Verify listeners were added
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "click",
      expect.any(Function),
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );

    // Trigger interaction
    await act(async () => {
      fireEvent.click(document);
      // Wait for interaction to be processed
      await vi.waitFor(() => {
        expect(initializeAudio).toHaveBeenCalled();
      });
    });

    // Verify listeners were removed
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "click",
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );
  });

  it("should cleanup event listeners on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = render(<GameCanvas />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "click",
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );
  });

  it("should pass canvas ref to useGameLoop", () => {
    render(<GameCanvas />);

    const gameLoopCall = vi.mocked(useGameLoop).mock.calls[0];
    const canvasRef = gameLoopCall[0];

    expect(canvasRef).toBeDefined();
    expect(canvasRef.current).toBeInstanceOf(HTMLCanvasElement);
  });

  it("should only trigger interaction once per session", async () => {
    render(<GameCanvas />);

    // First click
    await act(async () => {
      fireEvent.click(document);
      await vi.waitFor(() => expect(initializeAudio).toHaveBeenCalledOnce());
    });

    // Second click should not trigger audio initialization again
    fireEvent.click(document);

    // Should still only be called once
    expect(initializeAudio).toHaveBeenCalledOnce();
  });

  it("should handle mixed interaction types correctly", async () => {
    render(<GameCanvas />);

    // First keydown
    await act(async () => {
      fireEvent.keyDown(document, { key: "Enter" });
      await vi.waitFor(() => expect(initializeAudio).toHaveBeenCalledOnce());
    });

    // Subsequent click should not trigger again
    fireEvent.click(document);

    // Should still only be called once
    expect(initializeAudio).toHaveBeenCalledOnce();
  });
});
