
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

export const cartList = createAsyncThunk(
    "common/cartList",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await commonApi.cartList(payload);
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

export const createOrder = createAsyncThunk(
    "common/createOrder",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await commonApi.createOrder(payload);
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

export const verifyPayment = createAsyncThunk(
    "common/verifyPayment",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await commonApi.verifyPayment(payload);
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

export const pastOrders = createAsyncThunk(
    "common/pastOrders",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await commonApi.pastOrders(payload);
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



export const getAllDeliveries = createAsyncThunk(
    "common/getAllDeliveries",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await commonApi.getAllDeliveries(payload);
            return res;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data || {
                    message: err?.message || "Failed to fetch deliveries."
                }
            );
        }
    }
);

export const getDeliveryByOrderId = createAsyncThunk(
    "common/getDeliveryByOrderId",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await commonApi.getDeliveryByOrderId(payload);
            return res;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data || {
                    message: err?.message || "Failed to fetch delivery."
                }
            );
        }
    }
);

export const getUserDeliveries = createAsyncThunk(
    "common/getUserDeliveries",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await commonApi.getUserDeliveries(payload);
            return res;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data || {
                    message: err?.message || "Failed to fetch user deliveries."
                }
            );
        }
    }
);

export const getDeliveryHistory = createAsyncThunk(
    "common/getDeliveryHistory",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await commonApi.getDeliveryHistory(payload);
            return res;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data || {
                    message: err?.message || "Failed to fetch delivery history."
                }
            );
        }
    }
);

export const updateDeliveryStatus = createAsyncThunk(
    "common/updateDeliveryStatus",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await commonApi.updateDeliveryStatus(payload);
            return res;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data || {
                    message: err?.message || "Failed to update delivery status."
                }
            );
        }
    }
);

export const updateTrackingDetails = createAsyncThunk(
    "common/updateTrackingDetails",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await commonApi.updateTrackingDetails(payload);
            return res;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data || {
                    message: err?.message || "Failed to update tracking details."
                }
            );
        }
    }
);

export const createDelivery = createAsyncThunk(
    "common/createDelivery",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await commonApi.createDelivery(payload);
            return res;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data || {
                    message: err?.message || "Failed to create delivery."
                }
            );
        }
    }
);

export const deleteDelivery = createAsyncThunk(
    "common/deleteDelivery",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await commonApi.deleteDelivery(payload);
            return res;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data || {
                    message: err?.message || "Failed to delete delivery."
                }
            );
        }
    }
);



const initialState = {
    products: [],
    wishlist: [],
    cart: [],
    loading: false,
    error: null,

    // Added delivery states
    deliveries: [],
    deliveryDetails: null,
    deliveryHistory: [],
    deliveryLoading: false,
    deliveryError: null
};

// ==========================================
// COMMON SLICE
// ==========================================

