/**
 * R2 Storage Service
 * Handles file uploads and retrievals from Cloudflare R2
 */
export class R2Service {
    constructor(bucket, options = {}) {
        this.bucket = bucket;
        this.publicBaseUrl = options.publicBaseUrl || '';
    }

    /**
     * Upload a file to R2
     * @param {string} key - File key/path
     * @param {ArrayBuffer|ReadableStream} data - File data
     * @param {Object} options - Upload options
     * @returns {string} Public URL of uploaded file
     */
    async upload(key, data, options = {}) {
        try {
            await this.bucket.put(key, data, {
                httpMetadata: {
                    contentType: options.contentType || 'application/octet-stream',
                },
                customMetadata: options.metadata || {},
            });

            if (this.publicBaseUrl) {
                return `${this.publicBaseUrl}/${encodeURIComponent(key)}`;
            }

            return key;
        } catch (error) {
            console.error('R2 upload error:', error);
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }

    /**
     * Get a file from R2
     * @param {string} key - File key/path
     * @returns {Object} File object with body and metadata
     */
    async get(key) {
        try {
            const object = await this.bucket.get(key);

            if (!object) {
                throw new Error('File not found');
            }

            return {
                body: object.body,
                contentType: object.httpMetadata.contentType,
                size: object.size,
                uploaded: object.uploaded,
            };
        } catch (error) {
            console.error('R2 get error:', error);
            throw new Error(`Failed to get file: ${error.message}`);
        }
    }

    /**
     * Delete a file from R2
     * @param {string} key - File key/path
     */
    async delete(key) {
        try {
            await this.bucket.delete(key);
            return { success: true };
        } catch (error) {
            console.error('R2 delete error:', error);
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }

    /**
     * List files in a directory
     * @param {string} prefix - Directory prefix
     * @returns {Array} List of file objects
     */
    async list(prefix = '') {
        try {
            const listed = await this.bucket.list({ prefix });
            
            // R2 list returns { objects: [...], truncated: boolean }
            const objects = listed.objects || [];
            
            return objects.map(obj => ({
                key: obj.key,
                size: obj.size,
                uploaded: obj.uploaded,
                etag: obj.etag,
            }));
        } catch (error) {
            console.error('R2 list error:', error);
            throw new Error(`Failed to list files: ${error.message}`);
        }
    }

    /**
     * Generate a unique file key
     * @param {string} originalName - Original filename
     * @param {string} folder - Folder path
     * @returns {string} Unique file key
     */
    generateKey(originalName, folder = 'uploads') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const extension = originalName.split('.').pop();
        const nameWithoutExt = originalName.replace(`.${extension}`, '');
        const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

        return `${folder}/${timestamp}-${random}-${sanitized}.${extension}`;
    }
}
