import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Sets API
export const setsAPI = {
    getAll: () => api.get('/sets'),
    getById: (id) => api.get(`/sets/${id}`),
    create: (data) => api.post('/sets', data),
    update: (id, data) => api.put(`/sets/${id}`, data),
    delete: (id) => api.delete(`/sets/${id}`),
};

// Documents API
export const documentsAPI = {
    upload: (setId, file) => {
        const formData = new FormData();
        formData.append('document', file);
        return api.post(`/documents/upload/${setId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    getBySet: (setId) => api.get(`/documents/set/${setId}`),
    delete: (id) => api.delete(`/documents/${id}`),
};

// RAG API
export const ragAPI = {
    query: (query, setId = null, limit = 5) =>
        api.post('/rag/query', { query, setId, limit }),

    generatePlan: (setId, duration = 7, hoursPerDay = 2) =>
        api.post(`/rag/generate-plan/${setId}`, { duration, hoursPerDay }),

    getConnections: (setId) => api.get(`/rag/connections/${setId}`),

    generateHeadlines: (setId, limit = 5) =>
        api.post(`/rag/headlines/${setId}`, { limit }),

    analyzeGaps: (setId) => api.post(`/rag/gap-analysis/${setId}`),
};

// Search API
export const searchAPI = {
    search: (query, limit = 10) => api.post('/search', { query, limit }),
    getRelated: (setId) => api.get(`/search/related/${setId}`),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
