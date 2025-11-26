import { SheetsService } from '../services/sheets.js';
import { EmailService } from '../services/email.js';
import { QRCodeService } from '../services/qrcode.js';
import { Validator } from '../utils/validation.js';
import { v4 as uuidv4 } from 'uuid';

const EVENT_HEADERS = [
    'id',
    'title',
    'description',
    'start_date',
    'end_date',
    'location',
    'capacity',
    'fee',
    'registration_deadline',
    'qr_code',
    'status',
    'created_by',
    'created_at',
];

function mapEventToRow(event) {
    return EVENT_HEADERS.map((key) => event[key] ?? '');
}

/**
 * Events API endpoints
 */

/**
 * Get all events
 * GET /api/events
 */
export async function getEvents(c) {
    try {
        const { status, upcoming, past } = c.req.query();

        const sheets = new SheetsService(c.env);
        let events = [];

        try {
            events = await sheets.read('Events');
        } catch (error) {
            console.warn('Events sheet not found or unreadable, returning empty array');
            events = [];
        }

        // Filter by status
        if (status) {
            events = events.filter(e => e.status === status);
        } else {
            // Default: only published events for public
            const user = c.get('user');
            if (!user) {
                events = events.filter(e => e.status === 'published');
            }
        }

        // Filter by time
        const now = new Date();
        if (upcoming) {
            events = events.filter(e => new Date(e.start_date) >= now);
        }
        if (past) {
            events = events.filter(e => new Date(e.end_date) < now);
        }

        // Sort by start date
        events.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

        return c.json({
            events,
            total: events.length,
        });
    } catch (error) {
        console.error('Get events error:', error);
        return c.json({ error: '獲取活動列表失敗' }, 500);
    }
}

/**
 * Get single event
 * GET /api/events/:id
 */
export async function getEvent(c) {
    try {
        const { id } = c.req.param();

        const sheets = new SheetsService(c.env);
        const event = await sheets.findById('Events', id);

        if (!event) {
            return c.json({ error: '活動不存在' }, 404);
        }

        // Get registration count
        const registrations = await sheets.find('Event_Registrations', {
            event_id: id,
            status: 'registered'
        });

        return c.json({
            event,
            registrations: registrations.length,
            available: event.capacity ? event.capacity - registrations.length : null,
        });
    } catch (error) {
        console.error('Get event error:', error);
        return c.json({ error: '獲取活動資訊失敗' }, 500);
    }
}

/**
 * Create new event
 * POST /api/events
 */
export async function createEvent(c) {
    try {
        const user = c.get('user');
        const data = await c.req.json();

        // Validate input
        const validation = Validator.validateEvent(data);
        if (!validation.isValid) {
            return c.json({ error: '資料驗證失敗', errors: validation.errors }, 400);
        }

        const sheets = new SheetsService(c.env);

        try {
            const headers = await sheets.getHeaders('Events');
            if (!headers || headers.length === 0) {
                await sheets.createSheet('Events', EVENT_HEADERS);
            }
        } catch (error) {
            console.warn('Events sheet missing, creating a new one');
            await sheets.createSheet('Events', EVENT_HEADERS);
        }

        // Create event object
        const event = {
            id: uuidv4(),
            title: data.title,
            description: data.description || '',
            start_date: data.start_date,
            end_date: data.end_date || data.start_date,
            location: data.location,
            capacity: data.capacity || 0,
            fee: data.fee || 0,
            registration_deadline: data.registration_deadline || data.start_date,
            qr_code: uuidv4(), // Unique QR code for this event
            status: data.status || 'draft',
            created_by: user?.user_id || user?.email || 'system',
            created_at: new Date().toISOString(),
        };

        await sheets.append('Events', mapEventToRow(event));

        return c.json({
            message: '活動建立成功',
            event,
        }, 201);
    } catch (error) {
        console.error('Create event error:', error);
        return c.json({ error: '建立活動失敗' }, 500);
    }
}

/**
 * Update event
 * PUT /api/events/:id
 */
export async function updateEvent(c) {
    try {
        const { id } = c.req.param();
        const data = await c.req.json();

        const sheets = new SheetsService(c.env);
        const event = await sheets.findById('Events', id);

        if (!event) {
            return c.json({ error: '活動不存在' }, 404);
        }

        // Validate input
        const validation = Validator.validateEvent({ ...event, ...data });
        if (!validation.isValid) {
            return c.json({ error: '資料驗證失敗', errors: validation.errors }, 400);
        }

        // Update event object
        const updatedEvent = {
            ...event,
            ...data,
            id: event.id, // Preserve ID
            qr_code: event.qr_code, // Preserve QR code
            created_by: event.created_by, // Preserve creator
            created_at: event.created_at, // Preserve creation date
        };

        // Find row index and update
        const events = await sheets.read('Events');
        const rowIndex = events.findIndex(e => e.id === id);
        const rowValues = mapEventToRow(updatedEvent);
        await sheets.update('Events', rowIndex, rowValues);

        return c.json({
            message: '活動更新成功',
            event: updatedEvent,
        });
    } catch (error) {
        console.error('Update event error:', error);
        return c.json({ error: '更新活動失敗' }, 500);
    }
}

