/**
 * Read Settings Sheet Structure
 * 讀取 Settings Sheet 的實際結構
 * 
 * Usage: 
 *   $env:GOOGLE_SHEETS_CREDENTIALS='...'; $env:GOOGLE_SHEET_ID='...'; node scripts/read-settings-sheet.js
 */

import { google } from 'googleapis';

// Load credentials from environment variable
if (!process.env.GOOGLE_SHEETS_CREDENTIALS) {
    console.error('❌ 錯誤: 請設定 GOOGLE_SHEETS_CREDENTIALS 環境變數');
    console.error('例如: $env:GOOGLE_SHEETS_CREDENTIALS=\'{"type":"service_account",...}\'');
    process.exit(1);
}

const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1_zbYJMc_JqyLJ7DqxM6_iKnHVGJz1Q-cPmWQbJK1Af0';

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function readSettingsSheet() {
    try {
        console.log('📖 讀取 Settings Sheet...\n');
        console.log(`Sheet ID: ${SHEET_ID}\n`);

        // Read Settings sheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: 'Settings!A:Z',
        });

        const rows = response.data.values || [];
        
        if (rows.length === 0) {
            console.log('⚠️  Settings sheet 是空的');
            return;
        }

        // First row is headers
        const headers = rows[0];
        console.log('📋 欄位標題 (Headers):');
        headers.forEach((header, index) => {
            console.log(`  ${index + 1}. ${header}`);
        });

        console.log('\n📊 資料行數:', rows.length - 1);
        console.log('\n📝 所有資料:');
        console.log('─'.repeat(80));
        
        // Display all rows
        rows.slice(1).forEach((row, index) => {
            const obj = {};
            headers.forEach((header, colIndex) => {
                obj[header] = row[colIndex] || '';
            });
            console.log(`\n第 ${index + 1} 行:`);
            console.log(JSON.stringify(obj, null, 2));
        });

        console.log('\n✅ 讀取完成！');

    } catch (error) {
        console.error('❌ 錯誤:', error.message);
        if (error.message.includes('Unable to parse range')) {
            console.error('  → Settings sheet 可能不存在，請確認 sheet 名稱是否正確');
        } else if (error.message.includes('permission')) {
            console.error('  → 請確認 service account 有讀取權限');
        }
        process.exit(1);
    }
}

readSettingsSheet();

