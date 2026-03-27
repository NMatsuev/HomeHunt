import { createStore, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import rootReducer from "./reducers";

const store = createStore(rootReducer, applyMiddleware(thunk));

store.subscribe(() => {
  console.log("Store state updated:", {
    theme: store.getState().theme?.theme,
    language: store.getState().language?.currentLocale,
    offersCount: store.getState().offers?.offers?.length,
  });
});

export default store;
