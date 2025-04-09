import axios, {AxiosInstance} from "axios";
import {apiUrl} from "./api";
import {error} from "./notify";

const axiosInstance: AxiosInstance = axios.create({
    baseURL: `${apiUrl}`, // or your base URL
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
});

axiosInstance.interceptors.response.use(
    (response) => {
        // Optional: success toast here if needed
        return response;
    },
    (err) => {
        const message = err.response?.data?.message || 'Something went wrong';
        error(message);
        return Promise.reject(err);
    }
);

export default axiosInstance;
