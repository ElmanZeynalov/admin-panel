'use client';

import { Question } from './types';
import { Type, MessageCircle, Link, Paperclip, X, FileText, ImageIcon, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

// ... interface ...
interface AnswerEditorProps {
    question: Question | undefined;
    onUpdate: (id: number, updates: Partial<Question>) => void;
}

const AnswerEditor = ({ question, onUpdate }: AnswerEditorProps) => {
    const [localAnswer, setLocalAnswer] = useState('');
    const [localAnswerRu, setLocalAnswerRu] = useState('');
    const [localExternalLink, setLocalExternalLink] = useState('');
    const [localLinkText, setLocalLinkText] = useState('');
    const [localLinkTextRu, setLocalLinkTextRu] = useState('');
    const [localAttachment, setLocalAttachment] = useState<{ type: 'image' | 'file', url: string, name: string } | undefined>(undefined);

    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Load
    useEffect(() => {
        if (question) {
            setLocalAnswer(question.answer || '');
            setLocalAnswerRu(question.answerRu || '');
            setLocalExternalLink(question.externalLink || '');
            setLocalLinkText(question.linkText || '');
            setLocalLinkTextRu(question.linkTextRu || '');
            setLocalAttachment(question.attachment);
        }
    }, [question]);

    // Auto-save changes to parent state (debounced)
    useEffect(() => {
        if (!question) return;

        // Skip if values match current question state
        if (
            question.answer === localAnswer &&
            question.answerRu === localAnswerRu &&
            question.externalLink === localExternalLink &&
            question.linkText === localLinkText &&
            question.linkTextRu === localLinkTextRu &&
            JSON.stringify(question.attachment) === JSON.stringify(localAttachment)
        ) return;

        const timer = setTimeout(() => {
            onUpdate(question.id, {
                answer: localAnswer,
                answerRu: localAnswerRu,
                externalLink: localExternalLink,
                linkText: localLinkText,
                linkTextRu: localLinkTextRu,
                attachment: localAttachment
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [localAnswer, localAnswerRu, localExternalLink, localLinkText, localLinkTextRu, localAttachment, question, onUpdate]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();

            if (data.success) {
                setLocalAttachment({
                    type: data.type,
                    url: data.url,
                    name: data.name
                });
            } else {
                alert('Upload failed: ' + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Upload error');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (!question) {
        return (
            <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shrink-0 items-center justify-center p-8 text-center bg-gray-50/30">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
                    <MessageCircle size={24} />
                </div>
                <p className="text-gray-400 text-sm font-medium">Select a question to edit answer</p>
            </div>
        );
    }

    return (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shrink-0 transition-all duration-300 ease-in-out">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50 text-gray-700 font-semibold h-[60px]">
                <Type size={18} />
                <span>Answer</span>
            </div>

            {/* Content Form */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* AZ Input */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center justify-between">
                        <span>Response (AZ)</span>
                        {localAnswer && <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Saved</span>}
                    </label>
                    <textarea
                        className="w-full h-32 px-3 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm leading-relaxed resize-none shadow-sm placeholder:text-gray-300"
                        value={localAnswer}
                        onChange={(e) => setLocalAnswer(e.target.value)}
                        placeholder="Write the bot's response here..."
                    />
                </div>

                {/* RU Input */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center justify-between">
                        <span>Response (RU)</span>
                        <span className="text-[10px] text-gray-400 font-normal">Optional</span>
                    </label>
                    <textarea
                        className="w-full h-24 px-3 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm leading-relaxed resize-none shadow-sm placeholder:text-gray-300"
                        value={localAnswerRu}
                        onChange={(e) => setLocalAnswerRu(e.target.value)}
                        placeholder="Russian translation..."
                    />
                </div>

                <div className="h-px bg-gray-100 my-4" />

                {/* Attachment Section */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                        <Paperclip size={12} />
                        <span>Attachment</span>
                    </label>

                    {!localAttachment ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            {isUploading ? (
                                <Loader2 size={24} className="text-indigo-500 animate-spin" />
                            ) : (
                                <>
                                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:text-indigo-500 mb-2 transition-colors">
                                        <Paperclip size={20} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 group-hover:text-indigo-600">Click to upload file</span>
                                    <span className="text-[10px] text-gray-400 mt-0.5">Image or Document</span>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="relative group border border-gray-200 rounded-xl p-3 flex items-start gap-3 bg-gray-50/50">
                            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                {localAttachment.type === 'image' ? <ImageIcon size={20} /> : <FileText size={20} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 truncate" title={localAttachment.name}>{localAttachment.name}</p>
                                <a href={localAttachment.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-500 hover:underline block mt-0.5">
                                    View File
                                </a>
                            </div>
                            <button
                                onClick={() => setLocalAttachment(undefined)}
                                className="p-1 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                </div>

                {/* External Link Section */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                        <Link size={12} />
                        <span>External Link Config</span>
                    </label>

                    <div className="space-y-2">
                        <input
                            type="text"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm shadow-sm placeholder:text-gray-300"
                            value={localExternalLink}
                            onChange={(e) => setLocalExternalLink(e.target.value)}
                            placeholder="https://example.com"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm shadow-sm placeholder:text-gray-300"
                                value={localLinkText}
                                onChange={(e) => setLocalLinkText(e.target.value)}
                                placeholder="Link Text (AZ)"
                            />
                            <input
                                type="text"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm shadow-sm placeholder:text-gray-300"
                                value={localLinkTextRu}
                                onChange={(e) => setLocalLinkTextRu(e.target.value)}
                                placeholder="Link Text (RU)"
                            />
                        </div>
                    </div>

                    <p className="text-[10px] text-gray-400">
                        The specified text in the answer will become clickable. Default: "burada"
                    </p>
                </div>

                {/* Info Note */}
                <div className="bg-blue-50/50 rounded-lg p-3 text-xs text-blue-600/80 leading-relaxed border border-blue-100/50 mt-4">
                    Changes are auto-saved. Click <strong>"Save Changes"</strong> to publish.
                </div>

            </div>
        </div>
    );
};

export default AnswerEditor;
