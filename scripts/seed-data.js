/**
 * Seed Test Data to Google Sheets
 * 插入測試數據到對應的 Sheet
 * 
 * Usage:
 * 1. 確保已設定 GOOGLE_SHEETS_CREDENTIALS 和 GOOGLE_SHEET_ID
 * 2. Run: node scripts/seed-data.js
 */

import { google } from 'googleapis';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Load credentials from environment variable or file
if (!process.env.GOOGLE_SHEETS_CREDENTIALS) {
    console.error('錯誤: 請設定 GOOGLE_SHEETS_CREDENTIALS 環境變數');
    console.error('或建立 credentials.json 檔案');
    process.exit(1);
}
const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1_zbYJMc_JqyLJ7DqxM6_iKnHVGJz1Q-cPmWQbJK1Af0';

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Helper function to append data
async function appendData(sheetName, values) {
    try {
        const range = `${sheetName}!A:Z`;
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: { values: [values] },
        });
        console.log(`✓ Inserted data into ${sheetName}`);
        return response;
    } catch (error) {
        console.error(`✗ Error inserting into ${sheetName}:`, error.message);
        if (error.message.includes('permission')) {
            console.error(`  → 請確認 service account (blessing-haven@amiable-evening-476910-p6.iam.gserviceaccount.com) 有編輯權限`);
        } else if (error.message.includes('Unable to parse range')) {
            console.error(`  → Sheet ${sheetName} 可能不存在，請先手動創建或執行 init-sheets.js`);
        }
    }
}

