/**
 * Google Sheets Initialization Script
 * Run this script to create all required sheets with proper headers
 * 
 * Usage:
 * 1. Create a new Google Spreadsheet
 * 2. Share it with: blessing-haven@amiable-evening-476910-p6.iam.gserviceaccount.com
 * 3. Copy the Sheet ID from the URL
 * 4. Update GOOGLE_SHEET_ID in workers/.dev.vars
 * 5. Run: node scripts/init-sheets.js
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

// Sheet definitions
const SHEETS = {
    'Members': [
        'id', 'name', 'gender', 'birthday', 'phone', 'email', 'address',
        'join_date', 'baptism_date', 'faith_status', 'family_id', 'cell_group_id',
        'status', 'tags', 'health_notes', 'created_at', 'updated_at'
    ],
    'Offerings': [
        'id', 'member_id', 'amount', 'type', 'method', 'transaction_id',
        'date', 'receipt_sent', 'notes', 'created_at'
    ],
    'Events': [
        'id', 'title', 'description', 'start_date', 'end_date', 'location',
        'capacity', 'fee', 'registration_deadline', 'qr_code', 'status',
        'created_by', 'created_at'
    ],
    'Event_Registrations': [
        'id', 'event_id', 'member_id', 'status', 'payment_status',
        'checked_in_at', 'registered_at'
    ],
    'Courses': [
        'id', 'title', 'description', 'instructor', 'sessions',
        'start_date', 'end_date', 'capacity', 'status', 'created_at'
    ],
    'Course_Enrollments': [
        'id', 'course_id', 'member_id', 'status', 'attendance_rate',
        'completed_at', 'certificate_issued'
    ],
    'Attendance': [
        'id', 'member_id', 'type', 'reference_id', 'date',
        'checked_in_at', 'method'
    ],
    'Cell_Groups': [
        'id', 'name', 'leader_id', 'co_leaders', 'meeting_day',
        'meeting_time', 'location', 'status', 'created_at'
    ],
    'Cell_Group_Meetings': [
        'id', 'group_id', 'date', 'attendance_count', 'notes', 'created_at'
    ],
    'Volunteers': [
        'id', 'member_id', 'team', 'role', 'status', 'joined_at'
    ],
    'Volunteer_Schedules': [
        'id', 'volunteer_id', 'date', 'shift', 'confirmed'
    ],
    'Finance_Transactions': [
        'id', 'type', 'category', 'amount', 'date', 'description',
        'receipt_url', 'approved_by', 'created_by', 'created_at'
    ],
    'Surveys': [
        'id', 'title', 'description', 'questions', 'status', 'created_at'
    ],
    'Survey_Responses': [
        'id', 'survey_id', 'member_id', 'answers', 'submitted_at'
    ],
    'Media_Library': [
        'id', 'title', 'type', 'url', 'thumbnail_url', 'date',
        'speaker', 'tags', 'created_at'
    ],
    'Users': [
        'id', 'member_id', 'email', 'password_hash', 'role', 'permissions',
        'line_user_id', 'last_login', 'created_at',
        'must_change_password', 'email_verified', 'verification_token', 'verification_sent_at', 'status'
    ],
    'Settings': [
        'key', 'value', 'updated_by', 'updated_at'
    ],
    'Roles': [
        'id', 'name', 'description', 'permissions', 'is_system_role', 'created_at', 'updated_at'
    ],
    'Role_Assignments': [
        'id', 'user_id', 'role_id', 'assigned_by', 'assigned_at'
    ],
    'Tags': [
        'id', 'name', 'category', 'color', 'description', 'status', 'created_at'
    ],
    'Tag_Rules': [
        'id', 'name', 'tag_id', 'condition_type', 'condition_field', 'condition_operator',
        'condition_value', 'priority', 'status', 'created_at'
    ]
};

async function initializeSheets() {
    try {
        console.log('🚀 Initializing Google Sheets...\n');

        // Authenticate
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const authClient = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });

        // Get existing sheets
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: SHEET_ID,
        });

        const existingSheets = spreadsheet.data.sheets.map(s => s.properties.title);
        console.log('📋 Existing sheets:', existingSheets.join(', ') || 'None\n');

        // Create sheets
        for (const [sheetName, headers] of Object.entries(SHEETS)) {
            if (existingSheets.includes(sheetName)) {
                console.log(`⏭️  Skipping ${sheetName} (already exists)`);
                continue;
            }

            console.log(`📝 Creating ${sheetName}...`);

            // Create sheet
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: SHEET_ID,
                requestBody: {
                    requests: [{
                        addSheet: {
                            properties: {
                                title: sheetName,
                            },
                        },
                    }],
                },
            });

            // Add headers
            await sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: `${sheetName}!A1`,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [headers],
                },
            });

            // Format header row
            const sheetId = (await sheets.spreadsheets.get({
                spreadsheetId: SHEET_ID,
            })).data.sheets.find(s => s.properties.title === sheetName).properties.sheetId;

            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: SHEET_ID,
                requestBody: {
                    requests: [{
                        repeatCell: {
                            range: {
                                sheetId,
                                startRowIndex: 0,
                                endRowIndex: 1,
                            },
                            cell: {
                                userEnteredFormat: {
                                    backgroundColor: { red: 0.4, green: 0.49, blue: 0.91 },
                                    textFormat: {
                                        foregroundColor: { red: 1, green: 1, blue: 1 },
                                        bold: true,
                                    },
                                },
                            },
                            fields: 'userEnteredFormat(backgroundColor,textFormat)',
                        },
                    }],
                },
            });

            console.log(`✅ Created ${sheetName} with ${headers.length} columns`);
        }

        console.log('\n🎉 All sheets initialized successfully!');
        console.log(`\n📊 Spreadsheet URL: https://docs.google.com/spreadsheets/d/${SHEET_ID}`);
        console.log('\n⚠️  Next steps:');
        console.log('1. Update GOOGLE_SHEET_ID in workers/.dev.vars');
        console.log('2. Create an admin user in the Users sheet');
        console.log('3. Deploy the workers: cd workers && npm run deploy');

    } catch (error) {
        console.error('❌ Error initializing sheets:', error);
        process.exit(1);
    }
}

initializeSheets();
