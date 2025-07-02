import {
  logout as firebaseLogout,
  loginWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "@/src/api/authAPI";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Alert } from "react-native";

interface User {
  uid: string;
  email: string | null;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

// Đăng nhập
export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const user = await loginWithEmail(email, password);
      return { uid: user.uid, email: user.email };
    } catch (error: any) {
      return rejectWithValue(error.message || "Đăng nhập thất bại");
    }
  }
);

// Đăng nhập với Google
export const signInGoogle = createAsyncThunk(
  "auth/signInWithGoogle",
  async (_, { rejectWithValue }) => {
    try {
      const user = await signInWithGoogle();
      return { uid: user.uid, email: user.email };
    } catch (error: any) {
      return rejectWithValue(error.message || "Đăng nhập Google thất bại");
    }
  }
);

// Đăng ký
export const signUp = createAsyncThunk(
  "auth/signUp",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const user = await signUpWithEmail(email, password);
      return { uid: user.uid, email: user.email };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Đăng xuất
export const logout = createAsyncThunk("auth/logout", async () => {
  await firebaseLogout();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload ? action.payload : null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        Alert.alert("Lỗi đăng nhập", state.error);
      });

    // SignIn with Google
    builder
      .addCase(signInGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInGoogle.fulfilled, (state, action) => {
        console.log("SignIn Google payload:", action.payload);
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signInGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        Alert.alert("Lỗi đăng nhập Google", state.error);
      });

    // SignUp
    builder
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        console.log("SignUp payload:", action.payload);
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        Alert.alert("Lỗi đăng ký", state.error);
      });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
    });
  },
});

export const { resetError } = authSlice.actions;
export default authSlice.reducer;
