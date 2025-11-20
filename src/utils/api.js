const fallbackApi = 'https://church-management.marcuxyang.workers.dev';

function sanitizeUrl(url = '') {
    return url.replace(/\/$/, '');
}

function shouldIgnoreEnvUrl(url) {
    if (!url) return true;
    if (typeof window === 'undefined') return false;

    const isLocalEnv = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    const pointsToLocal = url.includes('localhost') || url.includes('127.0.0.1');

    return !isLocalEnv && pointsToLocal;
}

const envApiUrl = import.meta.env.VITE_API_URL;
const API_URL = sanitizeUrl(shouldIgnoreEnvUrl(envApiUrl) ? fallbackApi : (envApiUrl || fallbackApi));

class APIClient {
    constructor() {
        this.baseURL = API_URL;
    }

    getHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '請求失敗');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async login(email, password) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async getCurrentUser() {
        return this.request('/api/auth/me');
    }

    async changePassword(currentPassword, newPassword) {
        return this.request('/api/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword }),
        });
    }

    // Members endpoints
    async getMembers(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/members${query ? `?${query}` : ''}`);
    }

    async getMember(id) {
        return this.request(`/api/members/${id}`);
    }

    async createMember(data) {
        return this.request('/api/members', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateMember(id, data) {
        return this.request(`/api/members/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteMember(id) {
        return this.request(`/api/members/${id}`, {
            method: 'DELETE',
        });
    }

    // Offerings endpoints
    async getOfferings(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/offerings${query ? `?${query}` : ''}`);
    }

    async createOffering(data) {
        return this.request('/api/offerings', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getMemberOfferings(memberId, year) {
        const query = year ? `?year=${year}` : '';
        return this.request(`/api/offerings/member/${memberId}${query}`);
    }

    // Events endpoints
    async getEvents(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/events${query ? `?${query}` : ''}`);
    }

    async getEvent(id) {
        return this.request(`/api/events/${id}`);
    }

    async createEvent(data) {
        return this.request('/api/events', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateEvent(id, data) {
        return this.request(`/api/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async registerForEvent(id) {
        return this.request(`/api/events/${id}/register`, {
            method: 'POST',
        });
    }

    async checkInEvent(id, data) {
        return this.request(`/api/events/${id}/checkin`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}

export const api = new APIClient();
