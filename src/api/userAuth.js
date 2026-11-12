import ApiRequest from "../utils/makeRequest";
import { env } from "../utils/env";

export const UserAuthApi = {



  login: async (payload) => {
    return ApiRequest.post(
      `${env.api_base_url}${env.user_end_point}/login`,
      payload
    );
  },

  register: async (payload) => {
    console.log('payload', payload)
    return ApiRequest.post(
      `${env.api_base_url}${env.user_end_point}/register`,
      payload
    );
  },

  resendOTP: async (payload) => {
    return ApiRequest.post(
      `${env.api_base_url}${env.user_end_point}/resendOTP`,
      payload
    );
  },

  verifyOtp: async (payload) => {
    return ApiRequest.post(
      `${env.api_base_url}${env.user_end_point}/verifyOTP`,
      payload
    );
  },

  forgotPassword: async (payload) => {
    return ApiRequest.post(
      `${env.api_base_url}${env.user_end_point}/forgot-password`,
      payload
    );
  },

  resetPassword: async (payload) => {
    return ApiRequest.post(
      `${env.api_base_url}${env.user_end_point}/reset-password`,
      payload
    );
  },

  profileUpdate: async (payload) => {
    return ApiRequest.put(
      `${env.api_base_url}${env.user_end_point}profileUpdate`,
      payload
    );
  },

  checkAuth: async () => {
    return ApiRequest.get(
      `${env.api_base_url}${env.user_end_point}/check`,
    );
  },

  logout: () => {
    return ApiRequest.post(
      `${env.api_base_url}${env.user_end_point}/logout`
    )
  },

  googleUrl: `${env.api_base_url}/${env.user_end_point}/auth/google`,

};