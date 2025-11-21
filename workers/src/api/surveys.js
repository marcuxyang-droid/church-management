import { SheetsService } from '../services/sheets.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Surveys API endpoints
 */

export async function getSurveys(c) {
    try {
        const { status, search } = c.req.query();
        const sheets = new SheetsService(c.env);
        let surveys = await sheets.read('Surveys');

        if (status) {
            surveys = surveys.filter(s => s.status === status);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            surveys = surveys.filter(s =>
                s.title.toLowerCase().includes(searchLower) ||
                (s.description && s.description.toLowerCase().includes(searchLower))
            );
        }

        surveys.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return c.json({
            surveys,
            total: surveys.length,
        });
    } catch (error) {
        console.error('Get surveys error:', error);
        return c.json({ error: '獲取問卷列表失敗' }, 500);
    }
}

export async function getSurvey(c) {
    try {
        const { id } = c.req.param();
        const sheets = new SheetsService(c.env);
        const survey = await sheets.findById('Surveys', id);

        if (!survey) {
            return c.json({ error: '問卷不存在' }, 404);
        }

        return c.json({ survey });
    } catch (error) {
        console.error('Get survey error:', error);
        return c.json({ error: '獲取問卷失敗' }, 500);
    }
}

export async function createSurvey(c) {
    try {
        const data = await c.req.json();
        const sheets = new SheetsService(c.env);

        const survey = {
            id: uuidv4(),
            title: data.title,
            description: data.description || '',
            questions: typeof data.questions === 'string' ? data.questions : JSON.stringify(data.questions || []),
            status: data.status || 'draft',
            created_at: new Date().toISOString(),
        };

        await sheets.append('Surveys', Object.values(survey));

        return c.json({
            message: '問卷建立成功',
            survey,
        });
    } catch (error) {
        console.error('Create survey error:', error);
        return c.json({ error: '建立問卷失敗' }, 500);
    }
}

export async function updateSurvey(c) {
    try {
        const { id } = c.req.param();
        const data = await c.req.json();

        const sheets = new SheetsService(c.env);
        const survey = await sheets.findById('Surveys', id);

        if (!survey) {
            return c.json({ error: '問卷不存在' }, 404);
        }

        const updatedSurvey = {
            ...survey,
            ...data,
            questions: data.questions ? (typeof data.questions === 'string' ? data.questions : JSON.stringify(data.questions)) : survey.questions,
        };

        const surveys = await sheets.read('Surveys');
        const rowIndex = surveys.findIndex(s => s.id === id);
        await sheets.update('Surveys', rowIndex, Object.values(updatedSurvey));

        return c.json({
            message: '問卷更新成功',
            survey: updatedSurvey,
        });
    } catch (error) {
        console.error('Update survey error:', error);
        return c.json({ error: '更新問卷失敗' }, 500);
    }
}

export async function deleteSurvey(c) {
    try {
        const { id } = c.req.param();
        const sheets = new SheetsService(c.env);
        await sheets.delete('Surveys', id);
        return c.json({ message: '問卷刪除成功' });
    } catch (error) {
        console.error('Delete survey error:', error);
        return c.json({ error: '刪除問卷失敗' }, 500);
    }
}

export async function getSurveyResponses(c) {
    try {
        const { id } = c.req.param();
        const { survey_id } = c.req.query();
        const sheets = new SheetsService(c.env);
        let responses = await sheets.read('Survey_Responses');

        const targetSurveyId = id || survey_id;
        if (targetSurveyId) {
            responses = responses.filter(r => r.survey_id === targetSurveyId);
        }

        responses.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

        return c.json({
            responses,
            total: responses.length,
        });
    } catch (error) {
        console.error('Get survey responses error:', error);
        return c.json({ error: '獲取問卷回覆失敗' }, 500);
    }
}

