

import React from 'react';
import { InfoIcon, SettingsIcon } from './Icons.tsx';

interface HeaderProps {
    winStreak: number;
    skips: number;
    onSettingsClick: () => void;
    onInfoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ winStreak, skips, onSettingsClick, onInfoClick }) => {
    return (
        <header className="flex items-center justify-between w-full max-w-md mx-auto p-2 border-b border-gray-700">
            <div className="flex items-center gap-4">
               <button onClick={onInfoClick} className="text-gray-400 hover:text-white">
                  <InfoIcon />
               </button>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-wider">
                PEEPDLE
            </h1>
            <div className="flex items-center gap-4">
                 <div className="flex flex-col items-center text-xs">
                    <span className="font-bold text-lg">{winStreak}</span>
                    <span className="text-gray-400">STREAK</span>
                </div>
                 <div className="flex flex-col items-center text-xs">
                    <span className="font-bold text-lg">{skips}</span>
                    <span className="text-gray-400">SKIPS</span>
                </div>
                <button onClick={onSettingsClick} className="text-gray-400 hover:text-white">
                    <SettingsIcon />
                </button>
            </div>
        </header>
    );
};