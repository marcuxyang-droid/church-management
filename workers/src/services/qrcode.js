import QRCode from 'qrcode';

/**
 * QR Code Service
 * Generates QR codes for event check-in and other purposes
 */
export class QRCodeService {
    /**
     * Generate QR code as data URL
     * @param {string} data - Data to encode
     * @param {Object} options - QR code options
     * @returns {Promise<string>} Data URL of QR code image
     */
    static async generateDataURL(data, options = {}) {
        try {
            return await QRCode.toDataURL(data, {
                errorCorrectionLevel: 'M',
                type: 'image/png',
                width: options.width || 300,
                margin: options.margin || 2,
                color: {
                    dark: options.darkColor || '#000000',
                    light: options.lightColor || '#FFFFFF',
                },
            });
        } catch (error) {
            console.error('QR code generation error:', error);
            throw new Error(`Failed to generate QR code: ${error.message}`);
        }
    }

    /**
     * Generate QR code as buffer
     * @param {string} data - Data to encode
     * @param {Object} options - QR code options
     * @returns {Promise<Buffer>} QR code image buffer
     */
    static async generateBuffer(data, options = {}) {
        try {
            return await QRCode.toBuffer(data, {
                errorCorrectionLevel: 'M',
                type: 'png',
                width: options.width || 300,
                margin: options.margin || 2,
            });
        } catch (error) {
            console.error('QR code generation error:', error);
            throw new Error(`Failed to generate QR code: ${error.message}`);
        }
    }

    /**
     * Generate check-in QR code for event registration
     * @param {string} registrationId - Registration ID
     * @param {string} eventId - Event ID
     * @returns {Promise<string>} QR code data URL
     */
    static async generateCheckInQR(registrationId, eventId) {
        const data = JSON.stringify({
            type: 'event_checkin',
            registration_id: registrationId,
            event_id: eventId,
            timestamp: Date.now(),
        });

        return await this.generateDataURL(data);
    }

    /**
     * Generate member ID QR code
     * @param {string} memberId - Member ID
     * @returns {Promise<string>} QR code data URL
     */
    static async generateMemberQR(memberId) {
        const data = JSON.stringify({
            type: 'member_id',
            member_id: memberId,
            timestamp: Date.now(),
        });

        return await this.generateDataURL(data);
    }
}
