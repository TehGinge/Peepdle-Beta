
import React from 'react';
import { MAX_GUESSES } from '../constants.ts';
import { getGuessStates } from '../utils/gameUtils.ts';
import { LetterState } from '../types.ts';
import { REVEAL_ANIMATION_DELAY } from '../constants.ts';

interface GridProps {
  guesses: string[];
  currentGuess: string;
  solution: string;
  isRevealing: boolean;
}

interface TileProps {
  letter: string;
  state: LetterState;
  isRevealing?: boolean;
  position?: number;
}

const Tile: React.FC<TileProps> = ({ letter, state, isRevealing, position = 0 }) => {
  const stateStyles = {
    empty: 'border-gray-300 dark:border-gray-700',
    tbd: 'border-gray-400 dark:border-gray-500 text-black dark:text-white',
    absent: 'bg-gray-500 dark:bg-[#3a3a3c] border-gray-500 dark:border-[#3a3a3c] text-white',
    correct: 'bg-green-500 dark:bg-green-600 border-green-500 dark:border-green-600 text-white',
    present: 'bg-yellow-400 dark:bg-yellow-500 border-yellow-400 dark:border-yellow-500 text-white',
  };
  
  const animationDelay = `${position * REVEAL_ANIMATION_DELAY}ms`;
  
  const classes = `
    w-full aspect-square
    border-2
    flex items-center justify-center
    font-bold text-2xl sm:text-3xl uppercase
    transition-all duration-300 transform
    rounded
    ${stateStyles[state]}
    ${isRevealing ? 'animate-reveal' : ''}
  `;

  return (
    <div 
        className={classes}
        style={{ animationDelay }}
    >
      {letter}
    </div>
  );
};


const Row: React.FC<{ word: string; states: LetterState[]; isRevealing?: boolean; }> = ({ word, states, isRevealing }) => {
  const wordLength = states.length;
  return (
    <div className="flex justify-center gap-1.5 w-full">
      {Array.from({ length: wordLength }).map((_, i) => (
        <div key={i} className="flex-1 max-w-[3rem] sm:max-w-[3.5rem]">
          <Tile 
            letter={word[i] || ''} 
            state={states[i]} 
            isRevealing={isRevealing} 
            position={i} 
          />
        </div>
      ))}
    </div>
  );
};


export const Grid: React.FC<GridProps> = ({ guesses, currentGuess, solution, isRevealing }) => {
  const emptyRowCount =
    guesses.length < MAX_GUESSES ? Math.max(0, MAX_GUESSES - guesses.length - 1) : 0;

  const emptyRows = emptyRowCount > 0 ? Array(emptyRowCount).fill(null) : [];

  return (
    <div className="flex flex-col gap-1.5 items-center w-full">
      {guesses.map((guess, i) => (
        <Row
          key={`guess-${i}`}
          word={guess}
          states={getGuessStates(guess, solution)}
          isRevealing={isRevealing && guesses.length - 1 === i}
        />
      ))}
      {guesses.length < MAX_GUESSES && (
        <Row
          key="current"
          word={currentGuess.padEnd(solution.length, ' ')}
          states={Array(solution.length).fill(currentGuess ? 'tbd' : 'empty')}
        />
      )}
      {emptyRows.map((_, i) => (
        <Row
          key={`empty-${i}`}
          word={' '.repeat(solution.length)}
          states={Array(solution.length).fill('empty')}
        />
      ))}
    </div>
  );
};