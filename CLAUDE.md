# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server with hot module replacement
- `pnpm build` - Build for production (runs TypeScript compiler then Vite build)
- `pnpm lint` - Check code with Biome linter
- `pnpm lint:fix` - Fix auto-fixable linting issues with Biome
- `pnpm format` - Format code with Biome formatter
- `pnpm preview` - Preview production build locally
- `pnpm test` - Run test suite with Vitest
- `pnpm test:ui` - Run tests with UI interface
- `pnpm test:coverage` - Run tests with coverage report

## Project Architecture

This is a chaos-style breakout game built with React, TypeScript, and Canvas API. The codebase follows a modular architecture with clear separation of concerns.

### Game Architecture

The game uses a custom hook-based architecture:

- **useGameState**: Manages immutable game state (balls, blocks, boundary)
- **useGameLoop**: Handles the animation loop, physics updates, and rendering with pause functionality
- **GameCanvas**: React component that owns the canvas and coordinates the game
- **Game Start**: Game starts paused on load, begins when user clicks anywhere on screen

### Physics System

The physics system implements chaotic ball behavior:
- Ball reflection includes 10° random angle variation (`REFLECTION_ANGLE_VARIATION`)
- Boundary collision uses ray-casting algorithm for complex polygon shapes
- Axis-based collision detection prevents balls from getting stuck in walls
- Corner collisions add additional randomness (0.8-1.2x speed multiplier)
- Ball-to-ball collisions use elastic collision physics with constant speed enforcement
- Multiple balls (5 by default) start at random positions within the boundary

### Sound System

The game uses Tone.js for immersive audio feedback:
- FM synthesis (fmsine4) for rich harmonic collision sounds
- Ultra-low bass frequencies (10-50 Hz after 0.5x multiplier)
- 4-second reverb effect with 50% wet signal for atmospheric depth
- Collision timing prevention system (0.001s minimum gap between triggers)
- Plays on wall collisions, ball-to-ball collisions, and block hits
- Audio context initialized on first user interaction (click or keypress)
- Fast attack (0.001s) with extended release (1s) envelope

### Game Configuration

All game parameters are centralized in `src/constants/game.ts`:
- Canvas dimensions: 1200x1200
- Ball count: 5 (configurable via `BALL_COUNT`)
- Ball speed: 15 (fast)
- Complex boundary defined as static coordinate array
- Block layout: 15x20 grid with 45x20 spacing (block size: 40x14)
- Background image support

### Code Organization

```
src/
├── types/          # TypeScript interfaces (Ball, Block, GameState)
├── constants/      # Game configuration and boundary coordinates  
├── utils/          # Pure functions (physics, rendering, initialization, sound)
├── hooks/          # React hooks for state and game loop management
└── components/     # React components (just GameCanvas)
```

### Styling and Tooling

- **Biome**: Used for linting and formatting (replaces ESLint)
- **SCSS**: Enabled via Sass package, files use .scss extension
- **TypeScript**: Strict mode enabled
- **pnpm**: Package manager with lockfile

### Key Design Decisions

1. **Mutable State in Hooks**: Game objects (balls, blocks) are intentionally mutable for performance in animation loops
2. **Static Boundary**: Complex polygon defined as fixed coordinates rather than generated shapes
3. **Chaos Physics**: Intentional unpredictability through angle variation and randomized corner bounces
4. **No User Input**: Fully automated gameplay with no paddle or controls
5. **Multiple Balls**: 5 balls with random starting positions create more dynamic gameplay
6. **Constant Speed**: Ball speeds are enforced to remain constant after all collisions
7. **Click to Start**: Game loads in paused state with balls hidden, starts on first click