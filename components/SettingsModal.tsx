
import React from 'react';
import { Modal } from './Modal.tsx';
import { MIN_WORD_LENGTH, MAX_CONFIGURABLE_WORD_LENGTH } from '../constants.ts';

interface ToggleSwitchProps {
    label: string;
    description: string;
    isChecked: boolean;
    onToggle: (isChecked: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, description, isChecked, onToggle }) => (
    <div>
        <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700 dark:text-gray-200">{label}</span>
            <button
                role="switch"
                aria-checked={isChecked}
                onClick={() => onToggle(!isChecked)}
                className={`${
                    isChecked ? 'bg-cyan-500' : 'bg-gray-400 dark:bg-gray-600'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
                <span
                    className={`${
                        isChecked ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
            </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
    </div>
);


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxWordLength: number;
  onLengthChange: (length: number) => void;
  isUnlimitedMode: boolean;
  onUnlimitedModeChange: (isOn: boolean) => void;
  isHardMode: boolean;
  onHardModeChange: (isOn: boolean) => void;
  isDarkMode: boolean;
  onDarkModeChange: (isOn: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    maxWordLength, 
    onLengthChange,
    isUnlimitedMode,
    onUnlimitedModeChange,
    isHardMode,
    onHardModeChange,
    isDarkMode,
    onDarkModeChange,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-6">
        <div>
          <label htmlFor="max-word-length" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
            Max Word Length: <span className="font-bold text-lg text-cyan-500 dark:text-cyan-400">{maxWordLength}</span>
          </label>
          <input
            id="max-word-length"
            type="range"
            min={MIN_WORD_LENGTH}
            max={MAX_CONFIGURABLE_WORD_LENGTH}
            value={maxWordLength}
            onChange={(e) => onLengthChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        <div className="border-t border-gray-300 dark:border-gray-700 my-4"></div>

        <ToggleSwitch 
            label="Dark Mode"
            description="Toggle between light and dark themes."
            isChecked={isDarkMode}
            onToggle={onDarkModeChange}
        />

        <ToggleSwitch 
            label="Hard Mode"
            description="Any revealed hints must be used in subsequent guesses. Toggling this will reset your streak."
            isChecked={isHardMode}
            onToggle={onHardModeChange}
        />
        
        <ToggleSwitch 
            label="Unlimited Skips"
            description="Play without a skip limit. Toggling this will reset your streak."
            isChecked={isUnlimitedMode}
            onToggle={onUnlimitedModeChange}
        />
        
        <p className="text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-300 dark:border-gray-700">
            Word length changes will apply to the next word.
        </p>
      </div>
    </Modal>
  );
};