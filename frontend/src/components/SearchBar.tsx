import React, { useState, useRef, useEffect } from "react";
import { useSearch, CATEGORIES, TAGS } from "../contexts/SearchContext";
import { useDebounce } from "../hooks/useDebounce";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = React.memo(
  ({ onSearch, placeholder = "Search dreams...", className = "" }) => {
    const {
      filters,
      updateFilters,
      searchHistory,
      addToHistory,
      clearHistory,
      savedSearches,
      saveCurrentSearch,
      loadSavedSearch,
      deleteSavedSearch,
      suggestions,
    } = useSearch();

    const [isOpen, setIsOpen] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showSavedSearches, setShowSavedSearches] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [saveSearchName, setSaveSearchName] = useState("");
    const [localQuery, setLocalQuery] = useState(filters.query);
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const debouncedQuery = useDebounce(localQuery, 300);

    // Update filters when debounced query changes
    useEffect(() => {
      updateFilters({ query: debouncedQuery });
      if (debouncedQuery && onSearch) {
        onSearch(debouncedQuery);
      }
    }, [debouncedQuery, updateFilters, onSearch]);

    // Handle clicks outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          searchRef.current &&
          !searchRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setShowSuggestions(false);
          setShowSavedSearches(false);
          setShowFilters(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle keyboard navigation
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsOpen(false);
          setShowSuggestions(false);
          setShowSavedSearches(false);
          setShowFilters(false);
          setFocusedIndex(-1);
          inputRef.current?.focus();
        } else if (event.key === "ArrowDown" && showSuggestions) {
          event.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        } else if (event.key === "ArrowUp" && showSuggestions) {
          event.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, -1));
        } else if (
          event.key === "Enter" &&
          focusedIndex >= 0 &&
          showSuggestions
        ) {
          event.preventDefault();
          handleSuggestionClick(suggestions[focusedIndex]);
        }
      };

      if (isOpen) {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
      }
    }, [isOpen, showSuggestions, suggestions, focusedIndex]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalQuery(value);
      setShowSuggestions(true);
    };

    const handleSuggestionClick = (suggestion: string) => {
      setLocalQuery(suggestion);
      addToHistory(suggestion);
      setShowSuggestions(false);
      inputRef.current?.focus();
    };

    const handleSearch = () => {
      if (localQuery.trim()) {
        addToHistory(localQuery.trim());
        setIsOpen(false);
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    };

    const handleSaveSearch = () => {
      if (saveSearchName.trim()) {
        saveCurrentSearch(saveSearchName.trim());
        setSaveSearchName("");
        setShowSavedSearches(false);
      }
    };

    const getFilterCount = () => {
      let count = 0;
      if (filters.category !== "all") count++;
      if (filters.status !== "all") count++;
      if (filters.dateRange !== "all") count++;
      if (filters.tags.length > 0) count++;
      if (filters.stakeRange[0] > 0 || filters.stakeRange[1] < 1000) count++;
      return count;
    };

    return (
      <div ref={searchRef} className={`relative ${className}`}>
        <div className="relative">
          <div className="relative flex items-center">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
              🔍
            </span>
            <input
              ref={inputRef}
              type="text"
              value={localQuery}
              onChange={handleInputChange}
              onFocus={() => setIsOpen(true)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="w-full pl-10 pr-20 sm:pr-24 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-base" // text-base prevents zoom on iOS
              aria-label="Search dreams"
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              role="combobox"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              {getFilterCount() > 0 && (
                <span className="bg-primary text-white text-xs px-2 py-1 rounded-full hidden sm:inline">
                  {getFilterCount()}
                </span>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-md transition-colors duration-200 touch-manipulation ${
                  showFilters
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
                }`}
                aria-label="Toggle filters"
                aria-pressed={showFilters}
              >
                <svg
                  className="w-5 h-5 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setShowSavedSearches(!showSavedSearches)}
                className={`p-3 rounded-md transition-colors duration-200 touch-manipulation ${
                  showSavedSearches
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
                }`}
                aria-label="Saved searches"
                aria-pressed={showSavedSearches}
              >
                <svg
                  className="w-5 h-5 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Search Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden max-w-md mx-auto">
              {/* Filters Panel */}
              {showFilters && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Category
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) =>
                          updateFilters({ category: e.target.value })
                        }
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="all">All Categories</option>
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Status
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) =>
                          updateFilters({ status: e.target.value })
                        }
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="resolvedsuccess">Successful</option>
                        <option value="resolvedfail">Failed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Date Range
                      </label>
                      <select
                        value={filters.dateRange}
                        onChange={(e) =>
                          updateFilters({ dateRange: e.target.value })
                        }
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Stake Range: {filters.stakeRange[0]} -{" "}
                      {filters.stakeRange[1]} TON
                    </label>
                    <div className="flex space-x-4">
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        step="10"
                        value={filters.stakeRange[0]}
                        onChange={(e) =>
                          updateFilters({
                            stakeRange: [
                              parseInt(e.target.value),
                              filters.stakeRange[1],
                            ],
                          })
                        }
                        className="flex-1"
                      />
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        step="10"
                        value={filters.stakeRange[1]}
                        onChange={(e) =>
                          updateFilters({
                            stakeRange: [
                              filters.stakeRange[0],
                              parseInt(e.target.value),
                            ],
                          })
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={() => updateFilters(defaultFilters)}
                      className="text-gray-600 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
                    >
                      Reset Filters
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

              {/* Saved Searches */}
              {showSavedSearches && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      Saved Searches
                    </h3>
                    <button
                      onClick={() =>
                        setSaveSearchName(localQuery || "Custom Search")
                      }
                      className="text-primary hover:text-primary/80 text-sm"
                    >
                      Save Current
                    </button>
                  </div>

                  {saveSearchName && (
                    <div className="mb-3 flex space-x-2">
                      <input
                        type="text"
                        value={saveSearchName}
                        onChange={(e) => setSaveSearchName(e.target.value)}
                        placeholder="Search name"
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSaveSearch()
                        }
                      />
                      <button
                        onClick={handleSaveSearch}
                        className="px-3 py-2 bg-primary text-white rounded text-sm hover:bg-primary/90"
                      >
                        Save
                      </button>
                    </div>
                  )}

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {savedSearches.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No saved searches
                      </p>
                    ) : (
                      savedSearches.map((search) => (
                        <div
                          key={search.id}
                          className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                        >
                          <button
                            onClick={() => {
                              loadSavedSearch(search.id);
                              setLocalQuery(search.filters.query);
                              setShowSavedSearches(false);
                            }}
                            className="flex-1 text-left text-sm text-gray-700 dark:text-gray-300"
                          >
                            <div className="font-medium">{search.name}</div>
                            <div className="text-xs text-gray-500">
                              {search.filters.query &&
                                `"${search.filters.query}"`}
                              {search.useCount > 0 &&
                                ` • Used ${search.useCount} times`}
                            </div>
                          </button>
                          <button
                            onClick={() => deleteSavedSearch(search.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            aria-label="Delete saved search"
                          >
                            🗑️
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Suggestions and History */}
              {showSuggestions &&
                (suggestions.length > 0 || searchHistory.length > 0) && (
                  <div className="max-h-60 overflow-y-auto">
                    {searchHistory.length > 0 && (
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Recent Searches
                          </h4>
                          <button
                            onClick={clearHistory}
                            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            Clear
                          </button>
                        </div>
                        {searchHistory.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(item)}
                            className="block w-full text-left p-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                          >
                            🔍 {item}
                          </button>
                        ))}
                      </div>
                    )}

                    {suggestions.length > 0 && (
                      <div className="p-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Suggestions
                        </h4>
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className={`block w-full text-left p-2 text-sm rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset ${
                              focusedIndex === index
                                ? "bg-primary text-white"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                            aria-selected={focusedIndex === index}
                          >
                            💡 {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    );
  },
);

SearchBar.displayName = "SearchBar";

export default SearchBar;
