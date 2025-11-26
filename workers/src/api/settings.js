import { SheetsService } from '../services/sheets.js';
import { R2Service } from '../services/r2.js';

const DEFAULT_SETTINGS = {
    church_name: 'Blessing Haven Church',
    tagline: '被愛、被建立、被差派',
    contact_email: 'info@blessing-haven.club',
    address: '',
    service_times: '',
    logo_url: '',
    facebook_url: '',
    youtube_url: '',
    hero_heading_main: '我們盼望每個人都能在這裡',
    hero_heading_accent: '被愛、被建立、被差派',
    hero_bg_url: '',
    hero_arc_image_url: '',
};

const ALLOWED_SETTING_KEYS = Object.keys(DEFAULT_SETTINGS);
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

function normalizeSettings(rows = []) {
    const settings = { ...DEFAULT_SETTINGS };
    const meta = {};

    rows.forEach((row) => {
        if (!row.key) return;
        settings[row.key] = row.value ?? '';
        meta[row.key] = {
            updated_at: row.updated_at || '',
            updated_by: row.updated_by || '',
        };
    });

    return { settings, meta };
}

async function upsertSettings(sheets, updates, updatedBy) {
    const rows = await sheets.read('Settings');
    const headers = await sheets.getHeaders('Settings');
    const timestamp = new Date().toISOString();

    for (const [key, value] of Object.entries(updates)) {
        const payload = {
            key,
            value: value ?? '',
            updated_by: updatedBy,
            updated_at: timestamp,
        };

        const rowIndex = rows.findIndex((row) => row.key === key);
        const rowValues = headers.map((header) => payload[header] ?? '');

        if (rowIndex >= 0) {
            rows[rowIndex] = payload;
            await sheets.update('Settings', rowIndex, rowValues);
        } else {
            await sheets.append('Settings', rowValues);
        }
    }
}

/**
 * Get public settings (no authentication required)
 * GET /api/settings/public
 */
export async function getPublicSettings(c) {
    try {
        const sheets = new SheetsService(c.env);
        const rows = await sheets.read('Settings');
        const { settings } = normalizeSettings(rows);

        // Only return public-facing settings
        const publicSettings = {
            church_name: settings.church_name || '',
            tagline: settings.tagline || '',
            logo_url: settings.logo_url || '',
            hero_bg_url: settings.hero_bg_url || '',
            hero_arc_image_url: settings.hero_arc_image_url || '',
            hero_heading_main: settings.hero_heading_main || '',
            hero_heading_accent: settings.hero_heading_accent || '',
        };

        return c.json({ settings: publicSettings });
    } catch (error) {
        console.error('Get public settings error:', error);
        return c.json({ error: '獲取系統設定失敗' }, 500);
    }
}

export async function getSettings(c) {
    try {
        const sheets = new SheetsService(c.env);
        const rows = await sheets.read('Settings');
        const { settings, meta } = normalizeSettings(rows);

        return c.json({ settings, meta });
    } catch (error) {
        console.error('Get settings error:', error);
        return c.json({ error: '獲取系統設定失敗' }, 500);
    }
}

export async function updateSettings(c) {
    try {
        const user = c.get('user');
        const data = await c.req.json();
        if (!data || typeof data !== 'object') {
            return c.json({ error: '請提供有效的設定資料' }, 400);
        }

        const updates = {};
        for (const [key, value] of Object.entries(data)) {
            if (ALLOWED_SETTING_KEYS.includes(key)) {
                updates[key] = typeof value === 'string' ? value : String(value ?? '');
            }
        }

        if (Object.keys(updates).length === 0) {
            return c.json({ error: '沒有可更新的欄位' }, 400);
        }

        const sheets = new SheetsService(c.env);
        await upsertSettings(sheets, updates, user?.email || 'system');

        const rows = await sheets.read('Settings');
        const { settings, meta } = normalizeSettings(rows);

        return c.json({
            message: '系統設定已更新',
            settings,
            meta,
        });
    } catch (error) {
        console.error('Update settings error:', error);
        return c.json({ error: '更新系統設定失敗' }, 500);
    }
}

