
export enum GameState {
  Start = 'start',
  Loading = 'loading',
  Playing = 'playing',
  GameOver = 'gameOver',
  Error = 'error',
}

export interface StorySegment {
  scene?: string;
  choice?: string;
}

export interface GeminiResponse {
  scene: string;
  choices: string[];
  isGameOver: boolean;
}
