import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import authReducer from "@/features/auth/authSlice";
import commentReducer from "@/features/comments/commentSlice";
import postReducer from "@/features/posts/postSlice"
import storage from "redux-persist/lib/storage";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

// Cấu hình persist
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Chỉ persist auth
};

// Kết hợp tất cả reducers
const rootReducer = combineReducers({
  auth: authReducer,
  comments: commentReducer,
  posts: postReducer,
});

// Tạo persistedReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Tạo store
const store = configureStore({
  reducer: persistedReducer, // ✅ CHỈ sử dụng persistedReducer
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
