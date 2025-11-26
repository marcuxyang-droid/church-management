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

    getHeaders(includeJson = true) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        return {
            ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const isFormData = options.body instanceof FormData;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(!isFormData),
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

    // Courses endpoints
    async getCourses(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/courses${query ? `?${query}` : ''}`);
    }

    async getCourse(id) {
        return this.request(`/api/courses/${id}`);
    }

    async createCourse(data) {
        return this.request('/api/courses', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateCourse(id, data) {
        return this.request(`/api/courses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteCourse(id) {
        return this.request(`/api/courses/${id}`, {
            method: 'DELETE',
        });
    }

    // Cell Groups endpoints
    async getCellGroups(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/cellgroups${query ? `?${query}` : ''}`);
    }

    async getCellGroup(id) {
        return this.request(`/api/cellgroups/${id}`);
    }

    async createCellGroup(data) {
        return this.request('/api/cellgroups', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateCellGroup(id, data) {
        return this.request(`/api/cellgroups/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteCellGroup(id) {
        return this.request(`/api/cellgroups/${id}`, {
            method: 'DELETE',
        });
    }

    // Volunteers endpoints
    async getVolunteers(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/volunteers${query ? `?${query}` : ''}`);
    }

    async getVolunteer(id) {
        return this.request(`/api/volunteers/${id}`);
    }

    async createVolunteer(data) {
        return this.request('/api/volunteers', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateVolunteer(id, data) {
        return this.request(`/api/volunteers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteVolunteer(id) {
        return this.request(`/api/volunteers/${id}`, {
            method: 'DELETE',
        });
    }

    // Finance endpoints
    async getFinanceTransactions(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/finance${query ? `?${query}` : ''}`);
    }

    async getFinanceTransaction(id) {
        return this.request(`/api/finance/${id}`);
    }

    async createFinanceTransaction(data) {
        return this.request('/api/finance', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateFinanceTransaction(id, data) {
        return this.request(`/api/finance/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteFinanceTransaction(id) {
        return this.request(`/api/finance/${id}`, {
            method: 'DELETE',
        });
    }

    // Surveys endpoints
    async getSurveys(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/surveys${query ? `?${query}` : ''}`);
    }

    async getSurvey(id) {
        return this.request(`/api/surveys/${id}`);
    }

    async createSurvey(data) {
        return this.request('/api/surveys', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateSurvey(id, data) {
        return this.request(`/api/surveys/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteSurvey(id) {
        return this.request(`/api/surveys/${id}`, {
            method: 'DELETE',
        });
    }

    async getSurveyResponses(surveyId) {
        return this.request(`/api/surveys/${surveyId}/responses`);
    }

    // Media endpoints
    async getMedia(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/media${query ? `?${query}` : ''}`);
    }

    async getMediaItem(id) {
        return this.request(`/api/media/${id}`);
    }

    async createMedia(data) {
        return this.request('/api/media', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateMedia(id, data) {
        return this.request(`/api/media/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteMedia(id) {
        return this.request(`/api/media/${id}`, {
            method: 'DELETE',
        });
    }

    // Tags endpoints
    async getTags(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/tags${query ? `?${query}` : ''}`);
    }

    async getTag(id) {
        return this.request(`/api/tags/${id}`);
    }

    async createTag(data) {
        return this.request('/api/tags', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateTag(id, data) {
        return this.request(`/api/tags/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteTag(id) {
        return this.request(`/api/tags/${id}`, {
            method: 'DELETE',
        });
    }

    // Tag Rules endpoints
    async getTagRules(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/tags/rules${query ? `?${query}` : ''}`);
    }

    async createTagRule(data) {
        return this.request('/api/tags/rules', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateTagRule(id, data) {
        return this.request(`/api/tags/rules/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteTagRule(id) {
        return this.request(`/api/tags/rules/${id}`, {
            method: 'DELETE',
        });
    }

    // Auto-tagging
    async applyAutoTags(memberId) {
        return this.request(`/api/tags/apply/${memberId}`, {
            method: 'POST',
        });
    }

    // Settings endpoints
    async getSettings() {
        return this.request('/api/settings');
    }

    async updateSettings(data) {
        return this.request('/api/settings', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async uploadLogo(file) {
        const formData = new FormData();
        formData.append('file', file);
        return this.request('/api/settings/logo', {
            method: 'POST',
            body: formData,
        });
    }

    // Roles endpoints
    async getRoles() {
        return this.request('/api/roles');
    }

    async createRole(data) {
        return this.request('/api/roles', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateRole(id, data) {
        return this.request(`/api/roles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteRole(id) {
        return this.request(`/api/roles/${id}`, {
            method: 'DELETE',
        });
    }

    // User management endpoints
    async getUsers() {
        return this.request('/api/users');
    }

    async createUser(data) {
        return this.request('/api/users', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateUser(id, data) {
        return this.request(`/api/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async resendVerification(id) {
        return this.request(`/api/users/${id}/resend-verification`, {
            method: 'POST',
        });
    }
}

export const api = new APIClient();
