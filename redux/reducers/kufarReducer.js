import {
  KU_FAR_LOADING,
  KU_FAR_LOADED,
  KU_FAR_ERROR,
  KU_FAR_FROM_CACHE,
  CLEAR_KUFAR_ADS,
} from "../actions/kufarActions";

const initialState = {
  ads: [],
  isLoading: false,
  error: null,
  hasLoaded: false,
  fromCache: false,
};

const kufarReducer = (state = initialState, action) => {
  switch (action.type) {
    case KU_FAR_LOADING:
      return { ...state, isLoading: true, error: null };
    case KU_FAR_LOADED:
      return {
        ...state,
        ads: action.payload,
        isLoading: false,
        hasLoaded: true,
        fromCache: action.fromCache || false,
        error: null,
      };
    case KU_FAR_FROM_CACHE:
      return { ...state, fromCache: true };
    case KU_FAR_ERROR:
      return { ...state, isLoading: false, error: action.payload };
    case CLEAR_KUFAR_ADS:
      return { ...state, ads: [], hasLoaded: false, fromCache: false };
    default:
      return state;
  }
};

export default kufarReducer;
