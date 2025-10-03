
import React from 'react';
import { Modal } from './Modal.tsx';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LetterTile: React.FC<{ letter: string, color: 'green' | 'yellow' | 'gray' }> = ({ letter, color }) => {
    const colorClasses = {
        green: 'bg-green-600 border-green-600 text-white',
        yellow: 'bg-yellow-500 border-yellow-500 text-white',
        gray: 'bg-[#3a3a3c] border-[#3a3a3c] text-white',
    };
    return (
        <div className={`w-10 h-10 flex items-center justify-center font-bold text-xl uppercase border-2 rounded ${colorClasses[color]}`}>
            {letter}
        </div>
    );
};

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="How to Play Peepdle">
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>Guess the secret word from a Peep Show quote in 5 tries.</p>
                <div className="space-y-3">
                    <p className="font-semibold">Examples:</p>
                    <div className="flex items-center gap-2">
                        <LetterTile letter="F" color="green" />
                        <p>The letter F is in the word and in the correct spot.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <LetterTile letter="O" color="yellow" />
                        <p>The letter O is in the word but in the wrong spot.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <LetterTile letter="U" color="gray" />
                        <p>The letter U is not in the word in any spot.</p>
                    </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">Hints & Skips</h3>
                    <ul className="list-disc list-inside space-y-2">
                        <li><span className="font-semibold">Hints:</span> Use a hint to reveal the <span className="font-semibold text-cyan-600 dark:text-cyan-400">Character</span> or <span className="font-semibold text-cyan-600 dark:text-cyan-400">Episode</span>. You start with 2 and earn another for every 2 wins, with no limit.</li>
                        <li><span className="font-semibold">Skips:</span> Use a skip to get a new word. This will not affect your win streak. You start with 3 and earn one every 4 wins (max 5).</li>
                    </ul>
                </div>
            </div>
        </Modal>
    );
};