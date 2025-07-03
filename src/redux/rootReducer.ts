import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlices";
import groupReducer from "./slices/groupSlices";
import noteReducer from "./slices/noteSlices";

const rootReducer = combineReducers({
  auth: authReducer,
  group: groupReducer,
  note: noteReducer,
  // Thêm reducer khác tại đây
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
