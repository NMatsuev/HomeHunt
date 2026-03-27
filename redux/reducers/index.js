import { combineReducers } from "redux";
import offersReducer from "./offersReducer";
import languageReducer from "./languageReducer";
import themeReducer from "./themeReducer";
import kufarReducer from "./kufarReducer";

const rootReducer = combineReducers({
  offers: offersReducer,
  language: languageReducer,
  theme: themeReducer,
  kufar: kufarReducer,
});

export default rootReducer;
