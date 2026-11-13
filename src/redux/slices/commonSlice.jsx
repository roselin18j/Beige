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


export const Wishlist = createAsyncThunk(
    "common/Wishlist",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await commonApi.Wishlist(payload);
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
    products: [],
    wishlist: [],
    loading: false,
    error: null
};

const commonSlice = createSlice({
    name: "common",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(productList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(productList.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload?.data || [];
            })
            .addCase(productList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch products.";
            })

            .addCase(Wishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(Wishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.wishlist = action.payload?.data || [];
            })
            .addCase(Wishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch wishlist.";
            });
    }
});

export default commonSlice.reducer;