const commonSlice = createSlice({
    name: "common",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // PRODUCT LIST
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

            // WISHLIST
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
            })

            // CART
            .addCase(cartList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cartList.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload?.data || [];
            })
            .addCase(cartList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch cart.";
            })

            // ======================================
            // GET ALL DELIVERIES
            // ======================================

            .addCase(getAllDeliveries.pending, (state) => {
                state.deliveryLoading = true;
                state.deliveryError = null;
            })
            .addCase(getAllDeliveries.fulfilled, (state, action) => {
                state.deliveryLoading = false;
                state.deliveries = action.payload?.data || [];
            })
            .addCase(getAllDeliveries.rejected, (state, action) => {
                state.deliveryLoading = false;
                state.deliveryError =
                    action.payload?.message || "Failed to fetch deliveries.";
            })

            // ======================================
            // GET DELIVERY BY ORDER ID
            // ======================================

            .addCase(getDeliveryByOrderId.pending, (state) => {
                state.deliveryLoading = true;
                state.deliveryError = null;
            })
            .addCase(getDeliveryByOrderId.fulfilled, (state, action) => {
                state.deliveryLoading = false;
                state.deliveryDetails = action.payload?.data || null;
            })
            .addCase(getDeliveryByOrderId.rejected, (state, action) => {
                state.deliveryLoading = false;
                state.deliveryError =
                    action.payload?.message || "Failed to fetch delivery.";
            })

            // ======================================
            // GET USER DELIVERIES
            // ======================================

            .addCase(getUserDeliveries.pending, (state) => {
                state.deliveryLoading = true;
                state.deliveryError = null;
            })
            .addCase(getUserDeliveries.fulfilled, (state, action) => {
                state.deliveryLoading = false;
                state.deliveries = action.payload?.data || [];
            })
            .addCase(getUserDeliveries.rejected, (state, action) => {
                state.deliveryLoading = false;
                state.deliveryError =
                    action.payload?.message || "Failed to fetch user deliveries.";
            })

            // ======================================
            // GET DELIVERY HISTORY
            // ======================================

            .addCase(getDeliveryHistory.pending, (state) => {
                state.deliveryLoading = true;
                state.deliveryError = null;
            })
            .addCase(getDeliveryHistory.fulfilled, (state, action) => {
                state.deliveryLoading = false;
                state.deliveryHistory =
                    action.payload?.data?.statusHistory ||
                    action.payload?.data ||
                    [];
            })
            .addCase(getDeliveryHistory.rejected, (state, action) => {
                state.deliveryLoading = false;
                state.deliveryError =
                    action.payload?.message || "Failed to fetch delivery history.";
            })

            // ======================================
            // UPDATE DELIVERY STATUS
            // ======================================

            .addCase(updateDeliveryStatus.pending, (state) => {
                state.deliveryLoading = true;
                state.deliveryError = null;
            })
            .addCase(updateDeliveryStatus.fulfilled, (state, action) => {
                state.deliveryLoading = false;

                const updatedDelivery = action.payload?.data;

                if (updatedDelivery?.orderId) {
                    const index = state.deliveries.findIndex(
                        (item) => item.orderId === updatedDelivery.orderId
                    );

                    if (index !== -1) {
                        state.deliveries[index] = {
                            ...state.deliveries[index],
                            ...updatedDelivery
                        };
                    }

                    if (
                        state.deliveryDetails?.orderId === updatedDelivery.orderId
                    ) {
                        state.deliveryDetails = {
                            ...state.deliveryDetails,
                            ...updatedDelivery
                        };
                    }
                }
            })
            .addCase(updateDeliveryStatus.rejected, (state, action) => {
                state.deliveryLoading = false;
                state.deliveryError =
                    action.payload?.message || "Failed to update delivery status.";
            })

            // ======================================
            // UPDATE TRACKING DETAILS
            // ======================================

            .addCase(updateTrackingDetails.pending, (state) => {
                state.deliveryLoading = true;
                state.deliveryError = null;
            })
            .addCase(updateTrackingDetails.fulfilled, (state, action) => {
                state.deliveryLoading = false;

                const updatedDelivery = action.payload?.data;

                if (updatedDelivery?.orderId) {
                    const index = state.deliveries.findIndex(
                        (item) => item.orderId === updatedDelivery.orderId
                    );

                    if (index !== -1) {
                        state.deliveries[index] = {
                            ...state.deliveries[index],
                            ...updatedDelivery
                        };
                    }

                    if (
                        state.deliveryDetails?.orderId === updatedDelivery.orderId
                    ) {
                        state.deliveryDetails = {
                            ...state.deliveryDetails,
                            ...updatedDelivery
                        };
                    }
                }
            })
            .addCase(updateTrackingDetails.rejected, (state, action) => {
                state.deliveryLoading = false;
                state.deliveryError =
                    action.payload?.message || "Failed to update tracking details.";
            })

            // ======================================
            // CREATE DELIVERY
            // ======================================

            .addCase(createDelivery.pending, (state) => {
                state.deliveryLoading = true;
                state.deliveryError = null;
            })
            .addCase(createDelivery.fulfilled, (state, action) => {
                state.deliveryLoading = false;

                const newDelivery = action.payload?.data;

                if (newDelivery) {
                    const exists = state.deliveries.some(
                        (item) => item.orderId === newDelivery.orderId
                    );

                    if (!exists) {
                        state.deliveries.unshift(newDelivery);
                    }
                }
            })
            .addCase(createDelivery.rejected, (state, action) => {
                state.deliveryLoading = false;
                state.deliveryError =
                    action.payload?.message || "Failed to create delivery.";
            })

            // ======================================
            // DELETE DELIVERY
            // ======================================

            .addCase(deleteDelivery.pending, (state) => {
                state.deliveryLoading = true;
                state.deliveryError = null;
            })
            .addCase(deleteDelivery.fulfilled, (state, action) => {
                state.deliveryLoading = false;

                // Assumes the delete thunk receives the orderId as its payload.
                const orderId = action.meta.arg;

                state.deliveries = state.deliveries.filter(
                    (item) => item.orderId !== orderId
                );

                if (state.deliveryDetails?.orderId === orderId) {
                    state.deliveryDetails = null;
                }
            })
            .addCase(deleteDelivery.rejected, (state, action) => {
                state.deliveryLoading = false;
                state.deliveryError =
                    action.payload?.message || "Failed to delete delivery.";
            });
    }
});

export default commonSlice.reducer;
