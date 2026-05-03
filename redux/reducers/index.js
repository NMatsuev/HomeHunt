import { combineReducers } from "redux";
import offersReducer from "./offersReducer";
import languageReducer from "./languageReducer";
import themeReducer from "./themeReducer";
import notificationReducer from "./notificationReducer";
import authReducer from "./authReducer";
import savedReducer from "./savedReducer";

const rootReducer = combineReducers({
  offers: offersReducer,
  language: languageReducer,
  theme: themeReducer,
  notifications: notificationReducer,
  auth: authReducer,
  saved: savedReducer,
});

export default rootReducer;
