import {
  OFFERS_LOADING,
  OFFERS_LOADED,
  OFFERS_ERROR,
  OFFER_ADDED,
  OFFER_UPDATED,
  OFFER_DELETED,
  OFFERS_REALTIME_UPDATE,
  OFFERS_SUBSCRIBE,
  OFFERS_UNSUBSCRIBE,
} from "../actions/offersActions";

const initialState = {
  offers: [],
  isLoading: false,
  error: null,
  isSubscribed: false, // Добавьте это поле
};

const offersReducer = (state = initialState, action) => {
  console.log("Reducer action:", action.type);

  switch (action.type) {
    case OFFERS_LOADING:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case OFFERS_LOADED:
      return {
        ...state,
        offers: Array.isArray(action.payload) ? action.payload : [],
        isLoading: false,
        error: null,
      };

    case OFFERS_REALTIME_UPDATE:
      // Обновляем список из реального времени
      return {
        ...state,
        offers: Array.isArray(action.payload) ? action.payload : [],
        isLoading: false,
        error: null,
      };

    case OFFER_ADDED:
      // Можно оставить для оптимистичного обновления, но подписка и так обновит
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

    case OFFERS_SUBSCRIBE:
      return {
        ...state,
        isSubscribed: true,
      };

    case OFFERS_UNSUBSCRIBE:
      return {
        ...state,
        isSubscribed: false,
      };

    case OFFERS_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default offersReducer;
