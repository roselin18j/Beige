import CryptoJS from "crypto-js";
import { toast } from "react-toastify";

export const generateHash = (payloadData) => {
    try {
        if (!payloadData || Object.keys(payloadData).length === 0) return "";
        const stringifiedPayload = JSON.stringify(payloadData);
        return CryptoJS.SHA512(stringifiedPayload).toString(CryptoJS.enc.Hex);
    } catch (error) {
        console.log({ generateHash: error })
        return null;
    }
};


export const decryptionRequestPayload = (keyId, encPayload) => {
    try {
        const secretKey = import.meta.env[`VITE_APP_RESPONSE_${keyId}_ENC_KEY`];
        var bytes = CryptoJS.AES.decrypt(encPayload, secretKey);
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return decryptedData;
    } catch (error) {
        console.log({ decryptionRequestPayload: error })
        return false
    };
};

export const AESDecryptResponse = (response) => {
    try {
        const { keyId, hash, payload } = response;


        if (!payload || !hash || !keyId) {
            return toast.error("Missing encryption fields in response!")
        }

        const decrypted = decryptionRequestPayload(keyId, payload);
        if (!decrypted) {
            return toast.error("Failed to decrypt the response!")
        }

        const calculatedHash = generateHash(decrypted);
        if (calculatedHash !== hash) {
            return toast.error("Hash mismatch. Data integrity check failed.")
        }

        console.log('decrypted----------', decrypted)
        return decrypted
    } catch (error) {
        toast.error("Invalid Response!")
    };
};