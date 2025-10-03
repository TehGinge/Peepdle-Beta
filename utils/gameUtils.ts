
import { LetterState, LetterStatuses } from '../types';

export const getLetterStatuses = (guesses: string[], solution: string): LetterStatuses => {
  const statuses: LetterStatuses = {};
  const solutionChars = solution.split('');

  guesses.forEach(guess => {
    guess.split('').forEach((letter, i) => {
      if (solutionChars[i] === letter) {
        statuses[letter] = 'correct';
      } else if (solutionChars.includes(letter) && statuses[letter] !== 'correct') {
        statuses[letter] = 'present';
      } else if (!solutionChars.includes(letter)) {
        statuses[letter] = 'absent';
      }
    });
  });

  return statuses;
};

export const getGuessStates = (guess: string, solution: string): LetterState[] => {
    const solutionChars = solution.split('');
    const guessChars = guess.split('');
    const states: LetterState[] = Array(solution.length).fill('absent');
    const solutionCharCounts: { [key: string]: number } = {};

    solutionChars.forEach(char => {
        solutionCharCounts[char] = (solutionCharCounts[char] || 0) + 1;
    });

    // First pass for correct letters
    guessChars.forEach((letter, i) => {
        if (solutionChars[i] === letter) {
            states[i] = 'correct';
            solutionCharCounts[letter]--;
        }
    });

    // Second pass for present letters
    guessChars.forEach((letter, i) => {
        if (states[i] !== 'correct' && solutionChars.includes(letter) && solutionCharCounts[letter] > 0) {
            states[i] = 'present';
            solutionCharCounts[letter]--;
        }
    });

    return states;
};
