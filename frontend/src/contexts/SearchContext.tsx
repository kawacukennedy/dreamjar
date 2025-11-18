import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface SearchFilters {
  query: string;
  category: string;
  status: string;
  stakeRange: [number, number];
  dateRange: string;
  sortBy: string;
  tags: string[];
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: string;
  useCount: number;
}

interface SearchContextType {
  filters: SearchFilters;
  updateFilters: (newFilters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  searchHistory: string[];
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  savedSearches: SavedSearch[];
  saveCurrentSearch: (name: string) => void;
  loadSavedSearch: (id: string) => void;
  deleteSavedSearch: (id: string) => void;
  suggestions: string[];
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const defaultFilters: SearchFilters = {
  query: "",
  category: "all",
  status: "all",
  stakeRange: [0, 1000],
  dateRange: "all",
  sortBy: "newest",
  tags: [],
};

const CATEGORIES = [
  "Health & Fitness",
  "Arts & Music",
  "Education",
  "Travel",
  "Career",
  "Personal",
  "Technology",
  "Sports",
  "Creative",
  "Other",
];

const TAGS = [
  "urgent",
  "long-term",
  "short-term",
  "high-stakes",
  "community",
  "personal",
  "charity",
  "challenge",
  "learning",
  "achievement",
];

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};

interface SearchProviderProps {
  children: React.ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [filters, setFilters] = useState<SearchFilters>(() => {
    const saved = localStorage.getItem("searchFilters");
    return saved ? { ...defaultFilters, ...JSON.parse(saved) } : defaultFilters;
  });

  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem("searchHistory");
    return saved ? JSON.parse(saved) : [];
  });

  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    const saved = localStorage.getItem("savedSearches");
    return saved ? JSON.parse(saved) : [];
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate suggestions based on current filters and history
  useEffect(() => {
    const generateSuggestions = () => {
      const newSuggestions: string[] = [];

      // Add recent searches
      newSuggestions.push(...searchHistory.slice(0, 3));

      // Add popular categories
      if (filters.category === "all") {
        newSuggestions.push(
          ...CATEGORIES.slice(0, 3).map((cat) => `category:${cat}`),
        );
      }

      // Add stake range suggestions
      if (filters.stakeRange[0] === 0 && filters.stakeRange[1] === 1000) {
        newSuggestions.push("under 10 TON", "10-50 TON", "over 100 TON");
      }

      // Remove duplicates and limit
      const unique = [...new Set(newSuggestions)].slice(0, 8);
      setSuggestions(unique);
    };

    generateSuggestions();
  }, [filters, searchHistory]);

  // Save filters to localStorage
  useEffect(() => {
    localStorage.setItem("searchFilters", JSON.stringify(filters));
  }, [filters]);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const addToHistory = useCallback(
    (query: string) => {
      if (query.trim() && !searchHistory.includes(query)) {
        const newHistory = [
          query,
          ...searchHistory.filter((h) => h !== query),
        ].slice(0, 10);
        setSearchHistory(newHistory);
        localStorage.setItem("searchHistory", JSON.stringify(newHistory));
      }
    },
    [searchHistory],
  );

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  }, []);

  const saveCurrentSearch = useCallback(
    (name: string) => {
      const newSavedSearch: SavedSearch = {
        id: Date.now().toString(),
        name,
        filters: { ...filters },
        createdAt: new Date().toISOString(),
        useCount: 0,
      };

      const newSavedSearches = [newSavedSearch, ...savedSearches];
      setSavedSearches(newSavedSearches);
      localStorage.setItem("savedSearches", JSON.stringify(newSavedSearches));
    },
    [filters, savedSearches],
  );

  const loadSavedSearch = useCallback(
    (id: string) => {
      const savedSearch = savedSearches.find((s) => s.id === id);
      if (savedSearch) {
        setFilters(savedSearch.filters);

        // Update use count
        const updated = savedSearches.map((s) =>
          s.id === id ? { ...s, useCount: s.useCount + 1 } : s,
        );
        setSavedSearches(updated);
        localStorage.setItem("savedSearches", JSON.stringify(updated));
      }
    },
    [savedSearches],
  );

  const deleteSavedSearch = useCallback(
    (id: string) => {
      const newSavedSearches = savedSearches.filter((s) => s.id !== id);
      setSavedSearches(newSavedSearches);
      localStorage.setItem("savedSearches", JSON.stringify(newSavedSearches));
    },
    [savedSearches],
  );

  const value: SearchContextType = {
    filters,
    updateFilters,
    resetFilters,
    searchHistory,
    addToHistory,
    clearHistory,
    savedSearches,
    saveCurrentSearch,
    loadSavedSearch,
    deleteSavedSearch,
    suggestions,
    isLoading,
    setIsLoading,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};

export { CATEGORIES, TAGS };
