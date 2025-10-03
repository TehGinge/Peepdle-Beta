import React from 'react';
import { LetterState, LetterStatuses } from '../types';
import { BackspaceIcon, EnterIcon } from './Icons';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  letterStatuses: LetterStatuses;
}

const Key: React.FC<{ 
    value: string; 
    onKeyPress: (key: string) => void; 
    status?: LetterState; 
    isLarge?: boolean;
}> = ({ value, onKeyPress, status, isLarge }) => {
  
  const statusStyles = {
    absent: 'bg-gray-500 dark:bg-[#3a3a3c] text-white',
    correct: 'bg-green-500 dark:bg-green-600 text-white',
    present: 'bg-yellow-400 dark:bg-yellow-500 text-white',
  };

  const baseClasses = 'h-14 flex items-center justify-center rounded font-bold uppercase cursor-pointer select-none transition-colors text-black dark:text-white';
  const sizeClasses = isLarge ? 'flex-grow-[1.5] text-xs' : 'flex-1';
  const colorClasses = status && statusStyles[status as keyof typeof statusStyles] 
    ? statusStyles[status as keyof typeof statusStyles] 
    : 'bg-gray-300 dark:bg-gray-500 hover:bg-gray-400 dark:hover:bg-gray-600';

  let content;
  if (value === 'enter') {
      content = <EnterIcon />;
  } else if (value === 'backspace') {
      content = <BackspaceIcon />;
  } else {
      content = value;
  }
  
  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${colorClasses}`}
      onClick={() => onKeyPress(value)}
      aria-label={value}
    >
      {content}
    </button>
  );
};


export const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, letterStatuses }) => {
  const keys1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  const keys2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
  const keys3 = ['backspace', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'enter'];

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-2 p-2">
      <div className="flex gap-1.5 w-full">
        {keys1.map(key => <Key key={key} value={key} onKeyPress={onKeyPress} status={letterStatuses[key]} />)}
      </div>
      <div className="flex gap-1.5 w-full justify-center px-4">
        {keys2.map(key => <Key key={key} value={key} onKeyPress={onKeyPress} status={letterStatuses[key]} />)}
      </div>
      <div className="flex gap-1.5 w-full">
        {keys3.map(key => <Key key={key} value={key} onKeyPress={onKeyPress} status={letterStatuses[key]} isLarge={key === 'enter' || key === 'backspace'} />)}
      </div>
    </div>
  );
};