'use client';

import { useState, useEffect } from 'react';
import { Plus, Save, Loader2 } from 'lucide-react';
import { Question, NewQuestionState } from './bot-dialog/types';
import QuestionList from './bot-dialog/QuestionList';
import BotPreview from './bot-dialog/BotPreview';
import QuestionFormModal from './bot-dialog/QuestionFormModal';

const BotDialogEditor = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Load initial data
    useEffect(() => {
        fetch('/api/questions')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setQuestions(data);
                } else {
                    // Fallback default if DB is empty
                    setQuestions([
                        {
                            id: 1,
                            text: 'Salam! Ad və Soyad',
                            isActive: true,
                            buttons: [{ id: 1, text: 'ANONİM' }]
                        },
                    ]);
                }
            })
            .catch(err => console.error('Failed to load questions:', err))
            .finally(() => setIsLoading(false));
    }, []);

    const saveToDatabase = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(questions)
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to save');
            }
            alert('Məlumatlar yadda saxlanıldı!');
        } catch (err: any) {
            console.error(err);
            alert(`Xəta baş verdi: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (question: Question) => {
        setEditingId(question.id);
        setIsModalOpen(true);
    };

    const handleSaveQuestion = (data: NewQuestionState) => {
        if (!data.text.trim() && !data.attachment) return;

        if (editingId !== null) {
            // Update existing question
            setQuestions(questions.map((q) =>
                q.id === editingId
                    ? {
                        ...q,
                        text: data.text,
                        buttons: data.buttons.filter(b => b.text.trim()),
                        attachment: data.attachment,
                        externalLink: data.externalLink,
                        defaultNextId: data.defaultNextId
                    }
                    : q
            ));
        } else {
            // Create new question
            const newId = Math.max(...questions.map((q) => q.id), 0) + 1;
            setQuestions([...questions, {
                id: newId,
                text: data.text,
                isActive: true,
                buttons: data.buttons.filter(b => b.text.trim()),
                attachment: data.attachment,
                externalLink: data.externalLink,
                defaultNextId: data.defaultNextId
            }]);
        }
        setIsModalOpen(false);
        setEditingId(null);
    };

    const toggleActive = (id: number) => {
        setQuestions(questions.map((q) => (q.id === id ? { ...q, isActive: !q.isActive } : q)));
    };

    const deleteQuestion = (id: number) => {
        setQuestions(questions.filter((q) => q.id !== id));
    };

    const getEditingQuestion = () => {
        return editingId ? questions.find(q => q.id === editingId) : null;
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-8">
            {/* Left Side: Question Editor */}
            <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Sual Redaktoru</h2>
                        <p className="text-sm text-gray-500 mt-1">Botun istifadəçiyə verəcəyi sualları idarə edin</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={saveToDatabase}
                            disabled={isSaving}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow-md active:scale-95 text-sm font-medium disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Yadda Saxla
                        </button>
                        <button
                            onClick={openAddModal}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-95 text-sm font-medium"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Sual Əlavə Et
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : (
                    <QuestionList
                        questions={questions}
                        onUpdateQuestions={setQuestions}
                        onEdit={openEditModal}
                        onDelete={deleteQuestion}
                        onToggleActive={toggleActive}
                    />
                )}
            </div>

            {/* Right Side: iPhone Preview */}
            <BotPreview questions={questions} />

            {/* Modal */}
            <QuestionFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveQuestion}
                initialData={getEditingQuestion()}
                title={editingId !== null ? 'Sualı Redaktə Et' : 'Yeni Sual Əlavə Et'}
                existingQuestions={questions}
            />
        </div>
    );
};

export default BotDialogEditor;
