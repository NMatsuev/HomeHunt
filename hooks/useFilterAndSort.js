import { useState, useCallback, useMemo } from "react";

// Функция нечеткого поиска (Levenshtein distance)
const levenshteinDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[b.length][a.length];
};

const fuzzySearch = (text, query) => {
  if (!query || query.length === 0) return true;

  text = text.toLowerCase();
  query = query.toLowerCase();

  if (text.includes(query)) return true;

  const textWords = text.split(/\s+/);
  const queryWords = query.split(/\s+/);

  for (const qWord of queryWords) {
    for (const tWord of textWords) {
      if (levenshteinDistance(tWord, qWord) <= 2) {
        return true;
      }
      if (tWord.startsWith(qWord) || qWord.startsWith(tWord)) {
        return true;
      }
    }
  }

  return false;
};

export const useFilterAndSort = (items, activeTab) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [roomsFilter, setRoomsFilter] = useState("");

  const filterAndSearchOffers = useCallback(
    (data) => {
      if (!data || data.length === 0) return [];

      let filtered = [...data];

      if (searchQuery.trim()) {
        filtered = filtered.filter(
          (item) =>
            fuzzySearch(item.title || "", searchQuery) ||
            fuzzySearch(item.address || "", searchQuery) ||
            fuzzySearch(item.description || "", searchQuery),
        );
      }

      if (priceRange.min) {
        const minPrice = parseInt(priceRange.min);
        filtered = filtered.filter((item) => {
          const price = parseInt(item.price?.replace(/[^\d]/g, "")) || 0;
          return price >= minPrice;
        });
      }

      if (priceRange.max) {
        const maxPrice = parseInt(priceRange.max);
        filtered = filtered.filter((item) => {
          const price = parseInt(item.price?.replace(/[^\d]/g, "")) || 0;
          return price <= maxPrice;
        });
      }

      if (roomsFilter) {
        filtered = filtered.filter(
          (item) => item.rooms === parseInt(roomsFilter),
        );
      }

      return filtered;
    },
    [searchQuery, priceRange.min, priceRange.max, roomsFilter],
  );

  const sortOffers = useCallback(
    (data) => {
      const sorted = [...data];

      switch (sortBy) {
        case "price_asc":
          sorted.sort((a, b) => {
            const priceA = parseInt(a.price?.replace(/[^\d]/g, "")) || 0;
            const priceB = parseInt(b.price?.replace(/[^\d]/g, "")) || 0;
            return priceA - priceB;
          });
          break;
        case "price_desc":
          sorted.sort((a, b) => {
            const priceA = parseInt(a.price?.replace(/[^\d]/g, "")) || 0;
            const priceB = parseInt(b.price?.replace(/[^\d]/g, "")) || 0;
            return priceB - priceA;
          });
          break;
        case "rooms_asc":
          sorted.sort((a, b) => (a.rooms || 0) - (b.rooms || 0));
          break;
        case "rooms_desc":
          sorted.sort((a, b) => (b.rooms || 0) - (a.rooms || 0));
          break;
        case "area_asc":
          sorted.sort((a, b) => (a.area || 0) - (b.area || 0));
          break;
        case "area_desc":
          sorted.sort((a, b) => (b.area || 0) - (a.area || 0));
          break;
        default:
          sorted.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
          break;
      }

      return sorted;
    },
    [sortBy],
  );

  const processedData = useMemo(() => {
    const filtered = filterAndSearchOffers(items);
    return sortOffers(filtered);
  }, [items, filterAndSearchOffers, sortOffers]);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setPriceRange({ min: "", max: "" });
    setRoomsFilter("");
    setSortBy("date_desc");
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    priceRange,
    setPriceRange,
    roomsFilter,
    setRoomsFilter,
    processedData,
    resetFilters,
  };
};
