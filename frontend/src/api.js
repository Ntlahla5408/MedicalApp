import axios from 'axios';

const API_BASE = 'https://localhost:7084/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('username');
            localStorage.removeItem('userRole');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth services
export const authService = {
    login: async (username, password) => {
        const response = await api.post('/Auth/login', { username, password });
        return response.data;
    },
    
    register: async (userData) => {
        const response = await api.post('/Auth/register', userData);
        return response.data;
    },
    
    getUsers: async () => {
        const response = await api.get('/Auth/users');
        return response.data;
    }
};

// Patient services
export const patientService = {
    getAll: async () => {
        const response = await api.get('/Patients');
        return response.data;
    },
    
    getByCredentials: async (name, surname, username) => {
        const response = await api.get(`/Patients/search/${name}/${surname}/${username}`);
        return response.data;
    },
    
    create: async (patientData) => {
        const response = await api.post('/Patients', patientData);
        return response.data;
    },
    
    update: async (name, surname, username, updateData) => {
        const response = await api.put(`/Patients?name=${name}&surname=${surname}&username=${username}`, updateData);
        return response.data;
    },
    
    delete: async (name, surname, username) => {
        const response = await api.delete(`/Patients/by-credentials/${name}/${surname}/${username}`);
        return response.data;
    },
    
    search: async (term) => {
        const response = await api.get(`/Patients/search?term=${term}`);
        return response.data;
    }
};

export default api;