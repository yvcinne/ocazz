import axios from "axios"

export const axiosClient = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
})

// Automatically attach the token to every request if it exists
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})