import { SheetsService } from '../services/sheets.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Courses API endpoints
 */

export async function getCourses(c) {
    try {
        const { status, search } = c.req.query();
        const sheets = new SheetsService(c.env);
        let courses = await sheets.read('Courses');

        if (status) {
            courses = courses.filter(c => c.status === status);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            courses = courses.filter(c =>
                c.title.toLowerCase().includes(searchLower) ||
                (c.description && c.description.toLowerCase().includes(searchLower))
            );
        }

        courses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return c.json({
            courses,
            total: courses.length,
        });
    } catch (error) {
        console.error('Get courses error:', error);
        return c.json({ error: '獲取課程列表失敗' }, 500);
    }
}

export async function getCourse(c) {
    try {
        const { id } = c.req.param();
        const sheets = new SheetsService(c.env);
        const course = await sheets.findById('Courses', id);

        if (!course) {
            return c.json({ error: '課程不存在' }, 404);
        }

        return c.json({ course });
    } catch (error) {
        console.error('Get course error:', error);
        return c.json({ error: '獲取課程失敗' }, 500);
    }
}

export async function createCourse(c) {
    try {
        const data = await c.req.json();
        const user = c.get('user');

        const sheets = new SheetsService(c.env);
        const course = {
            id: uuidv4(),
            title: data.title,
            description: data.description || '',
            instructor: data.instructor || '',
            sessions: data.sessions || '',
            start_date: data.start_date || '',
            end_date: data.end_date || '',
            capacity: data.capacity || '',
            status: data.status || 'draft',
            created_at: new Date().toISOString(),
        };

        await sheets.append('Courses', Object.values(course));

        return c.json({
            message: '課程建立成功',
            course,
        });
    } catch (error) {
        console.error('Create course error:', error);
        return c.json({ error: '建立課程失敗' }, 500);
    }
}

export async function updateCourse(c) {
    try {
        const { id } = c.req.param();
        const data = await c.req.json();

        const sheets = new SheetsService(c.env);
        const course = await sheets.findById('Courses', id);

        if (!course) {
            return c.json({ error: '課程不存在' }, 404);
        }

        const updatedCourse = {
            ...course,
            ...data,
        };

        const courses = await sheets.read('Courses');
        const rowIndex = courses.findIndex(c => c.id === id);
        await sheets.update('Courses', rowIndex, Object.values(updatedCourse));

        return c.json({
            message: '課程更新成功',
            course: updatedCourse,
        });
    } catch (error) {
        console.error('Update course error:', error);
        return c.json({ error: '更新課程失敗' }, 500);
    }
}

export async function deleteCourse(c) {
    try {
        const { id } = c.req.param();
        const sheets = new SheetsService(c.env);
        await sheets.delete('Courses', id);
        return c.json({ message: '課程刪除成功' });
    } catch (error) {
        console.error('Delete course error:', error);
        return c.json({ error: '刪除課程失敗' }, 500);
    }
}

