'use client';

import { Question } from './types';
import { Plus, MessageSquare, Pencil, Trash2, Check, X, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface QuestionListProps {
    category: Question | undefined;
    questions: Question[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    onAdd: () => void;
    onUpdate: (id: number, text: string, textRu?: string) => void;
    onDelete: (id: number) => void;
}

const QuestionList = ({ category, questions, selectedId, onSelect, onAdd, onUpdate, onDelete }: QuestionListProps) => {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');
    const [editValueRu, setEditValueRu] = useState('');

    const startEditing = (e: React.MouseEvent, q: Question) => {
        e.stopPropagation();
        setEditingId(q.id);
        setEditValue(q.text);
        setEditValueRu(q.textRu || '');
    };

    const saveEditing = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (editValue.trim()) {
            onUpdate(id, editValue, editValueRu);
        }
        setEditingId(null);
    };

    const cancelEditing = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(null);
    };

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this key?')) {
            onDelete(id);
        }
    };

    if (!category) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 p-8 text-center border-r border-gray-200">
                <p className="text-gray-400 text-sm">Select a Category</p>
            </div>
        );
    }

    return (
        <div className="flex-1 max-w-sm flex flex-col h-full bg-white border-r border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="min-w-0">
                    <h2 className="font-semibold text-gray-800 truncate">{category.text}</h2>
                    {category.textRu && <p className="text-xs text-gray-400 truncate">{category.textRu}</p>}
                    <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">keys / questions</p>
                </div>
                <button
                    onClick={onAdd}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Add Question"
                >
                    <Plus size={18} />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {questions.map((q) => {
                    const isSelected = selectedId === q.id;
                    const isEditing = editingId === q.id;

                    return (
                        <div
                            key={q.id}
                            onClick={() => !isEditing && onSelect(q.id)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 group relative cursor-pointer border
                                ${isSelected
                                    ? 'bg-white border-indigo-500 shadow-md z-10'
                                    : 'bg-white border-gray-200 hover:border-indigo-300'
                                }
                            `}
                        >
                            <span className={isSelected ? 'text-indigo-600' : 'text-gray-400'}>
                                <MessageSquare size={18} />
                            </span>

                            {isEditing ? (
                                <div className="flex-1 flex flex-col gap-1">
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-indigo-300 rounded px-1.5 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        placeholder="Question (AZ)"
                                        autoFocus
                                    />
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-indigo-300 rounded px-1.5 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                                        value={editValueRu}
                                        onChange={(e) => setEditValueRu(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        placeholder="Question (RU)"
                                    />
                                    <div className="flex justify-end gap-1 mt-1">
                                        <button onClick={(e) => saveEditing(e, q.id)} className="bg-green-100 text-green-700 p-1 rounded hover:bg-green-200"><Check size={14} /></button>
                                        <button onClick={cancelEditing} className="bg-red-100 text-red-700 p-1 rounded hover:bg-red-200"><X size={14} /></button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 flex flex-col min-w-0">
                                        <span className={`truncate font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                            {q.text || 'Untitled'}
                                        </span>
                                        {q.textRu && <span className="truncate text-xs text-gray-400 font-normal">{q.textRu}</span>}
                                    </div>

                                    {/* Edit Tools */}
                                    <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100' : ''}`}>
                                        <button
                                            onClick={(e) => startEditing(e, q)}
                                            className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded"
                                        >
                                            <Pencil size={12} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, q.id)}
                                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                        {isSelected && <ArrowRight size={14} className="text-indigo-500 ml-1" />}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}

                {questions.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-xs">
                        No keys yet.
                        <br />Click + to add one.
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionList;
