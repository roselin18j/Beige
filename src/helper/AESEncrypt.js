import CryptoJS from "crypto-js";
import { toast } from "react-toastify";

const generateHash = (payloadData) => {
    if (!payloadData || Object.keys(payloadData).length === 0) return "";
    const stringifiedPayload = JSON.stringify(payloadData);
    return CryptoJS.SHA512(stringifiedPayload).toString(CryptoJS.enc.Hex);
};

export const AESEncryptPayload = (payload) => {

    if (!payload || (typeof payload === "object" && Object.keys(payload).length === 0)) {
        return payload; 
    }

    if (payload instanceof FormData) {
        return payload;
    }

    const id = Math.floor(Math.random() * 10) + 1;
    const payloadHash = generateHash(payload);

    if (!payloadHash) {
        toast.error("Invalid Request!");
        return null;
    }

    const secretKey = import.meta.env[`VITE_APP_${id}_ENCRYPTION_KEY`];
    if (!secretKey) {
        toast.error("Encryption Key Not Found!");
        return null;
    }

    try {
        const encPayload = CryptoJS.AES.encrypt(
            JSON.stringify(payload),
            secretKey
        ).toString();

        return { payload: encPayload, hash: payloadHash, keyId: id };
    } catch (error) {
        console.error("Encryption Error:", error);
        toast.error("Encryption Failed!");
        return null;
    }
};