export async function uploadLogo(c) {
    try {
        const user = c.get('user');
        if (!c.env.MEDIA_BUCKET) {
            return c.json({ error: '尚未設定 R2 儲存空間' }, 500);
        }

        const contentType = c.req.header('content-type') || '';
        if (!contentType.includes('multipart/form-data')) {
            return c.json({ error: 'Content-Type 必須為 multipart/form-data' }, 400);
        }

        const formData = await c.req.formData();
        const file = formData.get('file');

        if (!file || typeof file.name !== 'string') {
            return c.json({ error: '請提供要上傳的檔案' }, 400);
        }

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return c.json({ error: '僅支援 PNG / JPG / WEBP / SVG 圖片' }, 400);
        }

        if (file.size > 5 * 1024 * 1024) {
            return c.json({ error: '檔案大小不得超過 5MB' }, 400);
        }

        const publicBaseUrl = getMediaBaseUrl(c);
        const r2 = new R2Service(c.env.MEDIA_BUCKET, { publicBaseUrl });
        const key = r2.generateKey(file.name, 'settings');
        const arrayBuffer = await file.arrayBuffer();
        const url = await r2.upload(key, arrayBuffer, {
            contentType: file.type,
            metadata: { uploadedBy: user?.email || 'system' },
        });

        const sheets = new SheetsService(c.env);
        await upsertSettings(sheets, { logo_url: url }, user?.email || 'system');

        return c.json({
            message: 'Logo 已更新',
            url,
        });
    } catch (error) {
        console.error('Upload logo error:', error);
        return c.json({ error: '上傳 Logo 失敗' }, 500);
    }
}

export async function uploadHeroImage(c) {
    try {
        const user = c.get('user');
        if (!c.env.MEDIA_BUCKET) {
            return c.json({ error: '尚未設定 R2 儲存空間' }, 500);
        }

        const contentType = c.req.header('content-type') || '';
        if (!contentType.includes('multipart/form-data')) {
            return c.json({ error: 'Content-Type 必須為 multipart/form-data' }, 400);
        }

        const formData = await c.req.formData();
        const file = formData.get('file');
        const type = formData.get('type'); // 'bg' or 'arc'

        if (!file || typeof file.name !== 'string') {
            return c.json({ error: '請提供要上傳的檔案' }, 400);
        }

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return c.json({ error: '僅支援 PNG / JPG / WEBP / SVG 圖片' }, 400);
        }

        if (file.size > 10 * 1024 * 1024) {
            return c.json({ error: '檔案大小不得超過 10MB' }, 400);
        }

        const publicBaseUrl = getMediaBaseUrl(c);
        const r2 = new R2Service(c.env.MEDIA_BUCKET, { publicBaseUrl });
        const key = r2.generateKey(file.name, `hero/${type || 'images'}`);
        const arrayBuffer = await file.arrayBuffer();
        const url = await r2.upload(key, arrayBuffer, {
            contentType: file.type,
            metadata: { uploadedBy: user?.email || 'system', type: type || 'image' },
        });

        const sheets = new SheetsService(c.env);
        const settingKey = type === 'arc' ? 'hero_arc_image_url' : 'hero_bg_url';
        await upsertSettings(sheets, { [settingKey]: url }, user?.email || 'system');

        return c.json({
            message: '圖片已上傳',
            url,
        });
    } catch (error) {
        console.error('Upload hero image error:', error);
        return c.json({ error: '上傳圖片失敗' }, 500);
    }
}