/**
 * Delete event
 * DELETE /api/events/:id
 */
export async function deleteEvent(c) {
    try {
        const { id } = c.req.param();

        const sheets = new SheetsService(c.env);
        const event = await sheets.findById('Events', id);

        if (!event) {
            return c.json({ error: '活動不存在' }, 404);
        }

        // Update status to closed
        const events = await sheets.read('Events');
        const rowIndex = events.findIndex(e => e.id === id);
        event.status = 'closed';
        const rowValues = mapEventToRow(event);
        await sheets.update('Events', rowIndex, rowValues);

        return c.json({ message: '活動已刪除' });
    } catch (error) {
        console.error('Delete event error:', error);
        return c.json({ error: '刪除活動失敗' }, 500);
    }
}

/**
 * Register for event
 * POST /api/events/:id/register
 */
export async function registerForEvent(c) {
    try {
        const user = c.get('user');
        const { id } = c.req.param();

        const sheets = new SheetsService(c.env);
        const event = await sheets.findById('Events', id);

        if (!event) {
            return c.json({ error: '活動不存在' }, 404);
        }

        if (event.status !== 'published') {
            return c.json({ error: '活動尚未開放報名' }, 400);
        }

        // Check registration deadline
        if (new Date(event.registration_deadline) < new Date()) {
            return c.json({ error: '報名已截止' }, 400);
        }

        // Check if already registered
        const existingRegistrations = await sheets.find('Event_Registrations', {
            event_id: id,
            member_id: user.member_id,
        });

        if (existingRegistrations.some(r => r.status !== 'cancelled')) {
            return c.json({ error: '您已報名此活動' }, 400);
        }

        // Check capacity
        const registrations = await sheets.find('Event_Registrations', {
            event_id: id,
            status: 'registered',
        });

        let status = 'registered';
        if (event.capacity && registrations.length >= event.capacity) {
            status = 'waitlist';
        }

        // Create registration
        const registration = {
            id: uuidv4(),
            event_id: id,
            member_id: user.member_id,
            status,
            payment_status: event.fee > 0 ? 'pending' : 'paid',
            checked_in_at: '',
            registered_at: new Date().toISOString(),
        };

        await sheets.append('Event_Registrations', Object.values(registration));

        // Get member data for email
        const member = await sheets.findById('Members', user.member_id);

        // Send confirmation email
        if (member && member.email) {
            try {
                const emailService = new EmailService(c.env);
                await emailService.sendEventConfirmation(event, member, registration);
            } catch (emailError) {
                console.error('Failed to send confirmation email:', emailError);
            }
        }

        return c.json({
            message: status === 'registered' ? '報名成功' : '已加入候補名單',
            registration,
        }, 201);
    } catch (error) {
        console.error('Register for event error:', error);
        return c.json({ error: '報名失敗' }, 500);
    }
}

/**
 * Check in to event
 * POST /api/events/:id/checkin
 */
export async function checkInEvent(c) {
    try {
        const { id } = c.req.param();
        const { registration_id, qr_data } = await c.req.json();

        const sheets = new SheetsService(c.env);

        // Find registration
        let registration;
        if (registration_id) {
            registration = await sheets.findById('Event_Registrations', registration_id);
        } else if (qr_data) {
            // Parse QR code data
            const data = JSON.parse(qr_data);
            registration = await sheets.findById('Event_Registrations', data.registration_id);
        }

        if (!registration) {
            return c.json({ error: '報名記錄不存在' }, 404);
        }

        if (registration.event_id !== id) {
            return c.json({ error: '報名記錄與活動不符' }, 400);
        }

        if (registration.checked_in_at) {
            return c.json({ error: '已經報到過了' }, 400);
        }

        // Update check-in time
        const registrations = await sheets.read('Event_Registrations');
        const rowIndex = registrations.findIndex(r => r.id === registration.id);
        registration.checked_in_at = new Date().toISOString();
        await sheets.update('Event_Registrations', rowIndex, Object.values(registration));

        // Get member info
        const member = await sheets.findById('Members', registration.member_id);

        return c.json({
            message: '報到成功',
            registration,
            member: member ? {
                name: member.name,
                phone: member.phone,
            } : null,
        });
    } catch (error) {
        console.error('Check in event error:', error);
        return c.json({ error: '報到失敗' }, 500);
    }
}
