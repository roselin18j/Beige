
import ApiRequest from "../utils/makeRequest";
import { env } from "../utils/env";

export const aiAnalyze = {
  skinAnalyze: (payload) => {
    return ApiRequest.postFormData(
      `${env.api_base_url}${env.user_end_point}/skinAnalyze`,
      payload
    );
  },

  makeupBaseAnalyze: (payload) => {
    return ApiRequest.postFormData(
      `${env.api_base_url}${env.user_end_point}/makeupBaseAnalyze`,
      payload
    );
  },
};