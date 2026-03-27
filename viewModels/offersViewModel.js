import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadOffers,
  addOffer as addOfferAction,
  updateOffer as updateOfferAction,
  deleteOffer as deleteOfferAction,
  initializeDatabase,
} from "../redux/actions/offersActions";
import { generateId } from "../utils/helpers";

const useOffersViewModel = () => {
  const dispatch = useDispatch();

  // ✅ Правильно получаем состояние - state это объект с полем offers
  const state = useSelector((state) => {
    console.log("Raw state from Redux:", state);
    return state;
  });

  // ✅ Достаем offers из state
  const offers = state?.offers?.offers || [];
  const isLoading = state?.offers?.isLoading || false;
  const error = state?.offers?.error || null;

  console.log("=== OFFERS VIEW MODEL DEBUG ===");
  console.log("Raw state:", state);
  console.log("State.offers:", state?.offers);
  console.log("Offers array:", offers);
  console.log("Offers length:", offers.length);
  console.log("================================");

  // Инициализация базы данных при первом запуске
  useEffect(() => {
    console.log("Initializing database from ViewModel...");
    dispatch(initializeDatabase());
  }, [dispatch]);

  // Добавление нового предложения
  const addOffer = useCallback(
    async (offerData) => {
      try {
        const newOffer = {
          ...offerData,
          id: generateId(),
        };

        console.log("Adding offer:", newOffer);
        const result = await dispatch(addOfferAction(newOffer));
        return result;
      } catch (error) {
        console.error("Error adding offer:", error);
        return { success: false, error: error.message };
      }
    },
    [dispatch],
  );

  // Обновление существующего предложения
  const updateOffer = useCallback(
    async (offer) => {
      try {
        const result = await dispatch(updateOfferAction(offer));
        return result;
      } catch (error) {
        console.error("Error updating offer:", error);
        return { success: false, error: error.message };
      }
    },
    [dispatch],
  );

  // Удаление предложения
  const deleteOffer = useCallback(
    async (offerId) => {
      try {
        const result = await dispatch(deleteOfferAction(offerId));
        return result;
      } catch (error) {
        console.error("Error deleting offer:", error);
        return { success: false, error: error.message };
      }
    },
    [dispatch],
  );

  // Получение предложения по ID
  const getOfferById = useCallback(
    (offerId) => {
      return offers.find((offer) => offer.id === offerId);
    },
    [offers],
  );

  // Получение отфильтрованных предложений
  const getFilteredOffers = useCallback(
    (filters = {}) => {
      let filtered = [...offers];

      if (filters.minPrice) {
        filtered = filtered.filter((offer) => {
          const price = parseInt(offer.price.replace(/[^\d]/g, ""));
          return price >= filters.minPrice;
        });
      }

      if (filters.maxPrice) {
        filtered = filtered.filter((offer) => {
          const price = parseInt(offer.price.replace(/[^\d]/g, ""));
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
    addOffer,
    updateOffer,
    deleteOffer,
    getOfferById,
    getFilteredOffers,
    totalCount: offers.length,
  };
};

export default useOffersViewModel;
