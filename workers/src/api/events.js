import { SheetsService } from '../services/sheets.js';
import { EmailService } from '../services/email.js';
import { QRCodeService } from '../services/qrcode.js';
import { Validator } from '../utils/validation.js';
import { v4 as uuidv4 } from 'uuid';

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
        let events = await sheets.read('Events');

        // Auto-update event status based on end_date
        const now = new Date();
        const eventsToUpdate = [];
        
        for (const event of events) {
            if (event.status === 'published' && event.end_date) {
                const endDate = new Date(event.end_date);
                if (endDate < now) {
                    // Event has ended, update status to closed
                    eventsToUpdate.push({ ...event, status: 'closed' });
                }
            }
        }

        // Update events that have ended
        if (eventsToUpdate.length > 0) {
            const allEvents = await sheets.read('Events');
            for (const eventToUpdate of eventsToUpdate) {
                const rowIndex = allEvents.findIndex(e => e.id === eventToUpdate.id);
                if (rowIndex !== -1) {
                    const headers = await sheets.getHeaders('Events');
                    const values = headers.map(header => {
                        const value = eventToUpdate[header] !== undefined ? eventToUpdate[header] : '';
                        return value === null || value === undefined ? '' : String(value);
                    });
                    await sheets.update('Events', rowIndex, values);
                    // Update local events array
                    const eventIndex = events.findIndex(e => e.id === eventToUpdate.id);
                    if (eventIndex !== -1) {
                        events[eventIndex] = eventToUpdate;
                    }
                }
            }
        }

        // Filter by status
        if (status) {
            events = events.filter(e => e.status === status);
        } else {
            // Default: only published events for public
            const user = c.get('user');
            if (!user) {
                // For public: only show published events that haven't ended
                events = events.filter(e => {
                    if (e.status !== 'published') return false;
                    if (e.end_date && new Date(e.end_date) < now) return false;
                    return true;
                });
            }
        }

        // Filter by time
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
 * Get event registrations
 * GET /api/events/:id/registrations
 */
export async function getEventRegistrations(c) {
    try {
        const { id } = c.req.param();

        const sheets = new SheetsService(c.env);
        const event = await sheets.findById('Events', id);

        if (!event) {
            return c.json({ error: '活動不存在' }, 404);
        }

        // Get all registrations for this event
        const registrations = await sheets.find('Event_Registrations', {
            event_id: id,
        });

        // Get member details for each registration
        const members = await sheets.read('Members');
        const memberMap = new Map(members.map(m => [m.id, m]));

        const registrationsWithMembers = registrations.map(reg => {
            const member = memberMap.get(reg.member_id);
            return {
                ...reg,
                member: member ? {
                    id: member.id,
                    name: member.name,
                    phone: member.phone,
                    email: member.email,
                } : null,
            };
        });

        return c.json({
            registrations: registrationsWithMembers,
            total: registrationsWithMembers.length,
        });
    } catch (error) {
        console.error('Get event registrations error:', error);
        return c.json({ error: '獲取報名列表失敗' }, 500);
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
            created_by: user.user_id,
            created_at: new Date().toISOString(),
        };

        await sheets.append('Events', Object.values(event));

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
        await sheets.update('Events', rowIndex, Object.values(updatedEvent));

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
        await sheets.update('Events', rowIndex, Object.values(event));

        return c.json({ message: '活動已刪除' });
    } catch (error) {
        console.error('Delete event error:', error);
        return c.json({ error: '刪除活動失敗' }, 500);
    }
}

/**
 * Register for event (public, no authentication required)
 * POST /api/events/:id/register-public
 */
export async function registerForEventPublic(c) {
    try {
        const { id } = c.req.param();
        const { name, phone, email } = await c.req.json();

        // Validate required fields
        if (!name || !name.trim()) {
            return c.json({ error: '姓名為必填' }, 400);
        }
        if (!phone || !phone.trim()) {
            return c.json({ error: '電話為必填' }, 400);
        }

        const sheets = new SheetsService(c.env);
        const event = await sheets.findById('Events', id);

        if (!event) {
            return c.json({ error: '活動不存在' }, 404);
        }

        if (event.status !== 'published') {
            return c.json({ error: '活動尚未開放報名' }, 400);
        }

        // Check registration deadline
        if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
            return c.json({ error: '報名已截止' }, 400);
        }

        // Find or create member
        let member = null;
        const allMembers = await sheets.read('Members');
        
        // Format phone for comparison: add ' prefix if starts with 0
        const phoneForSearch = phone.trim();
        const phoneWithPrefix = phoneForSearch.startsWith('0') ? "'" + phoneForSearch : phoneForSearch;
        
        // Try to find existing member by name + phone or name + email
        member = allMembers.find(m => {
            const memberPhone = m.phone || '';
            const memberPhoneNormalized = memberPhone.startsWith("'") ? memberPhone.substring(1) : memberPhone;
            return m.name === name.trim() && 
                (memberPhone === phoneWithPrefix || memberPhoneNormalized === phoneForSearch || (email && m.email === email.trim()));
        });

        if (!member) {
            // Format phone number: add ' prefix if starts with 0 (for Google Sheets)
            let formattedPhone = phone.trim();
            if (formattedPhone && formattedPhone.startsWith('0')) {
                formattedPhone = "'" + formattedPhone;
            }

            // Create new member
            const newMember = {
                id: uuidv4(),
                name: name.trim(),
                gender: '',
                birthday: '',
                phone: formattedPhone,
                email: email ? email.trim() : '',
                address: '',
                join_date: new Date().toISOString().split('T')[0],
                baptism_date: '',
                faith_status: 'newcomer',
                family_id: '',
                cell_group_id: '',
                district: '',
                status: 'active',
                tags: '',
                health_notes: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            await sheets.append('Members', Object.values(newMember));
            member = newMember;
        }

        // Check if already registered
        const existingRegistrations = await sheets.find('Event_Registrations', {
            event_id: id,
            member_id: member.id,
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
            member_id: member.id,
            status,
            payment_status: event.fee > 0 ? 'pending' : 'paid',
            checked_in_at: '',
            registered_at: new Date().toISOString(),
        };

        await sheets.append('Event_Registrations', Object.values(registration));

        // Send confirmation email if email is provided
        if (member.email) {
            try {
                const emailService = new EmailService(c.env);
                await emailService.sendEventConfirmation(event, member, registration);
            } catch (emailError) {
                console.error('Failed to send confirmation email:', emailError);
                // Don't fail registration if email fails
            }
        }

        return c.json({
            message: status === 'registered' ? '報名成功' : '已加入候補名單',
            registration,
        }, 201);
    } catch (error) {
        console.error('Register for event (public) error:', error);
        return c.json({ error: '報名失敗' }, 500);
    }
}

/**
 * Register for event (authenticated)
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
