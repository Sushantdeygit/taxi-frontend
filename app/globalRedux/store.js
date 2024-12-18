import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "../../features/Users/userSlice";
import captainReducer from "../../features/Captain/captainSlice";

const userConfig = {
  key: "user",
  version: 1,
  storage,
};
const captainConfig = {
  key: "captain",
  version: 1,
  storage,
};
//persisted Reducer
const persistedUser = persistReducer(userConfig, userReducer);
const persistedCaptain = persistReducer(captainConfig, captainReducer);

const reducers = combineReducers({
  user: persistedUser,
  captain: persistedCaptain,
});

export const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
