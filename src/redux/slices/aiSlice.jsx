
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { aiAnalyze } from "../../api/Aianalyze";

export const skinAnalyze = createAsyncThunk(
    "ai/skinAnalyze",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await aiAnalyze.skinAnalyze(payload);
            return res;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data || { message: err.message || "Skin analysis failed." }
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
            return rejectWithValue(
                err?.response?.data || { message: err.message || "Makeup analysis failed." }
            );
        }
    }
);

const initialState = {
    skinResult: null,
    makeupResult: null,
    loading: false,
    error: null
};

const aiSlice = createSlice({
    name: "ai",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(skinAnalyze.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(skinAnalyze.fulfilled, (state, action) => {
                state.loading = false;
                state.skinResult = action.payload;
            })
            .addCase(skinAnalyze.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Skin analysis failed.";
            })

            .addCase(makeupBaseAnalyze.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(makeupBaseAnalyze.fulfilled, (state, action) => {
                state.loading = false;
                state.makeupResult = action.payload;
            })
            .addCase(makeupBaseAnalyze.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Makeup analysis failed.";
            });
    }
});

export default aiSlice.reducer;
