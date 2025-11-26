import crypto from 'crypto';
import { google } from 'googleapis';
import fs from 'fs';

const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1_zbYJMc_JqyLJ7DqxM6_iKnHVGJz1Q-cPmWQbJK1Af0';

async function createAdmin() {
    try {
        console.log('🔐 Creating admin user...\n');

        // Generate password hash
        const password = 'Admin@2024';
        const hash = crypto.createHash('sha256').update(password).digest('hex');

        console.log('Password:', password);
        console.log('Hash:', hash);
        console.log('');

        // Authenticate
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const authClient = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });

        // Add admin user to Users sheet
        const adminData = [
            'admin-001',
            '',
            'admin@church.com',
            hash,
            'admin',
            '{}',
            '',
            '',
            new Date().toISOString()
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: 'Users!A2',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [adminData],
            },
        });

        console.log('✅ Admin user created successfully!');
        console.log('\nLogin credentials:');
        console.log('Email: admin@church.com');
        console.log('Password: Admin@2024');
        console.log('\n⚠️  Please change the password after first login!');

    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();
