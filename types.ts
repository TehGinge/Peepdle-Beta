
export interface Quote {
  quote: string;
  person: string;
  episode: string;
  image: string | null;
  id: string;
  episode_quote_sequence: string;
  global_quote_sequence: string;
}

export type LetterState = 'correct' | 'present' | 'absent' | 'empty' | 'tbd';

export type GameStatus = 'PLAYING' | 'WON' | 'LOST';

export type LetterStatuses = { [key: string]: LetterState };

export interface ToastMessage {
  id: number;
  message: string;
}