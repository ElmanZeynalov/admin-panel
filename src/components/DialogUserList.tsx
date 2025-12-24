'use client';

import { useState, useEffect } from 'react';
import { Download, X, MessageSquare, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Message {
    id: number;
    sender: 'user' | 'bot';
    text: string;
    time: string;
}

interface UserData {
    id: number;
    name: string;
    username?: string;
    phoneNumber?: string;
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
                    username: u.username,
                    phoneNumber: u.phoneNumber,
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

    const downloadPDF = async (user: UserData) => {
        // DEBUG ALERT: To confirm latest code is running
        alert('DEBUG: PDF Yükləmə Başladıldı (V3)...');

        try {
            console.log('Starting PDF generation for:', user.name);
            const doc = new jsPDF();

            // Simple ASCII conversion for safe testing (Temporary fix for encoding crashes)
            const safeText = (text: string) => text.replace(/[^\x00-\x7F]/g, "?");

            // Add Header
            doc.setFontSize(16);
            doc.text(`Dialog: ${safeText(user.name)}`, 14, 20);

            doc.setFontSize(10);
            doc.text(`ID: ${user.id} | Status: ${user.isAnonim ? 'Anonim' : 'Registered'}`, 14, 28);
            if (user.username) doc.text(`Username: @${safeText(user.username)}`, 14, 34);
            if (user.phoneNumber) doc.text(`Phone: ${user.phoneNumber}`, 14, 40);

            const dateY = user.phoneNumber ? 46 : (user.username ? 40 : 34);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, dateY);

            // Prepare Table Data
            const tableBody = user.messages.map(msg => [
                msg.sender === 'bot' ? 'Bot' : 'User',
                msg.time,
                safeText(msg.text)
            ]);

            // Add Table
            autoTable(doc, {
                startY: dateY + 6,
                head: [['Sender', 'Time', 'Message']],
                body: tableBody,
                styles: { fontSize: 9 },
                headStyles: { fillColor: [66, 133, 244] }, // Blue header
                columnStyles: {
                    0: { cellWidth: 20 },
                    1: { cellWidth: 30 },
                    2: { cellWidth: 'auto' }
                },
                didParseCell: (data) => {
                    // Color code rows based on sender
                    const rawRow = data.row.raw as unknown as string[];
                    if (data.section === 'body' && rawRow[0] === 'Bot') {
                        data.cell.styles.fillColor = [240, 248, 255]; // Light blue for bot
                    }
                }
            });

            // Sanitize filename
            const safeName = user.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const dateStr = new Date().toISOString().split('T')[0];
            const filename = `dialog_${safeName}_${dateStr}.pdf`;
            doc.save(filename);

            console.log('PDF saved successfully');
            alert('PDF Uğurla Yadda Saxlanıldı! Yükləmələr qovluğunu yoxlayın.');
        } catch (error: any) {
            console.error('PDF Generation Error:', error);
            alert(`PDF XƏTASI: ${error.message || error}`);
        }
    };

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
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-900">{user.name}</p>
                                        {user.username && (
                                            <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                                                @{user.username}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-0.5 mt-0.5">
                                        <p className="text-xs text-gray-500 flex items-center">
                                            <MessageSquare className="w-3 h-3 mr-1" />
                                            {user.messages.length} mesaj
                                        </p>
                                        {user.phoneNumber ? (
                                            <p className="text-xs text-green-600 font-medium">
                                                📞 {user.phoneNumber}
                                            </p>
                                        ) : (
                                            <p className="text-[10px] text-gray-400 italic">
                                                Nömrə yoxdur
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    downloadPDF(user);
                                }}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                title="PDF Yüklə"
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
