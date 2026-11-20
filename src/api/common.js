import ApiRequest from "../utils/makeRequest";
import { env } from "../utils/env";

export const commonApi = {


  productList: async (payload) => {
    return ApiRequest.get(
      `${env.api_base_url}${env.user_end_point}/products`,
    );
  },

  Wishlist: async (payload) => {
    return ApiRequest.post(
      `${env.api_base_url}${env.user_end_point}/Wishlist`,
      payload
    );
  },


  cartList: async (payload) => {
    return ApiRequest.post(
      `${env.api_base_url}${env.user_end_point}/cart`,
      payload
    );
  },

  createOrder: async (payload) => {
    return ApiRequest.post(
      `${env.api_base_url}${env.user_end_point}/create-order`,
      payload
    );
  },


  verifyPayment: async (payload) => {
    return ApiRequest.post(
      `${env.api_base_url}${env.user_end_point}/verify-payments`,
      payload
    );
  },


  pastOrders: async (payload) => {
    return ApiRequest.post(
      `${env.api_base_url}${env.user_end_point}/past-orders`,
      payload
    );
  },


  getAllDeliveries: async (payload) => {
    return ApiRequest.get(
      `${env.api_base_url}${env.user_end_point}/all-deliveries`,
    );
  },

  getDeliveryByOrderId: async (payload) => {
    return ApiRequest.get(
      `${env.api_base_url}${env.user_end_point}/delivery/${payload}`,
    );
  },


  getUserDeliveries: async (payload) => {
    return ApiRequest.get(
      `${env.api_base_url}${env.user_end_point}/user-deliveries/:userid`,
    );
  },


  getDeliveryHistory: async (payload) => {
    return ApiRequest.get(
      `${env.api_base_url}${env.user_end_point}/delivery-history/:orderId`,
    );
  },

  updateDeliveryStatus: async (payload) => {
    return ApiRequest.post(
      `${env.api_base_url}${env.user_end_point}/update-delivery/:orderId`,
      payload
    );
  },

  updateTrackingDetails: async (payload) => {
    return ApiRequest.post(
      `${env.api_base_url}${env.user_end_point}/update-tracking/:orderId`,
      payload
    );
  },
  
  createDelivery: async (payload) => {
    return ApiRequest.post(
      `${env.api_base_url}${env.user_end_point}/create-delivery`,
      payload
    );
  },

  deleteDelivery: async (payload) => {
    return ApiRequest.delete(
      `${env.api_base_url}${env.user_end_point}/delete-delivery/:orderId`,
      payload
    );
  },


};







