import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 second timeout
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

    getAllHeadlines: (limit = 10) => api.get(`/rag/headlines?limit=${limit}`),

    generateHeadlines: (setId, limit = 5) =>
        api.post(`/rag/headlines/${setId}`, { limit }),

    analyzeGaps: (setId) => api.post(`/rag/gap-analysis/${setId}`),
};

// Search API
export const searchAPI = {
    search: (query, limit = 10) => api.post('/search', { query, limit }),
    getRelated: (setId) => api.get(`/search/related/${setId}`),
};

// Progress API
export const progressAPI = {
    getOverview: () => api.get('/progress/overview'),
    getGapAnalysis: (setId) => api.get(`/progress/gap-analysis/${setId}`),
    getExamAnalysis: (limit = 30) => api.get(`/progress/exam-analysis?limit=${limit}`),
    logSession: (data) => api.post('/progress/session', data),
    logQuiz: (data) => api.post('/progress/quiz', data),
    logInteraction: (data) => api.post('/progress/interaction', data),
};

// Health check
export const healthCheck = () => api.get('/health');

// Auth API
export const authAPI = {
    sendSignupOtp: (email) => api.post('/auth/send-signup-otp', { email }),
    signup: (data) => api.post('/auth/signup', data),
    login: (email, password) => api.post('/auth/login', { email, password }),
    sendResetOtp: (email) => api.post('/auth/send-reset-otp', { email }),
    resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Advanced Intelligence API
export const advancedAPI = {
    getLearningTwin: (setId) => api.get(`/advanced/learning-twin/${setId}`),
    recomputeLearningTwin: (setId) => api.post(`/advanced/learning-twin/${setId}/recompute`),
    safeQuery: (query, setId = null) => api.post('/advanced/safe-query', { query, setId }),
    getBreakpoint: (setId) => api.get(`/advanced/breakpoint/${setId}`),
    generateExam: (setId, numQuestions = 8) =>
        api.post(`/advanced/exam/generate/${setId}`, { numQuestions }),
    getExamSession: (sessionId) => api.get(`/advanced/exam/session/${sessionId}`),
    submitExam: (sessionId, answers) =>
        api.post(`/advanced/exam/submit/${sessionId}`, { answers }),
};

export { API_BASE_URL };
export default api;
