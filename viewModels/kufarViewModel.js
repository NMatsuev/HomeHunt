import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchKufarAds, clearKufarAds } from "../redux/actions/kufarActions";
import networkService from "../services/networkService";

const useKufarViewModel = () => {
  const dispatch = useDispatch();
  const { ads, isLoading, error, hasLoaded, fromCache } = useSelector(
    (state) =>
      state.kufar || {
        ads: [],
        isLoading: false,
        error: null,
        hasLoaded: false,
        fromCache: false,
      },
  );
  const [isOnline, setIsOnline] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Мониторинг интернета
  useEffect(() => {
    const unsubscribe = networkService.addListener((connected) => {
      setIsOnline(connected);
    });
    return unsubscribe;
  }, []);

  const loadAds = useCallback(
    async (params = {}) => {
      const result = await dispatch(fetchKufarAds({ ...params, isOnline }));
      return result;
    },
    [dispatch, isOnline],
  );

  const refreshAds = useCallback(
    async (params = {}) => {
      if (!isOnline) {
        console.log("No internet, cannot refresh");
        return { success: false, error: "Нет интернета" };
      }
      setIsRefreshing(true);
      const result = await dispatch(
        fetchKufarAds({ ...params, forceRefresh: true, isOnline }),
      );
      setIsRefreshing(false);
      return result;
    },
    [dispatch, isOnline],
  );

  const clearAds = useCallback(() => {
    dispatch(clearKufarAds());
  }, [dispatch]);

  return {
    ads: ads || [],
    isLoading,
    isRefreshing,
    error,
    hasLoaded,
    fromCache,
    isOnline,
    loadAds,
    refreshAds,
    clearAds,
  };
};

export default useKufarViewModel;
