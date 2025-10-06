import { Quote } from '../types';
import { MIN_WORD_LENGTH } from '../constants';
import { excludedWords } from './excludedWords';

let quotes: Quote[] = [];

export const fetchQuotes = async (): Promise<boolean> => {
    if (quotes.length > 0) return true;
    try {
        // Fetch the quotes from the JSON file. Using a relative path
        // works correctly with the Vite build settings for GitHub Pages.
        const response = await fetch('quotes.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        quotes = data.results;
        return true;
    } catch (error) {
        console.error("Could not fetch or parse quotes.json:", error);
        return false;
    }
};

export const getSolutionById = (id: string, maxWordLength: number): { solution: string; quote: Quote, originalWord: string } | null => {
  if (quotes.length === 0) {
      console.error("Quotes not loaded yet. Call fetchQuotes first.");
      return null;
  }
  const quote = quotes.find(q => q.id === id);

  if (!quote) {
    console.warn(`Quote with ID "${id}" not found.`);
    return null;
  }
  
  console.log(`Found quote for ID "${id}":`, quote.quote);

  // Find all valid words in that quote
  const potentialWords = quote.quote.split(' ').filter(word => {
    const cleanedWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (!cleanedWord) return false;

    const isNotExcluded = !excludedWords.includes(cleanedWord);
    const hasValidLength = cleanedWord.length >= MIN_WORD_LENGTH && cleanedWord.length <= maxWordLength;
    
    return isNotExcluded && hasValidLength;
  });

  if (potentialWords.length === 0) {
    console.warn(`Quote with ID "${id}" was found, but it contains no valid words for the current settings (max length: ${maxWordLength}).`);
    return null;
  }
  
  console.log(`Found ${potentialWords.length} valid words. Selecting the first one: "${potentialWords[0]}"`);
  // To make the puzzle link deterministic, we pick the first valid word.
  const wordToUse = potentialWords[0];
  const solution = wordToUse.replace(/[^a-zA-Z]/g, '').toLowerCase();
  
  return { solution, quote, originalWord: wordToUse };
};

export const getNewSolution = (maxWordLength: number): { solution: string; quote: Quote, originalWord: string } => {
  if (quotes.length === 0) {
      console.error("Quotes not loaded yet. Call fetchQuotes first.");
      // Fallback to prevent crash
      const fallbackQuote: Quote = {
        "quote": "A slim chance is better than no chance at all.",
        "person": "System",
        "episode": "Fallback",
        "image": null,
        "id": "fallback",
        "episode_quote_sequence": "1",
        "global_quote_sequence": "1"
      };
      return { solution: "chance", quote: fallbackQuote, originalWord: "chance" };
  }

  // Pre-filter quotes to only include those with potential valid words
  const availableQuotes = quotes.filter(q => {
    const words = q.quote.split(' ');
    // Rule 1: Quote must have more than 2 words
    if (words.length <= 2) {
      return false;
    }
    // Rule 2: Quote must contain at least one guessable word within the length constraints
    return words.some(word => {
      const cleanedWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
      if (!cleanedWord) return false;

      const isNotExcluded = !excludedWords.includes(cleanedWord);
      const hasValidLength = cleanedWord.length >= MIN_WORD_LENGTH && cleanedWord.length <= maxWordLength;
      
      return isNotExcluded && hasValidLength;
    });
  });

  // Fallback if no quotes meet the criteria for the given maxWordLength
  if (availableQuotes.length === 0) {
      console.warn(`No quotes found with valid words for maxWordLength=${maxWordLength}. Falling back to defaults.`);
      // Using a hardcoded fallback quote and word guarantees consistency and prevents bugs
      // where the word might not exist in a randomly selected quote.
      const fallbackQuote: Quote = {
        "quote": "A slim chance is better than no chance at all.",
        "person": "System",
        "episode": "Fallback",
        "image": null,
        "id": "fallback",
        "episode_quote_sequence": "1",
        "global_quote_sequence": "1"
      };
      return { solution: "chance", quote: fallbackQuote, originalWord: "chance" };
  }

  while (true) {
    // Select a random quote from the filtered list
    const randomQuote = availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
    
    // Find all valid words in that quote
    const potentialWords = randomQuote.quote.split(' ').filter(word => {
      const cleanedWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
      if (!cleanedWord) return false;

      const isNotExcluded = !excludedWords.includes(cleanedWord);
      const hasValidLength = cleanedWord.length >= MIN_WORD_LENGTH && cleanedWord.length <= maxWordLength;
      
      return isNotExcluded && hasValidLength;
    });

    // If we found valid words, pick one and return
    if (potentialWords.length > 0) {
      const randomWord = potentialWords[Math.floor(Math.random() * potentialWords.length)];
      const solution = randomWord.replace(/[^a-zA-Z]/g, '').toLowerCase();
      return { solution, quote: randomQuote, originalWord: randomWord };
    }
    
    // If a quote from the available list has no valid words (should not happen with pre-filtering), the loop will try another.
  }
};