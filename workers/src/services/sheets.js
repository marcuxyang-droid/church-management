const encoder = new TextEncoder();
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SHEETS_BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * Google Sheets Service (Cloudflare Workers compatible)
 * Handles all interactions with Google Sheets using the service account credentials provided via env.
 */
export class SheetsService {
    constructor(env) {
        if (!env.GOOGLE_SHEETS_CREDENTIALS) {
            throw new Error('Missing GOOGLE_SHEETS_CREDENTIALS');
        }
        if (!env.GOOGLE_SHEET_ID) {
            throw new Error('Missing GOOGLE_SHEET_ID');
        }

        this.credentials = JSON.parse(env.GOOGLE_SHEETS_CREDENTIALS);
        this.sheetId = env.GOOGLE_SHEET_ID;
        this.cachedToken = null;
        this.tokenExpiry = 0;
        this.privateKey = null;
        this.headersCache = new Map();
    }

    async getAccessToken() {
        const now = Date.now();
        if (this.cachedToken && now < this.tokenExpiry) {
            return this.cachedToken;
        }

        const assertion = await this.createJWT();
        const response = await fetch(GOOGLE_TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion,
            }),
        });

        if (!response.ok) {
            const message = await response.text();
            throw new Error(`Failed to obtain Google access token: ${message}`);
        }

        const data = await response.json();
        this.cachedToken = data.access_token;
        this.tokenExpiry = now + (data.expires_in - 60) * 1000; // refresh one minute early
        return this.cachedToken;
    }

    async createJWT() {
        const now = Math.floor(Date.now() / 1000);
        const header = { alg: 'RS256', typ: 'JWT' };
        const claim = {
            iss: this.credentials.client_email,
            scope: 'https://www.googleapis.com/auth/spreadsheets',
            aud: GOOGLE_TOKEN_URL,
            exp: now + 3600,
            iat: now,
        };

        const encodedHeader = base64UrlEncodeString(JSON.stringify(header));
        const encodedClaim = base64UrlEncodeString(JSON.stringify(claim));
        const message = `${encodedHeader}.${encodedClaim}`;

        const key = await this.getPrivateKey();
        const signature = await crypto.subtle.sign(
            { name: 'RSASSA-PKCS1-v1_5' },
            key,
            encoder.encode(message),
        );

        const encodedSignature = base64UrlEncodeBuffer(signature);
        return `${message}.${encodedSignature}`;
    }

    async getPrivateKey() {
        if (this.privateKey) {
            return this.privateKey;
        }

        const pem = this.credentials.private_key
            .replace('-----BEGIN PRIVATE KEY-----', '')
            .replace('-----END PRIVATE KEY-----', '')
            .replace(/\s+/g, '');

        const binary = Uint8Array.from(atob(pem), (char) => char.charCodeAt(0));
        this.privateKey = await crypto.subtle.importKey(
            'pkcs8',
            binary.buffer,
            {
                name: 'RSASSA-PKCS1-v1_5',
                hash: 'SHA-256',
            },
            false,
            ['sign'],
        );

        return this.privateKey;
    }

    async request(path, options = {}) {
        const token = await this.getAccessToken();
        const response = await fetch(`${SHEETS_BASE_URL}/${this.sheetId}${path}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...(options.headers || {}),
            },
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Google Sheets API error: ${response.status} ${errorBody}`);
        }

        return response.json();
    }

    async read(sheetName, range = 'A:Z') {
        try {
            const encodedRange = encodeURIComponent(`${sheetName}!${range}`);
            const data = await this.request(`/values/${encodedRange}`);
            const rows = data.values || [];
            if (rows.length === 0) {
                this.headersCache.set(sheetName, []);
                return [];
            }

            const headers = rows[0];
            this.headersCache.set(sheetName, headers);

            return rows.slice(1).map((row) => {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index] ?? '';
                });
                return obj;
            });
        } catch (error) {
            console.error(`Error reading from ${sheetName}:`, error);
            throw new Error(`Failed to read from ${sheetName}`);
        }
    }

    async append(sheetName, values) {
        try {
            const range = encodeURIComponent(`${sheetName}!A:A`);
            return await this.request(`/values/${range}:append?valueInputOption=USER_ENTERED`, {
                method: 'POST',
                body: JSON.stringify({ values: [values] }),
            });
        } catch (error) {
            console.error(`Error appending to ${sheetName}:`, error);
            throw new Error(`Failed to append to ${sheetName}`);
        }
    }

    async update(sheetName, rowIndex, values) {
        try {
            const actualRow = rowIndex + 2; // compensate for header + zero-based index
            const range = encodeURIComponent(`${sheetName}!A${actualRow}:Z${actualRow}`);
            return await this.request(`/values/${range}?valueInputOption=USER_ENTERED`, {
                method: 'PUT',
                body: JSON.stringify({ values: [values] }),
            });
        } catch (error) {
            console.error(`Error updating ${sheetName}:`, error);
            throw new Error(`Failed to update ${sheetName}`);
        }
    }

    async delete(sheetName, id) {
        try {
            const rows = await this.read(sheetName);
            const rowIndex = rows.findIndex((row) => row.id === id);

            if (rowIndex === -1) {
                throw new Error('Record not found');
            }

            const row = rows[rowIndex];
            row.status = 'deleted';
            row.updated_at = new Date().toISOString();

            await this.update(sheetName, rowIndex, Object.values(row));
            return { success: true, id };
        } catch (error) {
            console.error(`Error deleting from ${sheetName}:`, error);
            throw new Error(`Failed to delete from ${sheetName}`);
        }
    }

    async find(sheetName, criteria = {}) {
        const rows = await this.read(sheetName);
        if (Object.keys(criteria).length === 0) {
            return rows;
        }

        return rows.filter((row) =>
            Object.entries(criteria).every(([key, value]) => row[key] === value),
        );
    }

    async findById(sheetName, id) {
        const rows = await this.read(sheetName);
        return rows.find((row) => row.id === id) || null;
    }

    async getHeaders(sheetName) {
        if (this.headersCache.has(sheetName)) {
            return this.headersCache.get(sheetName);
        }

        const encodedRange = encodeURIComponent(`${sheetName}!1:1`);
        const data = await this.request(`/values/${encodedRange}`);
        const headers = (data.values && data.values[0]) || [];
        this.headersCache.set(sheetName, headers);
        return headers;
    }

    async createSheet(sheetName, headers) {
        try {
            await this.request(':batchUpdate', {
                method: 'POST',
                body: JSON.stringify({
                    requests: [
                        {
                            addSheet: {
                                properties: { title: sheetName },
                            },
                        },
                    ],
                }),
            });

            const range = encodeURIComponent(`${sheetName}!A1`);
            await this.request(`/values/${range}?valueInputOption=USER_ENTERED`, {
                method: 'PUT',
                body: JSON.stringify({ values: [headers] }),
            });

            this.headersCache.set(sheetName, headers);
        } catch (error) {
            console.error(`Error creating sheet ${sheetName}:`, error);
            throw new Error(`Failed to create sheet ${sheetName}`);
        }
    }
}

function base64UrlEncodeString(str) {
    const bytes = encoder.encode(str);
    return base64UrlEncodeBuffer(bytes.buffer);
}

function base64UrlEncodeBuffer(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    bytes.forEach((b) => {
        binary += String.fromCharCode(b);
    });

    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}
