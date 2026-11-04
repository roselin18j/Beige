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
  }
};