import {
  THEME_LOADING,
  THEME_LOADED,
  THEME_ERROR,
  THEME_SET,
} from "../actions/themeActions";
import { lightTheme } from "../../utils/themes";

const initialState = {
  theme: "light",
  colors: lightTheme.colors,
  isDark: false,
  isLoading: false,
  error: null,
  isInitialized: false,
};

const themeReducer = (state = initialState, action) => {
  console.log("Theme reducer action:", action.type);

  switch (action.type) {
    case THEME_LOADING:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case THEME_LOADED:
      return {
        ...state,
        theme: action.payload.theme,
        colors: action.payload.colors,
        isDark: action.payload.isDark,
        isLoading: false,
        isInitialized: true,
        error: null,
      };

    case THEME_SET:
      return {
        ...state,
        theme: action.payload.theme,
        colors: action.payload.colors,
        isDark: action.payload.isDark,
        isLoading: false,
        error: null,
      };

    case THEME_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default themeReducer;
