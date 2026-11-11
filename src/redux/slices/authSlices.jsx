import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ApiRequest from "../../utils/makeRequest";
import { UserAuthApi } from "../../api/userAuth";


/* =====================================================
   NEW - register / OTP login / forgot + reset password
   (login itself still uses exchangeLogin above)
===================================================== */


export const LoginUser = createAsyncThunk(
    "auth/loginuser",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await UserAuthApi.login(payload);
            return res;
        } catch (err) {
            return rejectWithValue(err?.response?.data || { message: err.message });
        }
    }
);


export const registerUser = createAsyncThunk(
    "auth/register",
    async (payload, { rejectWithValue }) => {
        try {
            console.log('payload', payload)
            const res = await UserAuthApi.register(payload);
            return res;
        } catch (err) {
            return rejectWithValue(err?.response?.data || { message: err.message });
        }
    }
);

export const sendLoginOtp = createAsyncThunk(
    "auth/otp/send",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await UserAuthApi.sendOtp(payload);
            return res;
        } catch (err) {
            return rejectWithValue(err?.response?.data || { message: err.message });
        }
    }
);

export const verifyLoginOtp = createAsyncThunk(
    "auth/otp/verify",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await UserAuthApi.verifyOtp(payload);
            return res;
        } catch (err) {
            return rejectWithValue(err?.response?.data || { message: err.message });
        }
    }
);

export const forgotPassword = createAsyncThunk(
    "auth/forgot-password",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await UserAuthApi.forgotPassword(payload);
            return res;
        } catch (err) {
            return rejectWithValue(err?.response?.data || { message: err.message });
        }
    }
);

export const resetPassword = createAsyncThunk(
    "auth/reset-password",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await UserAuthApi.resetPassword(payload);
            return res;
        } catch (err) {
            return rejectWithValue(err?.response?.data || { message: err.message });
        }
    }
);

const initialState = {
    userData: null,
    wallets: null,
    loading: false,
    isLogin: false,
    error: null,
    authChecked: false
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        resetAuth: (state) => {
            state.userData = null;
            state.isLogin = false;
            state.loading = false;
            state.error = null;
            state.authChecked = true;
        },
    },
    extraReducers: (builder) => {
        builder

            // new register

            .addCase(LoginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(LoginUser.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(LoginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Registration failed";
            })

            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Registration failed";
            })


            .addCase(sendLoginOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendLoginOtp.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(sendLoginOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Could not send the code";
            })

            .addCase(verifyLoginOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyLoginOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.userData = action.payload?.data?.user ?? action.payload?.user ?? state.userData;
                state.isLogin = true;
            })
            .addCase(verifyLoginOtp.rejected, (state, action) => {
                state.loading = false;
                state.isLogin = false;
                state.error = action.payload?.message || "Invalid or expired code";
            })

            .addCase(forgotPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(forgotPassword.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Could not send the reset link";
            })

            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Could not reset the password";
            });
    },
});


export const { resetAuth } = authSlice.actions;
export const selectAuthUser = (state) => state.auth.userData;
export const selectIsLogin = (state) => state.auth.isLogin;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthChecked = (state) => state.auth.authChecked;
export const selectUserWallet = (state) => state.auth.wallets;
export default authSlice.reducer;