'use client';

import { Question } from './types';
import { Layers, Plus, FolderOpen, Folder, MoreVertical, Pencil, Trash2, Check, X } from 'lucide-react';
import { useState } from 'react';

interface CategorySidebarProps {
    categories: Question[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    onAdd: () => void;
    onUpdate: (id: number, text: string, textRu?: string) => void;
    onDelete: (id: number) => void;
}

const CategorySidebar = ({ categories, selectedId, onSelect, onAdd, onUpdate, onDelete }: CategorySidebarProps) => {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');
    const [editValueRu, setEditValueRu] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const startEditing = (e: React.MouseEvent, cat: Question) => {
        e.stopPropagation();
        setEditingId(cat.id);
        setEditValue(cat.text);
        setEditValueRu(cat.textRu || '');
        setDeleteConfirmId(null);
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

    const handleDeleteClick = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (deleteConfirmId === id) {
            onDelete(id);
            setDeleteConfirmId(null);
        } else {
            setDeleteConfirmId(id);
            // Auto-reset after 3 seconds
            setTimeout(() => setDeleteConfirmId(current => current === id ? null : current), 3000);
        }
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2 text-gray-700 font-semibold">
                    <Layers size={18} />
                    <span>Categories</span>
                </div>
                <button
                    onClick={onAdd}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Add Category"
                >
                    <Plus size={18} />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {categories.map((cat) => {
                    const isSelected = selectedId === cat.id;
                    const isEditing = editingId === cat.id;
                    const isConfirmingDelete = deleteConfirmId === cat.id;

                    return (
                        <div
                            key={cat.id}
                            onClick={() => !isEditing && onSelect(cat.id)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative cursor-pointer
                                ${isSelected
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                                    : 'text-gray-900 hover:bg-gray-50 hover:text-black'
                                }
                            `}
                        >
                            <span className={isSelected ? 'text-indigo-500' : 'text-gray-400'}>
                                {isSelected ? <FolderOpen size={18} /> : <Folder size={18} />}
                            </span>

                            {isEditing ? (
                                <div className="flex-1 flex flex-col gap-1">
                                    <input
                                        type="text"
                                        className="w-full bg-white border border-indigo-300 rounded px-1.5 py-1 text-xs text-gray-900 outline-none focus:ring-1 focus:ring-indigo-500"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        placeholder="Name (AZ)"
                                        autoFocus
                                    />
                                    <input
                                        type="text"
                                        className="w-full bg-white border border-indigo-300 rounded px-1.5 py-1 text-xs text-gray-900 outline-none focus:ring-1 focus:ring-indigo-500"
                                        value={editValueRu}
                                        onChange={(e) => setEditValueRu(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        placeholder="Name (RU)"
                                    />
                                    <div className="flex justify-end gap-1 mt-1">
                                        <button onClick={(e) => saveEditing(e, cat.id)} className="bg-green-100 text-green-700 p-1 rounded hover:bg-green-200"><Check size={14} /></button>
                                        <button onClick={cancelEditing} className="bg-red-100 text-red-700 p-1 rounded hover:bg-red-200"><X size={14} /></button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 flex flex-col min-w-0">
                                        <span className="truncate text-gray-900 font-medium">{cat.text || 'Untitled'}</span>
                                        {cat.textRu && <span className="truncate text-xs text-gray-400 font-normal">{cat.textRu}</span>}
                                    </div>

                                    {/* Actions (Always Visible) */}
                                    <div
                                        className={`flex items-center gap-1 relative z-20 ${isSelected ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {!isConfirmingDelete && (
                                            <button
                                                type="button"
                                                onClick={(e) => startEditing(e, cat)}
                                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded shadow-sm transition-colors cursor-pointer"
                                            >
                                                <Pencil size={14} className="pointer-events-none" />
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={(e) => handleDeleteClick(e, cat.id)}
                                            className={`p-1.5 rounded shadow-sm transition-all cursor-pointer flex items-center gap-1
                                                ${isConfirmingDelete
                                                    ? 'bg-red-500 text-white hover:bg-red-600 w-auto px-2'
                                                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                                }`}
                                        >
                                            {isConfirmingDelete ? (
                                                <span className="text-xs font-bold whitespace-nowrap">Confirm?</span>
                                            ) : (
                                                <Trash2 size={14} className="pointer-events-none" />
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CategorySidebar;
