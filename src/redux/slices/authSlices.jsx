import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ApiRequest from "../../utils/makeRequest";
import { UserAuthApi } from "../../api/userAuth";


export const exchangeLogin = createAsyncThunk(
    "auth/exchangeLogin",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await UserAuthApi.login(payload);
            return res;
        } catch (err) {
            return rejectWithValue(err?.response?.data || { message: err.message });
        }
    }
);
export const checkAuth = createAsyncThunk(
    "auth/checkAuth",
    async (_, { rejectWithValue }) => {
        try {
            const res = await UserAuthApi.checkAuth();
            return res;
        } catch (err) {
            return rejectWithValue(err || response?.data || { success: false });
        }
    }
);


export const getMyProfile = createAsyncThunk(
    "auth/getMyProfile",
    async (_, { rejectWithValue }) => {
        try {
            const res = await UserAuthApi.profile()
            return res;
        } catch (err) {
            console.error("PROFILE ERROR:", err.response?.data || err.message);
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

export const profileUpdate = createAsyncThunk(
    "auth/profile/update",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await UserAuthApi.profileUpdate(payload)
            return res;
        } catch (err) {
            console.error("PROFILE Update ERROR:", err.response?.data || err.message);
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

export const checkAndSync = createAsyncThunk(
    "auth/check-and-sync",
    async (_, { rejectWithValue }) => {
        try {
            const res = await UserAuthApi.checkKyc();
            return res;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data || { message: err }
            );
        }
    }
);
export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            const res = await UserAuthApi.logout();
            return res;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Logout failed" });
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
            .addCase(exchangeLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(exchangeLogin.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload?.type == 0) {
                    state.isLogin = true;
                }
            })
            .addCase(exchangeLogin.rejected, (state, action) => {
                state.loading = false;
                state.isLogin = false;
            })

            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
            })

            .addCase(checkAuth.fulfilled, (state, action) => {
                state.loading = false;
                state.authChecked = true;
                state.isLogin = !!action.payload?.success;
            })

            .addCase(checkAuth.rejected, (state) => {
                state.loading = false;
                state.authChecked = true;
                state.isLogin = false;
            })



            .addCase(getMyProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(getMyProfile.fulfilled, (state, action) => {
                state.loading = false;

                if (action.payload.success) {
                    state.userData = action.payload.data;
                    state.wallets = action.payload.data?.wallets;
                }
            })

            .addCase(profileUpdate.pending, (state) => {
                state.loading = true;
            })
            .addCase(profileUpdate.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.success) {
                    state.userData = action.payload.data;
                }
            })

            .addCase(checkAndSync.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkAndSync.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(checkAndSync.rejected, (state, action) => {
                state.loading = false;
            })

            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.userData = null;
                state.isLogin = false;
                state.loading = false;
                state.error = null;
                state.authChecked = true;
            })
            .addCase(logoutUser.rejected, (state) => {
                state.userData = null;
                state.isLogin = false;
                state.loading = false;
                state.authChecked = true;
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
