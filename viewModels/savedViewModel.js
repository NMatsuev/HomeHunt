import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadSavedIds,
  addSaved,
  removeSaved,
  toggleSaved,
  clearSavedState,
  migrateSavedOffers,
} from "../redux/actions/savedActions";

const useSavedViewModel = () => {
  const dispatch = useDispatch();

  const savedState = useSelector((state) => state.saved);
  const savedIds = savedState?.savedIds || [];
  const isLoading = savedState?.isLoading || false;
  const error = savedState?.error || null;

  // Загрузка сохраненных ID при монтировании
  useEffect(() => {
    const loadSaved = async () => {
      await dispatch(loadSavedIds());
    };
    loadSaved();
  }, [dispatch]);

  const isSaved = useCallback(
    (offerId) => {
      return savedIds.includes(offerId);
    },
    [savedIds],
  );

  const saveOffer = useCallback(
    async (offerId) => {
      return await dispatch(addSaved(offerId));
    },
    [dispatch],
  );

  const unsaveOffer = useCallback(
    async (offerId) => {
      return await dispatch(removeSaved(offerId));
    },
    [dispatch],
  );

  const toggleSaveOffer = useCallback(
    async (offerId) => {
      return await dispatch(toggleSaved(offerId));
    },
    [dispatch],
  );

  const getSavedOffers = useCallback(
    (allOffers) => {
      return allOffers.filter((offer) => savedIds.includes(offer.id));
    },
    [savedIds],
  );

  const migrateSaved = useCallback(async () => {
    return await dispatch(migrateSavedOffers());
  }, [dispatch]);

  return {
    savedIds,
    isLoading,
    error,
    isSaved,
    saveOffer,
    unsaveOffer,
    toggleSaveOffer,
    getSavedOffers,
    migrateSaved,
    clearState: () => dispatch(clearSavedState()), // Только для очистки Redux состояния
  };
};

export default useSavedViewModel;
