import { useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadOffers as loadOffersAction,
  initializeDatabase,
  subscribeToOffers,
  unsubscribeFromOffersRealTime,
  addOffer as addOfferAction,
  updateOffer as updateOfferAction,
  deleteOffer as deleteOfferAction,
} from "../redux/actions/offersActions";

const useOffersViewModel = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const state = useSelector((state) => {
    console.log("Raw state from Redux:", state);
    return state;
  });

  const offers = state?.offers?.offers || [];
  const isLoading = state?.offers?.isLoading || false;
  const error = state?.offers?.error || null;
  const isSubscribed = state?.offers?.isSubscribed || false;

  // Автоматическая инициализация при монтировании
  useEffect(() => {
    if (!isSubscribed) {
      initDatabase();
    }

    // Отписываемся при размонтировании компонента
    return () => {
      unsubscribe();
    };
  }, []);

  // Инициализация базы данных с реальным временем
  const initDatabase = useCallback(() => {
    return dispatch(initializeDatabase());
  }, [dispatch]);

  // Ручная подписка (обычно не нужна, так как initDatabase уже подписывается)
  const subscribe = useCallback(() => {
    return dispatch(subscribeToOffers());
  }, [dispatch]);

  // Отписка (важно для очистки при размонтировании)
  const unsubscribe = useCallback(() => {
    return dispatch(unsubscribeFromOffersRealTime());
  }, [dispatch]);

  const addOffer = useCallback(
    async (offerData) => {
      try {
        setLoading(true);
        // Firestore сам генерирует ID, не нужно создавать его здесь
        const newOffer = {
          ...offerData,
          // Для числовой фильтрации добавляем priceValue
          priceValue: parseInt(offerData.price.replace(/[^\d]/g, "")) || 0,
        };

        console.log("Adding offer:", newOffer);
        const result = await dispatch(addOfferAction(newOffer));
        return result;
      } catch (error) {
        console.error("Error adding offer:", error);
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [dispatch],
  );

  const updateOffer = useCallback(
    async (offer) => {
      try {
        setLoading(true);
        const updatedOffer = {
          ...offer,
          priceValue: parseInt(offer.price.replace(/[^\d]/g, "")) || 0,
        };
        const result = await dispatch(updateOfferAction(updatedOffer));
        return result;
      } catch (error) {
        console.error("Error updating offer:", error);
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [dispatch],
  );

  const deleteOffer = useCallback(
    async (offerId) => {
      try {
        setLoading(true);
        const result = await dispatch(deleteOfferAction(offerId));
        return result;
      } catch (error) {
        console.error("Error deleting offer:", error);
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [dispatch],
  );

  const getOfferById = useCallback(
    (offerId) => {
      return offers.find((offer) => offer.id === offerId);
    },
    [offers],
  );

  const getFilteredOffers = useCallback(
    (filters = {}) => {
      let filtered = [...offers];

      if (filters.minPrice) {
        filtered = filtered.filter((offer) => {
          const price =
            offer.priceValue || parseInt(offer.price.replace(/[^\d]/g, ""));
          return price >= filters.minPrice;
        });
      }

      if (filters.maxPrice) {
        filtered = filtered.filter((offer) => {
          const price =
            offer.priceValue || parseInt(offer.price.replace(/[^\d]/g, ""));
          return price <= filters.maxPrice;
        });
      }

      if (filters.rooms) {
        filtered = filtered.filter((offer) => offer.rooms === filters.rooms);
      }

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (offer) =>
            offer.title.toLowerCase().includes(query) ||
            offer.address.toLowerCase().includes(query),
        );
      }

      return filtered;
    },
    [offers],
  );

  return {
    offers,
    isLoading,
    error,
    isSubscribed,
    initDatabase,
    subscribe,
    unsubscribe,
    loadOffers: () => dispatch(loadOffersAction()),
    addOffer: (offer) => dispatch(addOfferAction(offer)),
    updateOffer: (offer) => dispatch(updateOfferAction(offer)),
    deleteOffer: (offerId) => dispatch(deleteOfferAction(offerId)),
  };
};

export default useOffersViewModel;
