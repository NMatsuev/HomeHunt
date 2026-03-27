import { combineReducers } from "redux";
import offersReducer from "./offersReducer";
import languageReducer from "./languageReducer";
import themeReducer from "./themeReducer";

const rootReducer = combineReducers({
  offers: offersReducer,
  language: languageReducer,
  theme: themeReducer,
});

export default rootReducer;
