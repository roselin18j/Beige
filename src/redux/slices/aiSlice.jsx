import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ApiRequest from "../../utils/makeRequest";
import { aiAnalyze } from "../../api/Aianalyze";





export const skinAnalyze = createAsyncThunk(
    "ai/skinAnalyze",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await aiAnalyze.skinAnalyze(payload);
            return res;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data || err?.message
                    ? err.response?.data || { message: err.message }
                    : { message: "Skin analysis failed." }
            );
        }
    }
);


export const makeupBaseAnalyze = createAsyncThunk(
    "ai/makeupBaseAnalyze",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await aiAnalyze.makeupBaseAnalyze(payload);
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

            .addCase(skinAnalyze.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(skinAnalyze.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload?.type == 0) {
                    state.isLogin = true;
                }
            })
            .addCase(skinAnalyze.rejected, (state, action) => {
                state.loading = false;
                state.isLogin = false;
            })



            .addCase(makeupBaseAnalyze.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(makeupBaseAnalyze.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload?.type == 0) {
                    state.isLogin = true;
                }
            })
            .addCase(makeupBaseAnalyze.rejected, (state, action) => {
                state.loading = false;
                state.isLogin = false;
            })


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
