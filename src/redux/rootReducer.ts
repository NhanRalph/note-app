import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlices";

const rootReducer = combineReducers({
  auth: authReducer,

  // Thêm reducer khác tại đây
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
