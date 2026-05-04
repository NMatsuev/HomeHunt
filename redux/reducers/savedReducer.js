import {
  SAVED_LOADING,
  SAVED_LOADED,
  SAVED_ADD,
  SAVED_REMOVE,
  SAVED_ERROR,
  SAVED_CLEAR_STATE,
} from "../actions/savedActions";

const initialState = {
  savedIds: [],
  isLoading: false,
  error: null,
};

const savedReducer = (state = initialState, action) => {
  switch (action.type) {
    case SAVED_LOADING:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case SAVED_LOADED:
      return {
        ...state,
        savedIds: action.payload,
        isLoading: false,
        error: null,
      };

    case SAVED_ADD:
      return {
        ...state,
        savedIds: [...state.savedIds, action.payload],
        isLoading: false,
      };

    case SAVED_REMOVE:
      return {
        ...state,
        savedIds: state.savedIds.filter((id) => id !== action.payload),
        isLoading: false,
      };

    case SAVED_CLEAR_STATE:
      return {
        ...state,
        savedIds: [],
        isLoading: false,
        error: null,
      };

    case SAVED_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default savedReducer;
