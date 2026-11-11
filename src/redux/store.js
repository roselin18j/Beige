
import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlices";
import aiReducer from "./slices/aiSlice";
import commonReducer from "./slices/commonSlice";




export const store = configureStore({
  reducer: {
    auth: authReducer,
    ai: aiReducer,
    common: commonReducer,
  },
});

export default store;