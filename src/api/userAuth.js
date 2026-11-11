import ApiRequest from "../utils/makeRequest";
import { env } from "../utils/env";

export const UserAuthApi = {

  login: async (payload) => {
    return ApiRequest.post(
      `${env.user_end_point}/auth/login`,
      payload
    );
  },
  profile: async () => {
    return ApiRequest.get(
      `${env.user_end_point}/auth/profile`,
    );
  },
  profileUpdate: async (payload) => {
    return ApiRequest.put(
      `${env.user_end_point}/auth/profile/update`,
      payload
    );
  },
  checkAuth: async () => {
    return ApiRequest.get(
      `${env.user_end_point}/auth/check`,
    );
  },
  checkKyc: async () => {
    return ApiRequest.post(
      `${env.user_end_point}/auth/check-and-sync`,
    );
  },
  logout: () => {
    return ApiRequest.post(
      `${env.user_end_point}/auth/logout`
    )
  },


    aiMakeup : () => {
    return ApiRequest.post(
      `${env.user_end_point}/auth/logout`
    )
  },

// new register

  register: async (payload) => {
    return ApiRequest.post(
      `${env.user_end_point}/auth/register`,
      payload
    );
  },
  sendOtp: async (payload) => {
    return ApiRequest.post(
      `${env.user_end_point}/auth/otp/send`,
      payload
    );
  },
  verifyOtp: async (payload) => {
    return ApiRequest.post(
      `${env.user_end_point}/auth/otp/verify`,
      payload
    );
  },
  forgotPassword: async (payload) => {
    return ApiRequest.post(
      `${env.user_end_point}/auth/forgot-password`,
      payload
    );
  },
  resetPassword: async (payload) => {
    return ApiRequest.post(
      `${env.user_end_point}/auth/reset-password`,
      payload
    );
  },

  /** Google sign-in: window.location.assign(UserAuthApi.googleUrl) */
googleUrl: `${env.api_base_url}/${env.user_end_point}/auth/google`,

};