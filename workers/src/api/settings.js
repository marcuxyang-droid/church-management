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
    hero_heading_main: '盼望每個人都能在這裡',
    hero_heading_accent: '被愛、被建立、被差派',
    hero_button_text: '加入Blessing Haven',
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

export async function getPublicSettings(c) {
    try {
        const sheets = new SheetsService(c.env);
        const rows = await sheets.read('Settings');
        const { settings } = normalizeSettings(rows);

        // 只返回前台需要的公开设置，不包含敏感信息
        const publicSettings = {
            church_name: settings.church_name || '',
            tagline: settings.tagline || '',
            contact_email: settings.contact_email || '',
            address: settings.address || '',
            service_times: settings.service_times || '',
            logo_url: settings.logo_url || '',
            facebook_url: settings.facebook_url || '',
            youtube_url: settings.youtube_url || '',
            hero_heading_main: settings.hero_heading_main || '',
            hero_heading_accent: settings.hero_heading_accent || '',
            hero_button_text: settings.hero_button_text || '',
            hero_bg_url: settings.hero_bg_url || '',
            hero_arc_image_url: settings.hero_arc_image_url || '',
        };

        return c.json({ settings: publicSettings });
    } catch (error) {
        console.error('Get public settings error:', error);
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
        const r2 = new R2Service(c.env.MEDIA_BUCKET, { publicBaseUrl });
        
        // List images from settings and hero folders
        const images = [];
        const prefixes = ['settings/', 'hero/'];
        
        for (const prefix of prefixes) {
            try {
                const listed = await r2.list(prefix);
                console.log(`Listed ${prefix}:`, listed.length, 'files');
                
                for (const obj of listed) {
                    if (obj.key && obj.key.match(/\.(png|jpg|jpeg|webp|svg)$/i)) {
                        const imageUrl = `${publicBaseUrl}/${encodeURIComponent(obj.key)}`;
                        images.push({
                            url: imageUrl,
                            key: obj.key,
                            uploadedAt: obj.uploaded?.toISOString() || new Date().toISOString(),
                        });
                    }
                }
            } catch (err) {
                console.error(`Error listing ${prefix}:`, err);
            }
        }

        console.log(`Total images found: ${images.length}`);
        return c.json({ images: images.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)) });
    } catch (error) {
        console.error('List images error:', error);
        return c.json({ error: '獲取圖片列表失敗', details: error.message }, 500);
    }
}

function getMediaBaseUrl(c) {
    if (c.env.MEDIA_PUBLIC_BASE_URL) return c.env.MEDIA_PUBLIC_BASE_URL.replace(/\/$/, '');
    const currentUrl = new URL(c.req.url);
    return `${currentUrl.protocol}//${currentUrl.host}/api/uploads`;
}

