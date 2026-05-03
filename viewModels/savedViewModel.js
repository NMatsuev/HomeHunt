import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadSavedIds,
  addSaved,
  removeSaved,
  toggleSaved,
} from "../redux/actions/savedActions";

const useSavedViewModel = () => {
  const dispatch = useDispatch();

  const savedState = useSelector((state) => state.saved);
  const savedIds = savedState?.savedIds || [];
  const isLoading = savedState?.isLoading || false;
  const error = savedState?.error || null;

  // Загрузка сохраненных ID при монтировании
  useEffect(() => {
    dispatch(loadSavedIds());
  }, [dispatch]);

  // Проверка, сохранено ли объявление
  const isSaved = useCallback(
    (offerId) => {
      return savedIds.includes(offerId);
    },
    [savedIds],
  );

  // Добавление в сохраненные
  const saveOffer = useCallback(
    async (offerId) => {
      const result = await dispatch(addSaved(offerId));
      return result;
    },
    [dispatch],
  );

  // Удаление из сохраненных
  const unsaveOffer = useCallback(
    async (offerId) => {
      const result = await dispatch(removeSaved(offerId));
      return result;
    },
    [dispatch],
  );

  // Переключение статуса
  const toggleSaveOffer = useCallback(
    async (offerId) => {
      const result = await dispatch(toggleSaved(offerId));
      return result;
    },
    [dispatch],
  );

  // Получение сохраненных объявлений из списка всех
  const getSavedOffers = useCallback(
    (allOffers) => {
      return allOffers.filter((offer) => savedIds.includes(offer.id));
    },
    [savedIds],
  );

  return {
    savedIds,
    isLoading,
    error,
    isSaved,
    saveOffer,
    unsaveOffer,
    toggleSaveOffer,
    getSavedOffers,
  };
};

export default useSavedViewModel;
