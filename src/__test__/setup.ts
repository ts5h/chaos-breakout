import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Tone.js for tests
global.AudioContext = class MockAudioContext {
  createOscillator() {
    return {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 0 },
    };
  }
  createGain() {
    return {
      connect: vi.fn(),
      gain: { value: 0 },
    };
  }
  destination: {};
} as any;

// Mock window.requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) =>
  setTimeout(callback, 16);

global.cancelAnimationFrame = (id: number) => clearTimeout(id);

// Mock HTMLCanvasElement methods
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  createImageData: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  canvas: { width: 1200, height: 1200 },
}));
