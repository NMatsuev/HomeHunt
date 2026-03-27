import {
  OFFERS_LOADING,
  OFFERS_LOADED,
  OFFERS_ERROR,
  OFFER_ADDED,
  OFFER_UPDATED,
  OFFER_DELETED,
} from "../actions/offersActions";

const initialState = {
  offers: [],
  isLoading: false,
  error: null,
};

const offersReducer = (state = initialState, action) => {
  console.log("Reducer action:", action.type, action.payload); // ✅ Добавляем лог

  switch (action.type) {
    case OFFERS_LOADING:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case OFFERS_LOADED:
      // ✅ Убедитесь, что payload это массив
      const loadedOffers = Array.isArray(action.payload) ? action.payload : [];
      console.log("Setting offers in reducer:", loadedOffers.length);
      return {
        ...state,
        offers: loadedOffers,
        isLoading: false,
        error: null,
      };

    case OFFERS_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case OFFER_ADDED:
      return {
        ...state,
        offers: [action.payload, ...state.offers],
        isLoading: false,
      };

    case OFFER_UPDATED:
      return {
        ...state,
        offers: state.offers.map((offer) =>
          offer.id === action.payload.id ? action.payload : offer,
        ),
        isLoading: false,
      };

    case OFFER_DELETED:
      return {
        ...state,
        offers: state.offers.filter((offer) => offer.id !== action.payload),
        isLoading: false,
      };

    default:
      return state;
  }
};

export default offersReducer;
