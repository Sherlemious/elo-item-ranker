
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define types
export type Item = {
  id: string;
  name: string;
  rating: number;
  wins: number;
  losses: number;
  comparisons: number;
};

export type Comparison = {
  id: string;
  item1Id: string;
  item2Id: string;
  winnerId: string;
  timestamp: number;
};

export type AppState = {
  items: Item[];
  comparisons: Comparison[];
  currentPhase: 'input' | 'comparison' | 'results';
  currentTheme: 'default' | 'dark' | 'purple' | 'amber' | 'rose';
};

export type AppContextType = {
  state: AppState;
  addItem: (name: string) => void;
  addItems: (names: string[]) => string[];
  removeItem: (id: string) => void;
  clearAllItems: () => void;
  startComparison: () => void;
  recordComparison: (winnerIdx: 0 | 1) => void;
  getCurrentPair: () => [Item, Item] | null;
  getProgress: () => { current: number; recommended: number; total: number };
  showResults: () => void;
  resetToInput: () => void;
  setTheme: (theme: AppState['currentTheme']) => void;
};

const localStorageKey = 'elo-rating-app-data';

// Initial state
const initialState: AppState = {
  items: [],
  comparisons: [],
  currentPhase: 'input',
  currentTheme: 'default',
};

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// ELO rating calculation constants
const K_FACTOR = 32;
const DEFAULT_RATING = 1200;

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);
  const [currentPairIndices, setCurrentPairIndices] = useState<[number, number] | null>(null);

  // Load from localStorage on initial render
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(localStorageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setState(parsedData);
      }

      // Check system preference for theme
      if (!localStorage.getItem('theme-preference')) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setState(prev => ({
          ...prev,
          currentTheme: prefersDark ? 'dark' : 'default'
        }));
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }, [state]);

  // Apply theme class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'purple-theme', 'amber-theme', 'rose-theme');
    
    if (state.currentTheme === 'dark') {
      root.classList.add('dark');
    } else if (state.currentTheme !== 'default') {
      root.classList.add(`${state.currentTheme}-theme`);
    }
    
    localStorage.setItem('theme-preference', state.currentTheme);
  }, [state.currentTheme]);

  // Generate a random ID
  const generateId = () => Math.random().toString(36).substring(2, 10);

  // Add a single item
  const addItem = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    // Check for duplicates (case insensitive)
    const isDuplicate = state.items.some(
      item => item.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (!isDuplicate) {
      const newItem: Item = {
        id: generateId(),
        name: trimmedName,
        rating: DEFAULT_RATING,
        wins: 0,
        losses: 0,
        comparisons: 0,
      };

      setState(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }
  };

  // Add multiple items at once, returns list of duplicates
  const addItems = (names: string[]): string[] => {
    const duplicates: string[] = [];
    const newItems: Item[] = [];

    // Process each name
    names.forEach(name => {
      const trimmedName = name.trim();
      if (!trimmedName) return;

      // Check for duplicates (case insensitive)
      const isDuplicate = [...state.items, ...newItems].some(
        item => item.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (isDuplicate) {
        duplicates.push(trimmedName);
      } else {
        const newItem: Item = {
          id: generateId(),
          name: trimmedName,
          rating: DEFAULT_RATING,
          wins: 0,
          losses: 0,
          comparisons: 0,
        };
        newItems.push(newItem);
      }
    });

    if (newItems.length > 0) {
      setState(prev => ({
        ...prev,
        items: [...prev.items, ...newItems]
      }));
    }

    return duplicates;
  };

  // Remove an item
  const removeItem = (id: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  // Clear all items
  const clearAllItems = () => {
    setState(prev => ({
      ...prev,
      items: [],
      comparisons: []
    }));
  };

  // Start comparison phase
  const startComparison = () => {
    setState(prev => ({ ...prev, currentPhase: 'comparison' }));
    chooseNextPair();
  };

  // Choose next pair to compare
  const chooseNextPair = () => {
    const { items } = state;
    if (items.length < 2) {
      setCurrentPairIndices(null);
      return;
    }

    // Create a map of comparison counts for each pair
    const comparisonCounts: Record<string, number> = {};
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const pairKey = `${items[i].id}-${items[j].id}`;
        const reversePairKey = `${items[j].id}-${items[i].id}`;
        comparisonCounts[pairKey] = 0;
        
        state.comparisons.forEach(comp => {
          if (
            (comp.item1Id === items[i].id && comp.item2Id === items[j].id) ||
            (comp.item1Id === items[j].id && comp.item2Id === items[i].id)
          ) {
            comparisonCounts[pairKey]++;
          }
        });
      }
    }

    // Find the pair with the least comparisons
    let leastComparedPair: [number, number] | null = null;
    let minComparisons = Infinity;

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const pairKey = `${items[i].id}-${items[j].id}`;
        if (comparisonCounts[pairKey] < minComparisons) {
          minComparisons = comparisonCounts[pairKey];
          leastComparedPair = [i, j];
        }
      }
    }

    // Randomly shuffle the order of the pair
    if (leastComparedPair && Math.random() > 0.5) {
      leastComparedPair = [leastComparedPair[1], leastComparedPair[0]];
    }

    setCurrentPairIndices(leastComparedPair);
  };

  // Get current pair of items to compare
  const getCurrentPair = (): [Item, Item] | null => {
    if (!currentPairIndices) return null;
    const [idx1, idx2] = currentPairIndices;
    return [state.items[idx1], state.items[idx2]];
  };

  // Calculate ELO rating
  const calculateElo = (winnerRating: number, loserRating: number): [number, number] => {
    const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));
    
    const newWinnerRating = winnerRating + K_FACTOR * (1 - expectedWinner);
    const newLoserRating = loserRating + K_FACTOR * (0 - expectedLoser);
    
    return [newWinnerRating, newLoserRating];
  };

  // Record a comparison result
  const recordComparison = (winnerIdx: 0 | 1) => {
    if (!currentPairIndices) return;
    
    const [idx1, idx2] = currentPairIndices;
    const winner = state.items[winnerIdx === 0 ? idx1 : idx2];
    const loser = state.items[winnerIdx === 0 ? idx2 : idx1];
    
    // Create comparison record
    const comparison: Comparison = {
      id: generateId(),
      item1Id: state.items[idx1].id,
      item2Id: state.items[idx2].id,
      winnerId: winner.id,
      timestamp: Date.now()
    };
    
    // Update ELO ratings
    const [newWinnerRating, newLoserRating] = calculateElo(winner.rating, loser.rating);
    
    // Update state with new comparison and updated ratings
    setState(prev => {
      const updatedItems = prev.items.map(item => {
        if (item.id === winner.id) {
          return {
            ...item,
            rating: newWinnerRating,
            wins: item.wins + 1,
            comparisons: item.comparisons + 1
          };
        } else if (item.id === loser.id) {
          return {
            ...item,
            rating: newLoserRating,
            losses: item.losses + 1,
            comparisons: item.comparisons + 1
          };
        }
        return item;
      });
      
      return {
        ...prev,
        items: updatedItems,
        comparisons: [...prev.comparisons, comparison]
      };
    });
    
    // Choose next pair
    chooseNextPair();
  };

  // Get progress information
  const getProgress = () => {
    const itemCount = state.items.length;
    // n(n-1)/2 is the formula for the number of possible pairs
    const totalPossiblePairs = itemCount * (itemCount - 1) / 2;
    
    // Recommended comparisons is at least 1.5x the number of items
    const recommendedComparisons = Math.max(Math.ceil(itemCount * 1.5), totalPossiblePairs);
    
    return {
      current: state.comparisons.length,
      recommended: recommendedComparisons,
      total: totalPossiblePairs
    };
  };

  // Show results
  const showResults = () => {
    setState(prev => ({ ...prev, currentPhase: 'results' }));
  };

  // Reset to input phase
  const resetToInput = () => {
    setState(prev => ({ ...prev, currentPhase: 'input' }));
  };

  // Set theme
  const setTheme = (theme: AppState['currentTheme']) => {
    setState(prev => ({ ...prev, currentTheme: theme }));
  };

  const contextValue: AppContextType = {
    state,
    addItem,
    addItems,
    removeItem,
    clearAllItems,
    startComparison,
    recordComparison,
    getCurrentPair,
    getProgress,
    showResults,
    resetToInput,
    setTheme,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
