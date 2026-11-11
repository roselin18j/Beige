import axios from "axios";
import { env } from "./env";
import { AESEncryptPayload } from "../helper/AESEncrypt";
import { AESDecryptResponse } from "../helper/AESDecrypt";
const API = axios.create({
    baseURL: env.api_base_url,
    withCredentials: true,
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

const ApiRequest = {
    get: async (url, params = {}) => {
        try {
            const res = await API.get(url, { params });
            const decryptRes = AESDecryptResponse(res.data);
            return decryptRes;
        } catch (err) {
            throw err.response?.data || err;
        }
    },
    post: async (url, data = {}) => {
        try {
            const encrypted = AESEncryptPayload(data);
            const res = await API.post(url, encrypted);
            const decryptRes = AESDecryptResponse(res.data)
            return decryptRes;
        } catch (err) {
            throw err.response?.data || err;
        }
    },
    put: async (url, data = {}) => {
        try {
            const encrypted = AESEncryptPayload(data);
            const res = await API.put(url, encrypted);
            const decryptRes = AESDecryptResponse(res.data)
            return decryptRes;
        } catch (err) {
            throw err.response?.data || err;
        }
    },
    delete: async (url) => {
        try {
            const res = await API.delete(url);
            const decryptRes = AESDecryptResponse(res.data)
            return decryptRes;
        } catch (err) {
            throw err.response?.data || err;
        }
    },
    upload: async (url, formDataObj = {}) => {
        const formData = new FormData();
        Object.entries(formDataObj).forEach(([k, v]) => formData.append(k, v));
        const res = await API.post(url, formData)
        const decryptRes = AESDecryptResponse(res.data)
        return decryptRes;
    }
};

export default ApiRequest;




