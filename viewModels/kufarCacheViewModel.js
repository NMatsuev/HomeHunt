// viewModels/useKufarCacheViewModel.js
import { useState, useEffect, useCallback } from "react";
import kufarService from "../services/kufarService";
import cacheService from "../services/сacheService";

const CACHE_KEY = "kufar_ads";
const CACHE_TTL = 3600000; // 1 час в миллисекундах

const kufarCacheViewModel = () => {
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Инициализация БД
  useEffect(() => {
    cacheService.initDatabase();
  }, []);

  // Проверка, нужно ли обновлять кэш
  const needsRefresh = useCallback((cachedData) => {
    if (!cachedData?.timestamp) return true;
    const age = Date.now() - cachedData.timestamp;
    return age > CACHE_TTL;
  }, []);

  // Загрузка данных (всегда сначала из кэша, потом API если нужно)
  const loadAds = useCallback(
    async (params = {}, isOnline = true) => {
      setIsLoading(true);
      setError(null);

      try {
        const cached = await cacheService.get(CACHE_KEY);

        if (cached?.data && cached.data.length > 0) {
          console.log(`Loaded from cache: ${cached.data.length} ads`);
          setAds(cached.data);
          setFromCache(true);
          setLastUpdated(cached.timestamp);
          setIsLoading(false);

          if (isOnline && needsRefresh(cached)) {
            console.log("Cache expired, refreshing in background...");

            try {
              const result = await kufarService.searchAds(params);

              if (result.success) {
                console.log(`API returned ${result.data.length} ads`);
                await cacheService.set(CACHE_KEY, result.data);
                setAds(result.data);
                setFromCache(false);
                setLastUpdated(Date.now());
              }
            } catch (apiError) {
              console.error("Background refresh failed:", apiError);
              // Оставляем кэшированные данные
            }
          }
        } else {
          console.log("No cache, loading from API...");

          if (!isOnline) {
            setError("Нет интернета и нет кэша");
            setIsLoading(false);
            return { success: false, error: "Нет интернета и нет кэша" };
          }

          const result = await kufarService.searchAds(params);

          if (result.success) {
            console.log(`API returned ${result.data.length} ads`);
            await cacheService.set(CACHE_KEY, result.data);
            setAds(result.data);
            setFromCache(false);
            setLastUpdated(Date.now());
          } else {
            setError(result.error);
          }
        }

        setIsLoading(false);
        return { success: true };
      } catch (error) {
        console.error("Load ads error:", error);
        setError(error.message);
        setIsLoading(false);
        return { success: false, error: error.message };
      }
    },
    [needsRefresh],
  );

  // Принудительное обновление (pull-to-refresh)
  const refreshAds = useCallback(async (params = {}, isOnline = true) => {
    if (!isOnline) {
      return { success: false, error: "Нет интернета" };
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Force refresh from API...");
      const result = await kufarService.searchAds(params);

      if (result.success) {
        await cacheService.set(CACHE_KEY, result.data);
        setAds(result.data);
        setFromCache(false);
        setLastUpdated(Date.now());
      } else {
        setError(result.error);
      }

      setIsLoading(false);
      return result;
    } catch (error) {
      console.error("Refresh error:", error);
      setError(error.message);
      setIsLoading(false);
      return { success: false, error: error.message };
    }
  }, []);

  // Очистка кэша
  const clearCache = useCallback(async () => {
    await cacheService.clear();
    setAds([]);
    setFromCache(false);
    setLastUpdated(null);
  }, []);

  return {
    ads,
    isLoading,
    error,
    fromCache,
    lastUpdated,
    loadAds,
    refreshAds,
    clearCache,
  };
};

export default kufarCacheViewModel;
