'use client';

import { useState, useEffect } from 'react';
import { Download, X, MessageSquare, Loader2 } from 'lucide-react';

interface Message {
    id: number;
    sender: 'user' | 'bot';
    text: string;
    time: string;
}

interface UserData {
    id: number;
    name: string;
    isAnonim: boolean;
    messages: Message[];
}

const DialogUserList = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    useEffect(() => {
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                // Map DB data to UI format
                // Ensure reliable mapping even if API returns slightly different shapes
                const formattedUsers = Array.isArray(data) ? data.map((u: any) => ({
                    id: u.id,
                    name: u.fullName || u.username || (u.isAnonim ? 'Anonim' : `User #${u.id}`),
                    isAnonim: u.isAnonim,
                    messages: Array.isArray(u.messages) ? u.messages.map((m: any) => ({
                        id: m.id,
                        sender: m.sender, // 'user' | 'bot'
                        text: m.text,
                        time: m.time
                    })) : []
                })) : [];
                setUsers(formattedUsers);
            })
            .catch(err => console.error('Failed to load users', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 flex justify-center items-center">
                <div className="flex items-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Yüklənir...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Dialogs</h3>
                </div>
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                    {users.length === 0 && (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            Hələ ki istifadəçi yoxdur
                        </div>
                    )}
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                            onClick={() => setSelectedUser(user)}
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${user.isAnonim ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500 flex items-center mt-0.5">
                                        <MessageSquare className="w-3 h-3 mr-1" />
                                        {user.messages.length} mesaj
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    alert(`Downloading dialog for ${user.name}`);
                                }}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                title="Download Dialog"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dialog Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <div>
                                <h3 className="font-semibold text-gray-900">{selectedUser.name}</h3>
                                <p className="text-xs text-gray-500">
                                    {selectedUser.isAnonim ? 'Anonim İstifadəçi' : 'Qeydiyyatlı İstifadəçi'}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-gray-50/30">
                            {selectedUser.messages.length === 0 ? (
                                <div className="text-center text-gray-400 text-sm py-4">
                                    Mesaj yoxdur
                                </div>
                            ) : (
                                selectedUser.messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${msg.sender === 'bot' ? 'items-end' : 'items-start'}`}
                                    >
                                        <div
                                            className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'bot'
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1 px-1 font-medium">
                                            {msg.sender === 'bot' ? 'Bot' : 'İstifadəçi'} • {msg.time}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Bağla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DialogUserList;
