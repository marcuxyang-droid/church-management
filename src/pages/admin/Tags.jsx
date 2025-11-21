import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import Modal from '../../components/Modal';

export default function Tags() {
    const [tags, setTags] = useState([]);
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('tags'); // 'tags' or 'rules'
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
    const [tagFormData, setTagFormData] = useState({
        name: '',
        category: 'general',
        color: '#3b82f6',
        description: '',
    });
    const [ruleFormData, setRuleFormData] = useState({
        name: '',
        tag_id: '',
        condition_type: 'field',
        condition_field: '',
        condition_operator: 'equals',
        condition_value: '',
        priority: 0,
        status: 'active',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [tagsData, rulesData] = await Promise.all([
                api.getTags(),
                api.getTagRules(),
            ]);
            setTags(tagsData.tags || []);
            setRules(rulesData.rules || []);
        } catch (err) {
            setError(err.message || '無法取得資料');
        } finally {
            setLoading(false);
        }
    };

    const handleTagSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await api.createTag(tagFormData);
            setIsTagModalOpen(false);
            setTagFormData({ name: '', category: 'general', color: '#3b82f6', description: '' });
            fetchData();
        } catch (err) {
            setError(err.message || '建立標籤失敗');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRuleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await api.createTagRule(ruleFormData);
            setIsRuleModalOpen(false);
            setRuleFormData({
                name: '',
                tag_id: '',
                condition_type: 'field',
                condition_field: '',
                condition_operator: 'equals',
                condition_value: '',
                priority: 0,
                status: 'active',
            });
            fetchData();
        } catch (err) {
            setError(err.message || '建立規則失敗');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTag = async (id) => {
        if (!confirm('確定要刪除這個標籤嗎？')) return;
        try {
            await api.deleteTag(id);
            fetchData();
        } catch (err) {
            setError(err.message || '刪除標籤失敗');
        }
    };

    const handleDeleteRule = async (id) => {
        if (!confirm('確定要刪除這個規則嗎？')) return;
        try {
            await api.deleteTagRule(id);
            fetchData();
        } catch (err) {
            setError(err.message || '刪除規則失敗');
        }
    };

    const categories = ['general', 'status', 'ministry', 'skill', 'interest', 'other'];

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">標籤管理</h1>
                    <p className="text-text-secondary mt-2">
                        管理標籤類型和自動貼標規則
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        className={`btn ${activeTab === 'tags' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('tags')}
                    >
                        標籤管理
                    </button>
                    <button
                        className={`btn ${activeTab === 'rules' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('rules')}
                    >
                        自動貼標規則
                    </button>
                </div>
            </div>

            {error && (
                <div className="card bg-red-50 border border-red-200 text-red-700 p-4">
                    {error}
                </div>
            )}

            {activeTab === 'tags' && (
                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">標籤列表</h2>
                        <button className="btn btn-primary" onClick={() => setIsTagModalOpen(true)}>
                            新增標籤
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center gap-3 text-text-secondary">
                            <span className="spinner" />
                            載入中...
                        </div>
                    ) : tags.length === 0 ? (
                        <p className="text-text-secondary">目前沒有標籤</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tags.map((tag) => (
                                <div
                                    key={tag.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-4 h-4 rounded"
                                                style={{ backgroundColor: tag.color }}
                                            />
                                            <span className="font-semibold text-gray-900">{tag.name}</span>
                                        </div>
                                        <button
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => handleDeleteTag(tag.id)}
                                        >
                                            刪除
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">
                                        類別: {tag.category}
                                    </div>
                                    {tag.description && (
                                        <div className="text-sm text-gray-500">{tag.description}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'rules' && (
                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">自動貼標規則</h2>
                        <button className="btn btn-primary" onClick={() => setIsRuleModalOpen(true)}>
                            新增規則
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center gap-3 text-text-secondary">
                            <span className="spinner" />
                            載入中...
                        </div>
                    ) : rules.length === 0 ? (
                        <p className="text-text-secondary">目前沒有規則</p>
                    ) : (
                        <div className="space-y-4">
                            {rules.map((rule) => {
                                const tag = tags.find(t => t.id === rule.tag_id);
                                return (
                                    <div
                                        key={rule.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <div className="font-semibold text-gray-900 mb-1">
                                                    {rule.name}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    標籤: {tag ? tag.name : rule.tag_id}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    條件: {rule.condition_field} {rule.condition_operator} {rule.condition_value}
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    優先級: {rule.priority} | 狀態: {rule.status === 'active' ? '啟用' : '停用'}
                                                </div>
                                            </div>
                                            <button
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => handleDeleteRule(rule.id)}
                                            >
                                                刪除
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Tag Modal */}
            <Modal isOpen={isTagModalOpen} onClose={() => setIsTagModalOpen(false)} title="新增標籤">
                <form onSubmit={handleTagSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">標籤名稱 *</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={tagFormData.name}
                            onChange={(e) => setTagFormData({ ...tagFormData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">類別</label>
                            <select
                                className="input w-full"
                                value={tagFormData.category}
                                onChange={(e) => setTagFormData({ ...tagFormData, category: e.target.value })}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">顏色</label>
                            <input
                                type="color"
                                className="input w-full h-10"
                                value={tagFormData.color}
                                onChange={(e) => setTagFormData({ ...tagFormData, color: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                        <textarea
                            className="input w-full"
                            rows="3"
                            value={tagFormData.description}
                            onChange={(e) => setTagFormData({ ...tagFormData, description: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setIsTagModalOpen(false)}
                            disabled={submitting}
                        >
                            取消
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? '建立中...' : '建立標籤'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Rule Modal */}
            <Modal isOpen={isRuleModalOpen} onClose={() => setIsRuleModalOpen(false)} title="新增自動貼標規則">
                <form onSubmit={handleRuleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">規則名稱 *</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={ruleFormData.name}
                            onChange={(e) => setRuleFormData({ ...ruleFormData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">標籤 *</label>
                        <select
                            className="input w-full"
                            value={ruleFormData.tag_id}
                            onChange={(e) => setRuleFormData({ ...ruleFormData, tag_id: e.target.value })}
                            required
                        >
                            <option value="">請選擇標籤</option>
                            {tags.map(tag => (
                                <option key={tag.id} value={tag.id}>{tag.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">條件類型 *</label>
                        <select
                            className="input w-full"
                            value={ruleFormData.condition_type}
                            onChange={(e) => setRuleFormData({ ...ruleFormData, condition_type: e.target.value })}
                            required
                        >
                            <option value="field">欄位條件</option>
                            <option value="date">日期條件</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">條件欄位 *</label>
                        <select
                            className="input w-full"
                            value={ruleFormData.condition_field}
                            onChange={(e) => setRuleFormData({ ...ruleFormData, condition_field: e.target.value })}
                            required
                        >
                            <option value="">請選擇欄位</option>
                            <option value="faith_status">信仰狀態</option>
                            <option value="join_date">加入日期</option>
                            <option value="baptism_date">受洗日期</option>
                            <option value="cell_group_id">小組</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">運算符 *</label>
                            <select
                                className="input w-full"
                                value={ruleFormData.condition_operator}
                                onChange={(e) => setRuleFormData({ ...ruleFormData, condition_operator: e.target.value })}
                                required
                            >
                                <option value="equals">等於</option>
                                <option value="contains">包含</option>
                                <option value="greater_than">大於</option>
                                <option value="less_than">小於</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">條件值 *</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={ruleFormData.condition_value}
                                onChange={(e) => setRuleFormData({ ...ruleFormData, condition_value: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">優先級</label>
                        <input
                            type="number"
                            className="input w-full"
                            value={ruleFormData.priority}
                            onChange={(e) => setRuleFormData({ ...ruleFormData, priority: parseInt(e.target.value) || 0 })}
                        />
                        <p className="text-xs text-gray-500 mt-1">數字越小優先級越高</p>
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setIsRuleModalOpen(false)}
                            disabled={submitting}
                        >
                            取消
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? '建立中...' : '建立規則'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

