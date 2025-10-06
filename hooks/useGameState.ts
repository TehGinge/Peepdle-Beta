
import { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, Quote, ToastMessage } from '../types';
import { fetchQuotes, getNewSolution, getSolutionById } from '../services/quotes';
import { MAX_GUESSES, DEFAULT_MAX_WORD_LENGTH, REVEAL_ANIMATION_DELAY, INITIAL_HINT_TOKENS, INITIAL_SKIPS } from '../constants';
import { getLetterStatuses, getGuessStates } from '../utils/gameUtils';

const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

export const useGameState = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [solution, setSolution] = useState('');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [originalWord, setOriginalWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameState, setGameState] = useState<GameStatus>('PLAYING');
  const [isRevealing, setIsRevealing] = useState(false);
  
  const [winStreak, setWinStreak] = useLocalStorage('winStreak', 0);
  const [personalBest, setPersonalBest] = useLocalStorage('personalBest', 0);
  const [skips, setSkips] = useLocalStorage('skips', INITIAL_SKIPS);
  const [hintTokens, setHintTokens] = useLocalStorage('hintTokens', INITIAL_HINT_TOKENS);
  const [maxWordLength, setMaxWordLength] = useLocalStorage('maxWordLength', DEFAULT_MAX_WORD_LENGTH);
  const [gamesWon, setGamesWon] = useLocalStorage('gamesWon', 0);
  const [isUnlimitedMode, setIsUnlimitedMode] = useLocalStorage('isUnlimitedMode', false);
  const [isHardMode, setIsHardMode] = useLocalStorage('isHardMode', false);
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', window.matchMedia('(prefers-color-scheme: dark)').matches);

  const [hints, setHints] = useState({
    person: { revealed: false, value: '' },
    episode: { revealed: false, value: '' }
  });
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastId = useRef(0);

  const addToast = useCallback((message: string) => {
    const id = toastId.current++;
    setToasts(prev => [...prev, { id, message }]);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  const startNewGame = useCallback((newMaxLength?: number) => {
    // When starting a new game (e.g., via "Next Word"), ensure any puzzle ID is cleared from the URL.
    if (window.location.search.includes('puzzle=')) {
        console.log("Starting new game, clearing puzzle ID from URL.");
        window.history.pushState({}, '', window.location.pathname);
    } else {
        console.log("Starting new random game.");
    }

    const wordLength = newMaxLength || maxWordLength;
    const { solution: newSolution, quote: newQuote, originalWord: newOriginalWord } = getNewSolution(wordLength);
    setSolution(newSolution);
    setQuote(newQuote);
    setOriginalWord(newOriginalWord);
    setGuesses([]);
    setCurrentGuess('');
    setGameState('PLAYING');
    setHints({
      person: { revealed: false, value: newQuote.person },
      episode: { revealed: false, value: newQuote.episode }
    });
  }, [maxWordLength]);
  
  useEffect(() => {
    const initializeGame = async () => {
      const quotesLoaded = await fetchQuotes();
      if (!quotesLoaded) {
        addToast("Error: Could not load game data.");
        setIsLoading(false); // Stop loading, show error.
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const puzzleId = urlParams.get('puzzle');

      if (puzzleId) {
        console.log(`URL contains puzzle ID: "${puzzleId}". Attempting to load specific game.`);
        const specificSolution = getSolutionById(puzzleId, maxWordLength);
        
        if (specificSolution) {
          console.log(`Successfully loaded puzzle for ID "${puzzleId}".`);
          const { solution: newSolution, quote: newQuote, originalWord: newOriginalWord } = specificSolution;
          setSolution(newSolution);
          setQuote(newQuote);
          setOriginalWord(newOriginalWord);
          setGuesses([]);
          setCurrentGuess('');
          setGameState('PLAYING');
          setHints({
            person: { revealed: false, value: newQuote.person },
            episode: { revealed: false, value: newQuote.episode }
          });
        } else {
          console.warn(`Failed to load puzzle for ID "${puzzleId}". It might be invalid or have no suitable words for your settings. Starting a random game instead.`);
          addToast('Invalid puzzle link. Starting a random game.');
          // Clear the bad URL param and start a random game
          window.history.pushState({}, '', window.location.pathname);
          startNewGame();
        }
      } else {
        console.log("No puzzle ID in URL. Starting a random game.");
        startNewGame();
      }
      setIsLoading(false);
    };

    initializeGame();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSettingChange = (setter: (value: boolean | ((val: boolean) => boolean)) => void, value: boolean) => {
    setter(value);
    setWinStreak(0);
    addToast('Settings changed. Streak reset!');
  };

  const toggleUnlimitedMode = (value: boolean) => handleSettingChange(setIsUnlimitedMode, value);
  const toggleHardMode = (value: boolean) => handleSettingChange(setIsHardMode, value);
  const toggleDarkMode = (value: boolean) => setIsDarkMode(value);

  const useHint = (type: 'person' | 'episode') => {
    if (gameState !== 'PLAYING' || hints[type].revealed) return;
    
    if (hintTokens > 0) {
        setHintTokens(h => h - 1);
        setHints(prev => ({
          ...prev,
          [type]: { ...prev[type], revealed: true }
        }));
    } else {
        addToast("You're out of hints!");
    }
  };

  const useSkip = () => {
    if (gameState !== 'PLAYING') return;
    
    if (isUnlimitedMode) {
      addToast(`Word was: ${solution.toUpperCase()}.`);
      startNewGame();
    } else if (skips > 0) {
      setSkips(s => s - 1);
      addToast(`Word was: ${solution.toUpperCase()}.`);
      startNewGame();
    } else {
        addToast("You're out of skips!");
    }
  };

  const giveUp = () => {
    if (gameState === 'PLAYING') {
      setGameState('LOST');
      setWinStreak(0);
      setSkips(INITIAL_SKIPS);
      setHintTokens(INITIAL_HINT_TOKENS);
      addToast('Streak, hints, and skips have been reset.');
    }
  };

  const handleKeyPress = useCallback((key: string) => {
    if (gameState !== 'PLAYING' || isRevealing) return;
    
    if (key.toLowerCase() === 'enter') {
      if (currentGuess.length !== solution.length) {
        addToast('Not enough letters');
        return;
      }

      // Hard Mode validation
      if (isHardMode && guesses.length > 0) {
        const lastGuess = guesses[guesses.length - 1];
        const lastGuessStates = getGuessStates(lastGuess, solution);
        
        // Check for correct letters (must be in the same spot)
        for (let i = 0; i < lastGuess.length; i++) {
          if (lastGuessStates[i] === 'correct' && currentGuess[i] !== lastGuess[i]) {
            addToast(`Letter ${i + 1} must be '${lastGuess[i].toUpperCase()}'`);
            return;
          }
        }
        
        // Check for present letters (must be included somewhere)
        const presentLetters = lastGuess.split('').filter((_, i) => lastGuessStates[i] === 'present');
        const currentGuessLetters = currentGuess.split('');
        for (const letter of presentLetters) {
            const index = currentGuessLetters.findIndex(l => l === letter);
            if (index === -1) {
                addToast(`Guess must contain '${letter.toUpperCase()}'`);
                return;
            }
            // To handle duplicate letters correctly, remove the found letter from a copy
            currentGuessLetters.splice(index, 1);
        }
      }
      
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess('');
      setIsRevealing(true);

      setTimeout(() => {
        setIsRevealing(false);

        if (currentGuess === solution) {
          setGameState('WON');
          const newWinStreak = winStreak + 1;
          setWinStreak(newWinStreak);
          if (newWinStreak > personalBest) {
            setPersonalBest(newWinStreak);
          }
          const newGamesWon = gamesWon + 1;
          setGamesWon(newGamesWon);
          if (!isUnlimitedMode && newGamesWon > 0 && newGamesWon % 4 === 0 && skips < 5) {
             setSkips(s => Math.min(s + 1, 5));
             addToast('You earned a skip!');
          }
          if (newGamesWon > 0 && newGamesWon % 2 === 0) {
            setHintTokens(h => h + 1);
            addToast('You earned a hint!');
          }
        } else if (newGuesses.length === MAX_GUESSES) {
          setGameState('LOST');
          setWinStreak(0);
        }
      }, solution.length * REVEAL_ANIMATION_DELAY);
      return;
    }

    if (key.toLowerCase() === 'backspace') {
      setCurrentGuess(prev => prev.slice(0, -1));
      return;
    }

    if (/^[a-zA-Z]$/.test(key)) {
      if (currentGuess.length < solution.length) {
        setCurrentGuess(prev => prev + key.toLowerCase());
      }
    }
  }, [gameState, currentGuess, solution, guesses, winStreak, skips, gamesWon, isRevealing, personalBest, addToast, setSkips, setGamesWon, setWinStreak, setPersonalBest, isHardMode, isUnlimitedMode, hintTokens, setHintTokens, startNewGame]);

  const letterStatuses = getLetterStatuses(guesses, solution);
  
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const maskedQuote = quote && originalWord
    ? quote.quote.replace(new RegExp(escapeRegExp(originalWord), 'i'), '_'.repeat(solution.length))
    : '';

  return {
    isLoading,
    gameState,
    solution,
    quote,
    originalWord,
    maskedQuote,
    guesses,
    currentGuess,
    hints,
    hintTokens,
    skips,
    winStreak,
    personalBest,
    maxWordLength,
    isRevealing,
    letterStatuses,
    toasts,
    addToast,
    removeToast,
    handleKeyPress,
    startNewGame,
    giveUp,
    useHint,
    useSkip,
    setMaxWordLength,
    isUnlimitedMode,
    isHardMode,
    isDarkMode,
    toggleUnlimitedMode,
    toggleHardMode,
    toggleDarkMode,
  };
};