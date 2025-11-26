/**
 * Check Google Sheets Structure
 * 檢查 Google Sheets 結構
 */

import { google } from 'googleapis';
import fs from 'fs';

// Load credentials from environment variable or file
if (!process.env.GOOGLE_SHEETS_CREDENTIALS) {
    console.error('錯誤: 請設定 GOOGLE_SHEETS_CREDENTIALS 環境變數');
    console.error('或建立 credentials.json 檔案');
    process.exit(1);
}
const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1_zbYJMc_JqyLJ7DqxM6_iKnHVGJz1Q-cPmWQbJK1Af0';

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function checkSheets() {
    try {
        console.log('檢查 Google Sheets 結構...\n');
        console.log(`Sheet ID: ${SHEET_ID}\n`);

        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: SHEET_ID,
        });

        console.log(`📊 Spreadsheet 標題: ${spreadsheet.data.properties.title}\n`);
        console.log('現有的工作表 (Sheets):');
        
        const existingSheets = spreadsheet.data.sheets.map(s => s.properties.title);
        existingSheets.forEach((name, index) => {
            console.log(`  ${index + 1}. ${name}`);
        });

        console.log('\n需要的工作表:');
        const requiredSheets = ['Members', 'Events', 'Offerings'];
        requiredSheets.forEach(name => {
            const exists = existingSheets.includes(name);
            console.log(`  ${exists ? '✓' : '✗'} ${name}`);
        });

    } catch (error) {
        console.error('❌ 錯誤:', error.message);
        if (error.message.includes('permission')) {
            console.error('\n權限問題：');
            console.error('請確認 service account 有編輯權限：');
            console.error('  blessing-haven@amiable-evening-476910-p6.iam.gserviceaccount.com');
        }
    }
}

checkSheets();

