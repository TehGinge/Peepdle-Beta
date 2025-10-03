

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Grid } from './components/Grid';
import { Keyboard } from './components/Keyboard';
import { useGameState } from './hooks/useGameState';
import { ToastContainer, Toast } from './components/Toast';
import { GameEndModal } from './components/GameEndModal';
import { SettingsModal } from './components/SettingsModal';
import { InfoModal } from './components/InfoModal';
import { InfoIcon, SettingsIcon, CharacterIcon, EpisodeIcon, GiveUpIcon, SkipIcon } from './components/Icons';

const App: React.FC = () => {
  const {
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
    useHint,
    useSkip,
    giveUp,
    setMaxWordLength,
    isUnlimitedMode,
    isHardMode,
    isDarkMode,
    toggleUnlimitedMode,
    toggleHardMode,
    toggleDarkMode,
  } = useGameState();

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isSkipAnimating, setIsSkipAnimating] = useState(false);
  const prevSkipsRef = useRef(skips);
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleStartNewGame = useCallback(() => {
    startNewGame();
  }, [startNewGame]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || isSettingsModalOpen || isInfoModalOpen) {
        return;
      }
      if (gameState === 'PLAYING') {
        handleKeyPress(e.key);
      } else if ((gameState === 'WON' || gameState === 'LOST') && e.key === 'Enter') {
        handleStartNewGame();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [gameState, handleKeyPress, handleStartNewGame, isInfoModalOpen, isSettingsModalOpen]);

  useEffect(() => {
    if (skips > prevSkipsRef.current && !isUnlimitedMode) {
      setIsSkipAnimating(true);
      const timer = setTimeout(() => setIsSkipAnimating(false), 500); // Duration of the pop animation
      return () => clearTimeout(timer);
    }
    prevSkipsRef.current = skips;
  }, [skips, isUnlimitedMode]);

  return (
    <div className="flex flex-col h-screen max-h-[100dvh] items-center justify-between p-2 sm:p-4 font-sans">
      <ToastContainer>
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} onClose={() => removeToast(toast.id)} />
        ))}
      </ToastContainer>
      
      <header className="flex items-center justify-between w-full max-w-lg mx-auto p-2 relative flex-shrink-0">
          <div className="flex items-center gap-4">
              <button onClick={() => setIsInfoModalOpen(true)} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                <InfoIcon />
              </button>
              <div className="text-left">
                  <div className="text-lg font-bold">{winStreak}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">STREAK</div>
              </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-wider absolute left-1/2 -translate-x-1/2">PEEPDLE</h1>
          <div className="flex items-center gap-4">
              <div className="text-right">
                  <div className="text-lg font-bold">{personalBest}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">BEST</div>
              </div>
              <button onClick={() => setIsSettingsModalOpen(true)} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  <SettingsIcon />
              </button>
          </div>
      </header>


      <main className="flex flex-col items-center justify-start w-full max-w-md mx-auto flex-grow overflow-y-auto px-2">
          <p className="text-center italic text-base sm:text-lg text-slate-600 dark:text-slate-300 min-h-[48px] px-2 my-3 sm:my-5 flex items-center justify-center">"{maskedQuote}"</p>
          
          <div className="w-full flex items-center justify-center flex-grow">
            <Grid 
              guesses={guesses}
              currentGuess={currentGuess}
              solution={solution}
              isRevealing={isRevealing}
            />
          </div>

          <div className="w-full flex-shrink-0 pt-2 pb-2">
            <div className="flex justify-center items-center gap-2 text-sm mb-2 text-slate-500 dark:text-slate-400">
              <span>Hints: <span className="font-bold text-slate-800 dark:text-slate-200">{hintTokens}</span></span>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-2"></div>
              <span>Skips: <span className="font-bold text-slate-800 dark:text-slate-200">{isUnlimitedMode ? '∞' : skips}</span></span>
            </div>
            <div className="flex justify-center items-start gap-4 sm:gap-8">
              <div className="flex flex-col items-center w-16 text-center">
                <button
                    onClick={() => useHint('person')}
                    disabled={hints.person.revealed || gameState !== 'PLAYING' || hintTokens <= 0}
                    className="p-3 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Use Character Hint"
                >
                    <CharacterIcon />
                </button>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 h-8">
                    {hints.person.revealed ? hints.person.value : 'CHARACTER'}
                </p>
              </div>
              <div className="flex flex-col items-center w-16 text-center">
                  <button
                      onClick={() => useHint('episode')}
                      disabled={hints.episode.revealed || gameState !== 'PLAYING' || hintTokens <= 0}
                      className="p-3 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Use Episode Hint"
                  >
                      <EpisodeIcon />
                  </button>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 h-8">
                      {hints.episode.revealed ? hints.episode.value : 'EPISODE'}
                  </p>
              </div>
              <div className="flex flex-col items-center w-16 text-center">
                <button
                    onClick={giveUp}
                    disabled={gameState !== 'PLAYING'}
                    className="p-3 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Give Up"
                >
                    <GiveUpIcon />
                </button>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 h-8">
                    GIVE UP
                </p>
              </div>
              <div className={`flex flex-col items-center w-16 text-center ${isSkipAnimating ? 'animate-pop' : ''}`}>
                   <button
                      onClick={useSkip}
                      disabled={gameState !== 'PLAYING' || (!isUnlimitedMode && skips <= 0)}
                      className="p-3 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Skip Word"
                  >
                      <SkipIcon />
                  </button>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 h-8">
                      SKIP
                  </p>
              </div>
            </div>
          </div>
      </main>

      <div className="flex flex-col w-full items-center flex-shrink-0">
        <Keyboard 
          onKeyPress={handleKeyPress} 
          letterStatuses={letterStatuses}
        />
        <footer className="text-center text-xs text-gray-500 py-4">
          Quotes from Peep Show. Not affiliated with Channel 4.
        </footer>
      </div>

      <GameEndModal
        isOpen={gameState === 'WON' || gameState === 'LOST'}
        status={gameState}
        solution={solution}
        originalWord={originalWord}
        quote={quote}
        winStreak={winStreak}
        personalBest={personalBest}
        onNewGame={handleStartNewGame}
        guesses={guesses}
        addToast={addToast}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        maxWordLength={maxWordLength}
        onLengthChange={(length) => {
          setMaxWordLength(length);
          startNewGame(length);
        }}
        isUnlimitedMode={isUnlimitedMode}
        onUnlimitedModeChange={toggleUnlimitedMode}
        isHardMode={isHardMode}
        onHardModeChange={toggleHardMode}
        isDarkMode={isDarkMode}
        onDarkModeChange={toggleDarkMode}
      />
      
      <InfoModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setIsInfoModalOpen(false)} 
      />
    </div>
  );
};

export default App;
