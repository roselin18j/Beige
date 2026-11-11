import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ApiRequest from "../../utils/makeRequest";
import { commonApi } from "../../api/common";





export const productList = createAsyncThunk(
    "common/productList",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await commonApi.productList(payload);
            return res;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data || {
                    message: err?.message || "Failed to fetch products."
                }
            );
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

            .addCase(productList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(productList.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload?.type == 0) {
                    state.isLogin = true;
                }
            })
            .addCase(productList.rejected, (state, action) => {
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