// Generate test data
async function seedData() {
    console.log('開始插入測試數據...\n');

    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 1. Insert Members (會友)
    console.log('插入會友資料...');
    const members = [
        [
            uuidv4(), '張三', 'male', '1990-05-15', '0912345678', 'zhang@example.com',
            '台北市信義區XX路XX號', '2020-01-15', '2020-06-20', 'believer',
            '', '', 'active', '小組長,敬拜', '', now, now
        ],
        [
            uuidv4(), '李四', 'female', '1992-08-22', '0923456789', 'li@example.com',
            '新北市板橋區YY路YY號', '2021-03-10', '2021-09-15', 'seeker',
            '', '', 'active', '新朋友', '', now, now
        ],
        [
            uuidv4(), '王五', 'male', '1988-12-05', '0934567890', 'wang@example.com',
            '台北市大安區ZZ路ZZ號', '2019-06-01', '2019-12-25', 'believer',
            '', '', 'active', '志工,同工', '', now, now
        ],
        [
            uuidv4(), '陳六', 'female', '1995-03-18', '0945678901', 'chen@example.com',
            '新北市新店區AA路AA號', '2022-02-14', '', 'seeker',
            '', '', 'active', '新朋友', '', now, now
        ],
        [
            uuidv4(), '劉七', 'male', '1985-11-30', '0956789012', 'liu@example.com',
            '台北市中山區BB路BB號', '2018-09-20', '2019-03-10', 'believer',
            '', '', 'active', '小組長', '', now, now
        ],
    ];

    let memberIds = [];
    for (const member of members) {
        await appendData('Members', member);
        memberIds.push(member[0]); // Store member IDs
    }

    // 2. Insert Events (活動)
    console.log('\n插入活動資料...');
    const events = [
        [
            uuidv4(),
            '主日崇拜',
            '每週主日崇拜，歡迎所有弟兄姊妹參加。我們一起敬拜、聽道、彼此交通。',
            `${today} 10:00:00`,
            `${today} 12:00:00`,
            '教會大堂',
            '200',
            '0',
            today,
            '',
            'published',
            memberIds[0],
            now
        ],
        [
            uuidv4(),
            '聖誕節特別聚會',
            '慶祝耶穌降生，我們將有特別的敬拜、信息分享和愛宴。歡迎邀請朋友一起參加！',
            `${nextMonth} 18:00:00`,
            `${nextMonth} 21:00:00`,
            '教會大堂',
            '300',
            '0',
            nextMonth,
            '',
            'published',
            memberIds[0],
            now
        ],
        [
            uuidv4(),
            '新朋友歡迎會',
            '專為新朋友舉辦的歡迎會，讓我們認識彼此，分享教會生活。',
            `${nextWeek} 14:00:00`,
            `${nextWeek} 16:00:00`,
            '教會副堂',
            '50',
            '0',
            nextWeek,
            '',
            'published',
            memberIds[1],
            now
        ],
        [
            uuidv4(),
            '禱告會',
            '每週三晚上的禱告會，一起為教會、城市和個人需要禱告。',
            `${nextWeek} 19:30:00`,
            `${nextWeek} 21:00:00`,
            '祈禱室',
            '100',
            '0',
            nextWeek,
            '',
            'published',
            memberIds[2],
            now
        ],
        [
            uuidv4(),
            '社區關懷活動',
            '走進社區，關懷鄰舍，分享神的愛。我們將進行探訪、物資發放等活動。',
            `${nextMonth} 09:00:00`,
            `${nextMonth} 12:00:00`,
            '社區活動中心',
            '80',
            '0',
            nextMonth,
            '',
            'published',
            memberIds[2],
            now
        ],
    ];

    let eventIds = [];
    for (const event of events) {
        await appendData('Events', event);
        eventIds.push(event[0]); // Store event IDs
    }

    // 3. Insert Offerings (奉獻)
    console.log('\n插入奉獻資料...');
    const offerings = [
        [
            uuidv4(), memberIds[0], '5000', 'tithe', 'cash', '',
            today, 'false', '主日奉獻', now
        ],
        [
            uuidv4(), memberIds[0], '2000', 'offering', 'bank_transfer', 'TXN001',
            today, 'true', '感恩奉獻', now
        ],
        [
            uuidv4(), memberIds[1], '1000', 'tithe', 'cash', '',
            today, 'false', '主日奉獻', now
        ],
        [
            uuidv4(), memberIds[2], '3000', 'building_fund', 'bank_transfer', 'TXN002',
            today, 'true', '建堂奉獻', now
        ],
        [
            uuidv4(), memberIds[3], '500', 'tithe', 'cash', '',
            today, 'false', '主日奉獻', now
        ],
        [
            uuidv4(), memberIds[4], '8000', 'offering', 'bank_transfer', 'TXN003',
            today, 'true', '感恩奉獻', now
        ],
    ];

    for (const offering of offerings) {
        await appendData('Offerings', offering);
    }

    // 4. Insert Settings
    console.log('\n插入系統設定...');
    const defaultSettings = [
        ['church_name', 'Blessing Haven Church', 'system', now],
        ['tagline', '被愛、被建立、被差派', 'system', now],
        ['contact_email', 'info@blessing-haven.club', 'system', now],
        ['address', '台北市信義區仁愛路 100 號', 'system', now],
        ['service_times', '主日 10:00 | 禱告會 週三 19:30', 'system', now],
        ['logo_url', '', 'system', now],
    ];
    for (const setting of defaultSettings) {
        await appendData('Settings', setting);
    }

    // 5. Insert Roles
    console.log('\n插入角色資料...');
    const ROLE_PERMISSIONS = {
        admin: [
            'members:read', 'members:create', 'members:update', 'members:delete', 'members:sensitive',
            'offerings:read', 'offerings:create', 'offerings:update', 'offerings:delete',
            'events:read', 'events:create', 'events:update', 'events:delete', 'events:checkin',
            'courses:read', 'courses:create', 'courses:update', 'courses:delete',
            'cellgroups:read', 'cellgroups:create', 'cellgroups:update', 'cellgroups:delete',
            'volunteers:read', 'volunteers:create', 'volunteers:update', 'volunteers:delete',
            'finance:read', 'finance:create', 'finance:update', 'finance:delete',
            'media:read', 'media:create', 'media:update', 'media:delete',
            'surveys:read', 'surveys:create', 'surveys:update', 'surveys:delete',
            'settings:read', 'settings:update', 'roles:manage', 'users:invite'
        ],
        pastor: [
            'members:read', 'members:create', 'members:update', 'members:sensitive',
            'offerings:read', 'offerings:create',
            'events:read', 'events:create', 'events:update',
            'courses:read', 'courses:create', 'courses:update',
            'cellgroups:read', 'cellgroups:create', 'cellgroups:update',
            'volunteers:read', 'volunteers:create', 'volunteers:update',
            'finance:read', 'finance:create',
            'media:read', 'media:create', 'media:update',
            'surveys:read', 'surveys:create', 'surveys:update',
            'settings:read'
        ],
        leader: [
            'members:read', 'members:update',
            'events:read', 'events:create', 'events:update', 'events:delete',
            'courses:read', 'courses:create', 'courses:update',
            'cellgroups:read', 'cellgroups:create', 'cellgroups:update',
            'volunteers:read', 'volunteers:create', 'volunteers:update',
            'media:read', 'media:create', 'media:update',
            'surveys:read', 'surveys:create', 'surveys:update'
        ],
        staff: [
            'members:read', 'members:create', 'members:update',
            'offerings:read', 'offerings:create',
            'events:read', 'events:create', 'events:update',
            'courses:read', 'courses:create', 'courses:update',
            'volunteers:read', 'volunteers:create', 'volunteers:update',
            'media:read', 'media:create', 'media:update',
            'surveys:read', 'surveys:create', 'surveys:update'
        ],
        volunteer: [
            'members:read',
            'events:read', 'events:checkin',
            'media:read'
        ],
        readonly: [
            'members:read',
            'events:read',
            'media:read'
        ],
    };

    const roleEntries = Object.entries(ROLE_PERMISSIONS).map(([name, permissions]) => ([
        uuidv4(),
        name,
        `${name} role`,
        JSON.stringify(permissions),
        'true',
        now,
        now,
    ]));

    for (const role of roleEntries) {
        await appendData('Roles', role);
    }

    console.log('\n✅ 測試數據插入完成！');
    console.log(`\n插入統計：`);
    console.log(`- 會友：${members.length} 筆`);
    console.log(`- 活動：${events.length} 筆`);
    console.log(`- 奉獻：${offerings.length} 筆`);
}

// Run the script
seedData().catch(console.error);

