/**
 * Input validation utilities
 */

export class Validator {
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid
     */
    static isEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone number (Taiwan format)
     * @param {string} phone - Phone number to validate
     * @returns {boolean} True if valid
     */
    static isPhone(phone) {
        const phoneRegex = /^(\+886|0)?[0-9]{9,10}$/;
        return phoneRegex.test(phone.replace(/[\s-]/g, ''));
    }

    /**
     * Validate required fields
     * @param {Object} data - Data object
     * @param {Array<string>} requiredFields - Required field names
     * @returns {Object} Validation result
     */
    static validateRequired(data, requiredFields) {
        const errors = {};

        for (const field of requiredFields) {
            if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
                errors[field] = `${field} is required`;
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }

    /**
     * Validate member data
     * @param {Object} member - Member data
     * @returns {Object} Validation result
     */
    static validateMember(member) {
        const errors = {};

        // Required fields
        if (!member.name || member.name.trim() === '') {
            errors.name = '姓名為必填';
        }

        // Email validation
        if (member.email && !this.isEmail(member.email)) {
            errors.email = '電子郵件格式不正確';
        }

        // Phone validation
        if (member.phone && !this.isPhone(member.phone)) {
            errors.phone = '電話號碼格式不正確';
        }

        // Gender validation
        if (member.gender && !['male', 'female', 'other'].includes(member.gender)) {
            errors.gender = '性別選項不正確';
        }

        // Faith status validation
        const validStatuses = ['newcomer', 'seeker', 'baptized', 'transferred'];
        if (member.faith_status && !validStatuses.includes(member.faith_status)) {
            errors.faith_status = '信仰狀態選項不正確';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }

    /**
     * Validate offering data
     * @param {Object} offering - Offering data
     * @returns {Object} Validation result
     */
    static validateOffering(offering) {
        const errors = {};

        // Required fields
        if (!offering.member_id) {
            errors.member_id = '會員 ID 為必填';
        }

        if (!offering.amount || offering.amount <= 0) {
            errors.amount = '奉獻金額必須大於 0';
        }

        if (!offering.type) {
            errors.type = '奉獻類別為必填';
        }

        if (!offering.method) {
            errors.method = '奉獻方式為必填';
        }

        // Type validation
        const validTypes = ['tithe', 'thanksgiving', 'building', 'special'];
        if (offering.type && !validTypes.includes(offering.type)) {
            errors.type = '奉獻類別選項不正確';
        }

        // Method validation
        const validMethods = ['cash', 'bank', 'linepay', 'card'];
        if (offering.method && !validMethods.includes(offering.method)) {
            errors.method = '奉獻方式選項不正確';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }

    /**
     * Validate event data
     * @param {Object} event - Event data
     * @returns {Object} Validation result
     */
    static validateEvent(event) {
        const errors = {};

        // Required fields
        if (!event.title || event.title.trim() === '') {
            errors.title = '活動名稱為必填';
        }

        if (!event.start_date) {
            errors.start_date = '開始時間為必填';
        }

        if (!event.location || event.location.trim() === '') {
            errors.location = '活動地點為必填';
        }

        // Date validation
        if (event.start_date && event.end_date) {
            const start = new Date(event.start_date);
            const end = new Date(event.end_date);

            if (end < start) {
                errors.end_date = '結束時間不能早於開始時間';
            }
        }

        // Capacity validation
        if (event.capacity && event.capacity < 0) {
            errors.capacity = '活動人數上限不能為負數';
        }

        // Fee validation
        if (event.fee && event.fee < 0) {
            errors.fee = '報名費用不能為負數';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }

    /**
     * Validate course data
     * @param {Object} course - Course data
     * @returns {Object} Validation result
     */
    static validateCourse(course) {
        const errors = {};

        // Required fields
        if (!course.title || course.title.trim() === '') {
            errors.title = '課程名稱為必填';
        }

        if (!course.instructor || course.instructor.trim() === '') {
            errors.instructor = '講師為必填';
        }

        if (!course.start_date) {
            errors.start_date = '開始日期為必填';
        }

        // Sessions validation
        if (course.sessions && course.sessions < 1) {
            errors.sessions = '課程堂數必須至少為 1';
        }

        // Capacity validation
        if (course.capacity && course.capacity < 0) {
            errors.capacity = '課程人數上限不能為負數';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }

    /**
     * Sanitize string input
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    static sanitize(str) {
        if (typeof str !== 'string') return str;

        return str
            .trim()
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .substring(0, 1000); // Limit length
    }

    /**
     * Sanitize object data
     * @param {Object} data - Data object
     * @returns {Object} Sanitized object
     */
    static sanitizeObject(data) {
        const sanitized = {};

        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                sanitized[key] = this.sanitize(value);
            } else {
                sanitized[key] = value;
            }
        }

        return sanitized;
    }
}
