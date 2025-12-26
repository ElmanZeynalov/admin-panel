'use client';

import { useState, useEffect, useMemo } from 'react';
import { Question } from './bot-dialog/types';
import CategorySidebar from './bot-dialog/CategorySidebar';
import QuestionList from './bot-dialog/QuestionList';
import AnswerEditor from './bot-dialog/AnswerEditor';
import { Save, Loader2 } from 'lucide-react';

const BotDialogEditor = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Selection State
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

    // Initial Load
    useEffect(() => {
        fetch('/api/questions')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setQuestions(data);
                }
            })
            .catch(err => console.error('Failed to load questions:', err))
            .finally(() => setIsLoading(false));
    }, []);

    // Derived State
    const categories = useMemo(() => questions.filter(q => q.parentId === null), [questions]);
    const activeQuestions = useMemo(() =>
        selectedCategoryId
            ? questions.filter(q => q.parentId === selectedCategoryId)
            : []
        , [questions, selectedCategoryId]);

    const selectedCategory = questions.find(q => q.id === selectedCategoryId);
    const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

    // --- Helpers ---
    const markChanged = () => setHasUnsavedChanges(true);
    // Use negative random IDs to avoid collision with DB auto-increment (and fit in Int4)
    const generateTempId = () => -Math.floor(Math.random() * 1000000000);

    // --- Local Handlers (NO API CALLS) ---

    // 1. Create Category
    const handleAddCategory = () => {
        const tempId = generateTempId(); // Safe negative ID
        const newCat: Question = { id: tempId, text: 'New Category', isActive: true, parentId: null };
        setQuestions(prev => [...prev, newCat]);
        setSelectedCategoryId(tempId);
        markChanged();
    };

    // 2. Update Category/Question (Generic)
    const handleUpdateGeneric = (id: number, updates: Partial<Question>) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
        markChanged();
    };

    // 3. Delete Category
    const handleDeleteCategory = (id: number) => {
        setQuestions(prev => prev.filter(q => q.id !== id && q.parentId !== id));
        if (selectedCategoryId === id) {
            setSelectedCategoryId(null);
            setSelectedQuestionId(null);
        }
        markChanged();
    };

    // 4. Create Question
    const handleAddQuestion = () => {
        if (!selectedCategoryId) return;
        const tempId = generateTempId();
        const newQ: Question = { id: tempId, text: 'New Question', isActive: true, parentId: selectedCategoryId, answer: '' };
        setQuestions(prev => [...prev, newQ]);
        setSelectedQuestionId(tempId);
        markChanged();
    };

    // 5. Delete Question
    const handleDeleteQuestion = (id: number) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
        if (selectedQuestionId === id) setSelectedQuestionId(null);
        markChanged();
    };

    // --- GLOBAL SAVE ---
    const handleSaveAll = async () => {
        if (!hasUnsavedChanges) return;

        setIsSaving(true);
        try {
            const res = await fetch('/api/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(questions) // Send EVERYTHING
            });

            if (!res.ok) throw new Error('Save failed');

            const savedData: Question[] = await res.json();

            // Sync local state with server state (gets real IDs back)
            setQuestions(savedData);

            // We need to try and preserve selection if possible.
            // But IDs might have changed from Negative -> Positive.
            // A simple strategy is to deselect or just leave as is if ID matched.
            // If the user was editing a new item (ID -1), and it became ID 50, selection breaks.
            // For now, let's just clear selection to avoid confusion, or keep it if ID exists.

            // Advanced: Map old temp IDs to new IDs using text/parentId matching?
            // Since we replaced the whole state, 'selectedCategoryId' might point to a stale ID.
            // Let's reset selection to be safe for this iteration.
            setSelectedCategoryId(null);
            setSelectedQuestionId(null);

            setHasUnsavedChanges(false);
            alert('Saved successfully!');
        } catch (e: any) {
            console.error(e);
            alert(`Error saving data: ${e.message || 'Unknown error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="h-[calc(100vh-100px)] flex items-center justify-center">Loading Data...</div>;

    return (
        <div className="relative h-[calc(100vh-100px)] bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden flex">

            {/* FLOATING SAVE BUTTON */}
            <div className="absolute top-4 right-6 z-50">
                <button
                    onClick={handleSaveAll}
                    disabled={isSaving || !hasUnsavedChanges}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all 
                        ${hasUnsavedChanges
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30 hover:scale-105 active:scale-95'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                        }`}
                >
                    {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
            </div>

            {/* 1. Sidebar: Categories */}
            <CategorySidebar
                categories={categories}
                selectedId={selectedCategoryId}
                onSelect={(id) => {
                    setSelectedCategoryId(id);
                    setSelectedQuestionId(null);
                }}
                onAdd={handleAddCategory}
                onUpdate={(id, text, textRu) => handleUpdateGeneric(id, { text, textRu })}
                onDelete={handleDeleteCategory}
            />

            {/* 2. Middle: Question List */}
            <QuestionList
                category={selectedCategory}
                questions={activeQuestions}
                selectedId={selectedQuestionId}
                onSelect={setSelectedQuestionId}
                onAdd={handleAddQuestion}
                onUpdate={(id, text, textRu) => handleUpdateGeneric(id, { text, textRu })}
                onDelete={handleDeleteQuestion}
            />

            {/* 3. Right: Answer Editor */}
            <AnswerEditor
                question={selectedQuestion}
                onUpdate={(id, updates) => handleUpdateGeneric(id, updates)}
            />
        </div>
    );
};

export default BotDialogEditor;
