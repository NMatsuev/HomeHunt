import { combineReducers } from "redux";
import offersReducer from "./offersReducer";
import languageReducer from "./languageReducer";
import themeReducer from "./themeReducer";
import notificationReducer from "./notificationReducer";
import authReducer from "./authReducer";

const rootReducer = combineReducers({
  offers: offersReducer,
  language: languageReducer,
  theme: themeReducer,
  notifications: notificationReducer,
  auth: authReducer,
});

export default rootReducer;
