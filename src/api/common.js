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


};