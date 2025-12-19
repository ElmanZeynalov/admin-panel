import { useState } from 'react';
import { GripVertical, Trash2, Pencil, FileText, Image as ImageIcon, Paperclip } from 'lucide-react';
import { Question } from './types';

interface QuestionListProps {
    questions: Question[];
    onUpdateQuestions: (questions: Question[]) => void;
    onEdit: (question: Question) => void;
    onDelete: (id: number) => void;
    onToggleActive: (id: number) => void;
}

const QuestionList = ({ questions, onUpdateQuestions, onEdit, onDelete, onToggleActive }: QuestionListProps) => {
    const [draggedItem, setDraggedItem] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = "move";
        // Ghost image improve
        const ghost = e.currentTarget.cloneNode(true) as HTMLElement;
        ghost.style.opacity = "0.5";
        ghost.style.position = "absolute";
        ghost.style.top = "-1000px";
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 0, 0);
        setTimeout(() => document.body.removeChild(ghost), 0);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedItem === null || draggedItem === index) return;

        const newQuestions = [...questions];
        const draggedQuestion = newQuestions[draggedItem];
        newQuestions.splice(draggedItem, 1);
        newQuestions.splice(index, 0, draggedQuestion);

        onUpdateQuestions(newQuestions);
        setDraggedItem(index);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
            {questions.map((question, index) => (
                <div
                    key={question.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`group bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-start gap-4 ${draggedItem === index ? 'opacity-50 border-blue-300 border-dashed' : ''
                        }`}
                >
                    <div className="mt-3 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600">
                        <GripVertical className="w-5 h-5" />
                    </div>

                    <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-start">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Sual Mətni
                            </label>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-medium ${question.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                    {question.isActive ? 'Aktiv' : 'Deaktiv'}
                                </span>
                                <button
                                    onClick={() => onToggleActive(question.id)}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${question.isActive ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${question.isActive ? 'translate-x-5' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm">
                            {question.text}
                        </div>

                        {question.attachment && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200">
                                {question.attachment.type === 'image' ? (
                                    <ImageIcon className="w-4 h-4 text-blue-500" />
                                ) : (
                                    <Paperclip className="w-4 h-4 text-orange-500" />
                                )}
                                <span className="text-xs text-gray-600 font-medium truncate max-w-[200px]">
                                    {question.attachment.name}
                                </span>
                            </div>
                        )}

                        {question.buttons && question.buttons.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {question.buttons.map((btn) => (
                                    <span
                                        key={btn.id}
                                        className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
                                    >
                                        {btn.text}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onEdit(question)}
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Düzəliş et"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        {question.id !== 1 && (
                            <button
                                onClick={() => onDelete(question.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Sil"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default QuestionList;