export async function listUploadedImages(c) {
    try {
        if (!c.env.MEDIA_BUCKET) {
            return c.json({ error: '尚未設定 R2 儲存空間' }, 500);
        }

        const publicBaseUrl = getMediaBaseUrl(c);
        console.log('[listUploadedImages] Public base URL:', publicBaseUrl);
        
        // List all images from R2 bucket
        const images = [];
        
        try {
            // List all objects in the bucket (no prefix filter to get everything)
            let listed = await c.env.MEDIA_BUCKET.list();
            console.log('[listUploadedImages] Total objects found:', listed.objects?.length || 0);
            if (listed.objects && listed.objects.length > 0) {
                console.log('[listUploadedImages] Sample keys:', listed.objects.slice(0, 5).map(obj => obj.key));
            }
            
            // Handle pagination if needed
            while (listed) {
                if (listed.objects && Array.isArray(listed.objects)) {
                    console.log('[listUploadedImages] Processing batch of', listed.objects.length, 'objects');
                    for (const obj of listed.objects) {
                        console.log('[listUploadedImages] Checking object:', obj.key, 'Size:', obj.size);
                        
                        // Check if it's an image by extension or by getting metadata
                        const isImageByExtension = obj.key && obj.key.match(/\.(png|jpg|jpeg|webp|svg|blob)$/i);
                        let isImage = isImageByExtension;
                        
                        // If extension doesn't match but we want to check MIME type, get object metadata
                        if (!isImageByExtension && obj.key) {
                            try {
                                const r2Obj = await c.env.MEDIA_BUCKET.head(obj.key);
                                if (r2Obj && r2Obj.httpMetadata && r2Obj.httpMetadata.contentType) {
                                    const contentType = r2Obj.httpMetadata.contentType;
                                    isImage = contentType.startsWith('image/');
                                    console.log('[listUploadedImages] Object', obj.key, 'has content type:', contentType, 'isImage:', isImage);
                                }
                            } catch (headErr) {
                                console.warn('[listUploadedImages] Could not get metadata for', obj.key, ':', headErr.message);
                            }
                        }
                        
                        if (isImage) {
                            let uploadedAt;
                            
                            if (obj.uploaded) {
                                if (obj.uploaded instanceof Date) {
                                    uploadedAt = obj.uploaded.toISOString();
                                } else if (typeof obj.uploaded === 'string') {
                                    uploadedAt = obj.uploaded;
                                } else if (typeof obj.uploaded === 'number') {
                                    uploadedAt = new Date(obj.uploaded).toISOString();
                                } else {
                                    uploadedAt = new Date(obj.uploaded).toISOString();
                                }
                            } else {
                                uploadedAt = new Date().toISOString();
                            }
                            
                            // Build URL - encode the key properly for path segments
                            const encodedKey = obj.key.split('/').map(segment => encodeURIComponent(segment)).join('/');
                            const imageUrl = `${publicBaseUrl}/${encodedKey}`;
                            
                            console.log('[listUploadedImages] Found image:', obj.key, '->', imageUrl);
                            
                            images.push({
                                url: imageUrl,
                                key: obj.key,
                                uploadedAt: uploadedAt,
                            });
                        } else {
                            console.log('[listUploadedImages] Skipping non-image:', obj.key);
                        }
                    }
                }
                
                // Check if there are more results
                if (listed.truncated && listed.cursor) {
                    console.log('[listUploadedImages] More results available, fetching next page...');
                    listed = await c.env.MEDIA_BUCKET.list({ cursor: listed.cursor });
                } else {
                    break;
                }
            }
        } catch (err) {
            console.error('[listUploadedImages] Error listing R2 objects:', err);
            // Try with specific prefixes as fallback
            const prefixes = ['settings/', 'hero/', 'hero/bg/', 'hero/arc/', 'hero/images/', 'uploads/'];
            for (const prefix of prefixes) {
                try {
                    console.log('[listUploadedImages] Trying prefix:', prefix);
                    const listed = await c.env.MEDIA_BUCKET.list({ prefix });
                    if (listed && listed.objects) {
                        console.log('[listUploadedImages] Found', listed.objects.length, 'objects with prefix', prefix);
                        if (listed.objects.length > 0) {
                            console.log('[listUploadedImages] Sample keys with prefix', prefix, ':', listed.objects.slice(0, 3).map(obj => obj.key));
                        }
                        for (const obj of listed.objects) {
                            console.log('[listUploadedImages] Checking object with prefix', prefix, ':', obj.key);
                            
                            // Check if it's an image by extension (including .blob) or by MIME type
                            const isImageByExtension = obj.key && obj.key.match(/\.(png|jpg|jpeg|webp|svg|blob)$/i);
                            let isImage = isImageByExtension;
                            
                            // If extension doesn't match, try to check MIME type
                            if (!isImageByExtension && obj.key) {
                                try {
                                    const r2Obj = await c.env.MEDIA_BUCKET.head(obj.key);
                                    if (r2Obj && r2Obj.httpMetadata && r2Obj.httpMetadata.contentType) {
                                        const contentType = r2Obj.httpMetadata.contentType;
                                        isImage = contentType.startsWith('image/');
                                        console.log('[listUploadedImages] Object', obj.key, 'has content type:', contentType);
                                    }
                                } catch (headErr) {
                                    // Silently continue if we can't get metadata
                                }
                            }
                            
                            if (isImage) {
                                const uploadedAt = obj.uploaded 
                                    ? (obj.uploaded instanceof Date 
                                        ? obj.uploaded.toISOString() 
                                        : typeof obj.uploaded === 'string' 
                                            ? obj.uploaded 
                                            : new Date(obj.uploaded).toISOString())
                                    : new Date().toISOString();
                                
                                // Avoid duplicates
                                if (!images.find(img => img.key === obj.key)) {
                                    const encodedKey = obj.key.split('/').map(segment => encodeURIComponent(segment)).join('/');
                                    const imageUrl = `${publicBaseUrl}/${encodedKey}`;
                                    images.push({
                                        url: imageUrl,
                                        key: obj.key,
                                        uploadedAt: uploadedAt,
                                    });
                                }
                            }
                        }
                    }
                } catch (prefixErr) {
                    console.error(`[listUploadedImages] Error listing ${prefix}:`, prefixErr);
                }
            }
        }

        console.log('[listUploadedImages] Returning', images.length, 'images');
        return c.json({ images: images.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)) });
    } catch (error) {
        console.error('[listUploadedImages] List images error:', error);
        return c.json({ error: '獲取圖片列表失敗: ' + error.message }, 500);
    }
}

function getMediaBaseUrl(c) {
    if (c.env.MEDIA_PUBLIC_BASE_URL) return c.env.MEDIA_PUBLIC_BASE_URL.replace(/\/$/, '');
    const currentUrl = new URL(c.req.url);
    return `${currentUrl.protocol}//${currentUrl.host}/api/uploads`;
}

