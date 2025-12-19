import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Paperclip, FileText, Image as ImageIcon, GitBranch, MessageSquare, ArrowRight, LayoutList } from 'lucide-react';
import { Question, NewQuestionState } from './types';

interface QuestionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (question: NewQuestionState) => void;
    initialData?: Question | null;
    title: string;
    existingQuestions: Question[];
}

const QuestionFormModal = ({ isOpen, onClose, onSave, initialData, title, existingQuestions }: QuestionFormModalProps) => {
    const [formData, setFormData] = useState<NewQuestionState>({ text: '', buttons: [], defaultNextId: null });
    const [activeTab, setActiveTab] = useState<'content' | 'logic'>('content');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    text: initialData.text,
                    buttons: initialData.buttons ? [...initialData.buttons] : [],
                    attachment: initialData.attachment,
                    externalLink: initialData.externalLink || '',
                    defaultNextId: initialData.defaultNextId || null
                });
            } else {
                setFormData({ text: '', buttons: [], defaultNextId: null, externalLink: '' });
            }
        }
    }, [isOpen, initialData]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Optimistic UI update or Loading state could be added here

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            const type = file.type.startsWith('image/') ? 'image' : 'file';

            setFormData(prev => ({
                ...prev,
                attachment: { type, url: data.url, name: file.name }
            }));
        } catch (error) {
            console.error('Upload Error:', error);
            alert('Fayl yüklənə bilmədi!');
        }
    };

    const removeAttachment = () => {
        setFormData({ ...formData, attachment: undefined });
    };

    const addButton = () => {
        const newButtonId = Math.max(...formData.buttons.map(b => b.id), 0) + 1;
        setFormData({
            ...formData,
            buttons: [...formData.buttons, { id: newButtonId, text: '' }]
        });
    };

    const updateButtonText = (id: number, text: string) => {
        setFormData({
            ...formData,
            buttons: formData.buttons.map(b => b.id === id ? { ...b, text } : b)
        });
    };

    const updateButtonNextId = (id: number, nextQuestionId: string) => {
        setFormData({
            ...formData,
            buttons: formData.buttons.map(b => b.id === id ? { ...b, nextQuestionId: nextQuestionId ? Number(nextQuestionId) : null } : b)
        });
    };

    const removeButton = (id: number) => {
        setFormData({
            ...formData,
            buttons: formData.buttons.filter(b => b.id !== id)
        });
    };

    const handleSave = () => {
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex border-b border-gray-100 px-6 mt-2">
                    <button
                        onClick={() => setActiveTab('content')}
                        className={`pb-3 px-4 text-sm font-medium transition-all relative ${activeTab === 'content' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <div className="flex items-center gap-2">
                            <LayoutList className="w-4 h-4" />
                            Məzmun
                        </div>
                        {activeTab === 'content' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('logic')}
                        className={`pb-3 px-4 text-sm font-medium transition-all relative ${activeTab === 'logic' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <div className="flex items-center gap-2">
                            <GitBranch className="w-4 h-4" />
                            Məntiq (Flow)
                        </div>
                        {activeTab === 'logic' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto min-h-[400px]">
                    {activeTab === 'content' ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Sual Mətni</label>
                                <textarea
                                    value={formData.text}
                                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                    placeholder="Sualınızı bura yazın..."
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-sm"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Link URL ("burada" sözü üçün)</label>
                                <input
                                    type="text"
                                    value={formData.externalLink || ''}
                                    onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
                                    placeholder="https://example.com"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                                <p className="text-xs text-gray-500">
                                    Əgər mətndə <b>"burada"</b> sözü varsa, bu linkə yönləndirəcək.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-semibold text-gray-700">Buttonlar</label>
                                    <button
                                        onClick={addButton}
                                        className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Button Əlavə Et
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {formData.buttons.map((btn) => (
                                        <div key={btn.id} className="flex gap-2 items-center">
                                            <input
                                                type="text"
                                                value={btn.text}
                                                onChange={(e) => updateButtonText(btn.id, e.target.value)}
                                                placeholder="Button mətni"
                                                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            />
                                            <button
                                                onClick={() => removeButton(btn.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.buttons.length === 0 && (
                                        <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-400 text-sm">
                                            Hələ ki button yoxdur
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Media fayl</label>
                                {!formData.attachment ? (
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Paperclip className="w-8 h-8 mb-3 text-gray-400" />
                                            <p className="text-sm text-gray-500"><span className="font-semibold">Fayl yükləmək üçün klikləyin</span></p>
                                            <p className="text-xs text-gray-500">PNG, JPG or PDF</p>
                                        </div>
                                        <input type="file" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                ) : (
                                    <div className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                        {formData.attachment.type === 'image' ? (
                                            <div className="relative h-40 w-full">
                                                <img src={formData.attachment.url} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 flex items-center gap-2">
                                                    <ImageIcon className="w-4 h-4 text-white/80" />
                                                    <p className="text-white text-xs font-medium truncate">{formData.attachment.name}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 p-4">
                                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{formData.attachment.name}</p>
                                                    <p className="text-xs text-gray-500">Fayl əlavə olundu</p>
                                                </div>
                                            </div>
                                        )}
                                        <button
                                            onClick={removeAttachment}
                                            className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                                            title="Faylı sil"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-blue-500" />
                                    Button Keçidləri
                                </label>
                                {formData.buttons.length > 0 ? (
                                    <div className="space-y-3">
                                        {formData.buttons.map(btn => (
                                            <div key={btn.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-200">
                                                        {btn.text || '(Adsız Button)'}
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                                    <span className="text-xs font-medium text-gray-500">Növbəti Sual:</span>
                                                </div>
                                                <select
                                                    value={btn.nextQuestionId || ''}
                                                    onChange={(e) => updateButtonNextId(btn.id, e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                >
                                                    <option value="">Seçilməyib (Listdən növbəti)</option>
                                                    {existingQuestions
                                                        .filter(q => q.id !== initialData?.id)
                                                        .map(q => (
                                                            <option key={q.id} value={q.id}>
                                                                {q.id}. {q.text.substring(0, 40)}{q.text.length > 40 ? '...' : ''}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        Heç bir button əlavə edilməyib.
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    Default Keçid (Mətn Cavabı)
                                </label>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-2 leading-relaxed">
                                        İstifadəçi button seçmək əvəzinə birbaşa mətn yazarsa, bot bu suala keçəcək:
                                    </p>
                                    <select
                                        value={formData.defaultNextId || ''}
                                        onChange={(e) => setFormData({ ...formData, defaultNextId: e.target.value ? Number(e.target.value) : null })}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="">Siyahıda növbəti sual (Default)</option>
                                        <option value="-1">Dialogu Bitir</option>
                                        {existingQuestions
                                            .filter(q => q.id !== initialData?.id)
                                            .map(q => (
                                                <option key={q.id} value={q.id}>
                                                    {q.id}. {q.text.substring(0, 40)}{q.text.length > 40 ? '...' : ''}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 font-medium text-sm hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Ləğv et
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!formData.text.trim() && !formData.attachment}
                        className="px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Yadda Saxla
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuestionFormModal;
