export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  destroyed: boolean;
}

export type Boundary = Array<[number, number]>;

export interface GameState {
  balls: Ball[];
  blocks: Block[];
  boundary: Boundary;
}
