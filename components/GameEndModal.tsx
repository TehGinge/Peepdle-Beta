import React from 'react';
import { GameStatus, Quote, LetterState } from '../types';
import { getGuessStates } from '../utils/gameUtils';
import { ShareIcon, LinkIcon } from './Icons';
import { MAX_GUESSES } from '../constants';

interface GameEndModalProps {
  isOpen: boolean;
  status: GameStatus;
  solution: string;
  originalWord: string;
  quote: Quote | null;
  winStreak: number;
  personalBest: number;
  onNewGame: () => void;
  guesses: string[];
  addToast: (message: string) => void;
}

const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

interface QuoteDisplayProps {
    quote: string;
    wordToHighlight: string;
    status: GameStatus;
}

const QuoteDisplay: React.FC<QuoteDisplayProps> = ({ quote, wordToHighlight, status }) => {
    const parts = quote.split(new RegExp(`(${escapeRegExp(wordToHighlight)})`, 'i'));
    
    const highlightClass = status === 'WON' 
        ? 'text-green-500 dark:text-green-400'
        : 'text-red-500 dark:text-red-600';

    return (
        <p className="text-base text-center italic text-slate-600 dark:text-slate-300">
            "
            {parts.map((part, i) => {
                if (part.toLowerCase() === wordToHighlight.toLowerCase()) {
                    return (
                        <span key={i} className={`font-bold not-italic uppercase ${highlightClass}`}>
                            {part}
                        </span>
                    );
                }
                return part;
            })}
            "
        </p>
    );
};

const ShareableTile: React.FC<{ state: LetterState }> = ({ state }) => {
    const stateStyle = {
        correct: 'bg-green-600',
        present: 'bg-yellow-500',
        absent: 'bg-[#3a3a3c]',
    }[state as 'correct' | 'present' | 'absent'] || 'bg-[#3a3a3c]';

    return <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded ${stateStyle}`}></div>
};

const ShareableGrid: React.FC<{ guesses: string[], solution: string }> = ({ guesses, solution }) => {
    if (!guesses.length) return null;

    return (
        <div className="flex flex-col gap-1 items-center my-2">
            {guesses.map((guess, i) => {
                const states = getGuessStates(guess, solution);
                return (
                    <div key={i} className="flex gap-1">
                        {states.map((state, j) => (
                            <ShareableTile key={j} state={state} />
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

export const GameEndModal: React.FC<GameEndModalProps> = ({ isOpen, status, solution, originalWord, quote, winStreak, personalBest, onNewGame, guesses, addToast }) => {
  if (!isOpen || !quote) return null;

  const gifUrl = status === 'WON' 
    ? 'https://peepdle.uk/images/johnson-win.gif'
    : 'https://peepdle.uk/images/mark-lose.gif';

  const altText = status === 'WON' 
    ? 'Johnson from Peep Show celebrating a win' 
    : 'Mark from Peep Show looking disappointed after a loss';
  
  const handleShareLink = () => {
    if (!quote) return;
    const url = `${window.location.origin}${window.location.pathname}#quote=${quote.id}`;
    navigator.clipboard.writeText(url).then(() => {
      addToast('Copied link to clipboard!');
    }).catch(err => {
      addToast('Could not copy link.');
      console.error('Failed to copy text: ', err);
    });
  };
  
  const handleShareResult = () => {
    if (!quote) return;

    const emojiGrid = guesses
      .map(guess => {
        const states = getGuessStates(guess, solution);
        return states
          .map(state => {
            if (state === 'correct') return '🟩';
            if (state === 'present') return '🟨';
            return '⬛';
          })
          .join('');
      })
      .join('\n');

    const resultText = `Peepdle #${quote.id} ${status === 'WON' ? guesses.length : 'X'}/${MAX_GUESSES}\n\n${emojiGrid}`;

    navigator.clipboard.writeText(resultText).then(() => {
      addToast('Copied results to clipboard!');
    }).catch(err => {
      addToast('Could not copy results.');
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-40 flex justify-center items-center p-4 animate-toast-in overflow-y-auto">
      <div className="bg-white dark:bg-[#212121] rounded-lg shadow-xl w-full max-w-sm mx-auto border border-gray-300 dark:border-gray-700 flex flex-col items-center p-6 space-y-4 my-auto">
        
        <h2 className={`text-3xl font-bold uppercase tracking-wider ${status === 'WON' ? 'text-green-500 dark:text-green-400' : 'text-slate-500'}`}>
          {status === 'WON' ? 'You Won!' : 'The word was'}
        </h2>

        {status === 'LOST' && (
          <p className="text-4xl font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 pb-2">
            {solution}
          </p>
        )}
        
        <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <img src={gifUrl} alt={altText} className="w-full h-full object-cover rounded-lg" />
        </div>
        
        <div className="flex justify-around w-full max-w-xs py-2">
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{winStreak}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 tracking-wider">WIN STREAK</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{personalBest}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 tracking-wider">PERSONAL BEST</p>
          </div>
        </div>

        <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>

        <div className="text-center space-y-3 w-full">
            <ShareableGrid guesses={guesses} solution={solution} />
            <QuoteDisplay quote={quote.quote} wordToHighlight={originalWord} status={status} />
            <p className="text-sm text-gray-500 dark:text-gray-400">
                - {quote.person}, {quote.episode}
            </p>
        </div>
        
        <div className="w-full flex flex-col gap-2 mt-2">
            <div className="flex gap-2">
                <button
                  onClick={handleShareLink}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  aria-label="Copy challenge link"
                >
                  <LinkIcon /> COPY LINK
                </button>
                <button
                  onClick={handleShareResult}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  aria-label="Copy game results"
                >
                  <ShareIcon /> COPY RESULT
                </button>
            </div>
            <button
              onClick={onNewGame}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 dark:bg-gray-600 text-white font-bold rounded-lg dark:hover:bg-gray-500 transition-colors"
            >
              NEXT WORD
            </button>
        </div>
      </div>
    </div>
  );
};