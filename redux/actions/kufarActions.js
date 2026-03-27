import kufarService from "../../services/kufarService";

export const KU_FAR_LOADING = "KU_FAR_LOADING";
export const KU_FAR_LOADED = "KU_FAR_LOADED";
export const KU_FAR_ERROR = "KU_FAR_ERROR";
export const KU_FAR_FROM_CACHE = "KU_FAR_FROM_CACHE";
export const CLEAR_KUFAR_ADS = "CLEAR_KUFAR_ADS";

export const fetchKufarAds =
  (params = {}) =>
  async (dispatch) => {
    try {
      dispatch({ type: KU_FAR_LOADING });

      const result = await kufarService.searchAds(params);

      if (result.success) {
        dispatch({
          type: KU_FAR_LOADED,
          payload: result.data,
          fromCache: result.fromCache || false,
        });

        if (result.fromCache) {
          dispatch({ type: KU_FAR_FROM_CACHE });
        }

        return {
          success: true,
          data: result.data,
          fromCache: result.fromCache,
        };
      } else {
        dispatch({ type: KU_FAR_ERROR, payload: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      dispatch({ type: KU_FAR_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

export const clearKufarAds = () => ({
  type: CLEAR_KUFAR_ADS,
});
