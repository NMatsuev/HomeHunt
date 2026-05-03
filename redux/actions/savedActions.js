import savedOffersService from "../../services/savedOffersService";

export const SAVED_LOADING = "SAVED_LOADING";
export const SAVED_LOADED = "SAVED_LOADED";
export const SAVED_ADD = "SAVED_ADD";
export const SAVED_REMOVE = "SAVED_REMOVE";
export const SAVED_ERROR = "SAVED_ERROR";

// Загрузка сохраненных ID
export const loadSavedIds = () => async (dispatch) => {
  try {
    dispatch({ type: SAVED_LOADING });
    const savedIds = await savedOffersService.getSavedIds();
    dispatch({ type: SAVED_LOADED, payload: savedIds });
    return { success: true, savedIds };
  } catch (error) {
    dispatch({ type: SAVED_ERROR, payload: error.message });
    return { success: false, error: error.message };
  }
};

// Добавление в сохраненные
export const addSaved = (offerId) => async (dispatch) => {
  try {
    const result = await savedOffersService.addSaved(offerId);
    if (result.success) {
      dispatch({ type: SAVED_ADD, payload: offerId });
    }
    return result;
  } catch (error) {
    dispatch({ type: SAVED_ERROR, payload: error.message });
    return { success: false, error: error.message };
  }
};

// Удаление из сохраненных
export const removeSaved = (offerId) => async (dispatch) => {
  try {
    const result = await savedOffersService.removeSaved(offerId);
    if (result.success) {
      dispatch({ type: SAVED_REMOVE, payload: offerId });
    }
    return result;
  } catch (error) {
    dispatch({ type: SAVED_ERROR, payload: error.message });
    return { success: false, error: error.message };
  }
};

// Переключение статуса сохранения
export const toggleSaved = (offerId) => async (dispatch, getState) => {
  try {
    const result = await savedOffersService.toggleSaved(offerId);
    if (result.success) {
      const state = getState();
      const isSaved = state.saved?.savedIds?.includes(offerId);
      if (isSaved) {
        dispatch({ type: SAVED_REMOVE, payload: offerId });
      } else {
        dispatch({ type: SAVED_ADD, payload: offerId });
      }
    }
    return result;
  } catch (error) {
    dispatch({ type: SAVED_ERROR, payload: error.message });
    return { success: false, error: error.message };
  }
};
