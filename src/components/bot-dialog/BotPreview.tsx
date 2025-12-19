import { useState, useEffect } from 'react';
import { Plus, Send, Battery, Wifi, Signal, RefreshCcw, FileText } from 'lucide-react';
import { Question, ChatMessage } from './types';

interface BotPreviewProps {
    questions: Question[];
}

const BotPreview = ({ questions }: BotPreviewProps) => {
    // Chat Simulation State
    const [previewMode, setPreviewMode] = useState<'interactive' | 'list'>('interactive');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [userInputValue, setUserInputValue] = useState('');

    // Initialize chat with first question
    useEffect(() => {
        if (questions.length > 0 && chatHistory.length === 0) {
            resetChat();
        }
    }, [questions]);

    const resetChat = () => {
        const activeQuestions = questions.filter(q => q.isActive);
        if (activeQuestions.length > 0) {
            setChatHistory([{
                id: Date.now(),
                type: 'bot',
                text: activeQuestions[0].text,
                buttons: activeQuestions[0].buttons,
                attachment: activeQuestions[0].attachment
            }]);
            setCurrentStep(0);
        } else {
            setChatHistory([]);
            setCurrentStep(-1);
        }
        setUserInputValue('');
    };

    const handleUserResponse = (text: string) => {
        const activeQuestions = questions.filter(q => q.isActive);

        // Add User Message
        const userMsg: ChatMessage = {
            id: Date.now(),
            type: 'user',
            text: text
        };

        // Prepare Next Bot Message
        let nextBotMsg: ChatMessage | null = null;
        const currentQuestion = activeQuestions[currentStep];
        let nextQuestion: Question | undefined;

        // Determine Next Question Logic
        if (text) {
            // Check if text matches a button
            const clickedButton = currentQuestion.buttons?.find(b => b.text === text);
            if (clickedButton && clickedButton.nextQuestionId) {
                // Branch by Button
                nextQuestion = questions.find(q => q.id === clickedButton.nextQuestionId);
            } else if (currentQuestion.defaultNextId) {
                // Branch by Text Reply (default)
                if (currentQuestion.defaultNextId === -1) {
                    nextQuestion = undefined; // End Dialog
                } else {
                    nextQuestion = questions.find(q => q.id === currentQuestion.defaultNextId);
                }
            } else {
                // Fallback: Next in list
                if (currentStep < activeQuestions.length - 1) {
                    nextQuestion = activeQuestions[currentStep + 1];
                }
            }
        }

        if (nextQuestion && nextQuestion.isActive) {
            nextBotMsg = {
                id: Date.now() + 1,
                type: 'bot',
                text: nextQuestion.text,
                buttons: nextQuestion.buttons,
                attachment: nextQuestion.attachment
            };

            // Find index of next question for step tracking
            const nextStepIndex = activeQuestions.findIndex(q => q.id === nextQuestion?.id);
            if (nextStepIndex !== -1) {
                setCurrentStep(nextStepIndex);
            } else {
                // Fallback if jumping to inactive or unknown question, just hold step
                setCurrentStep(prev => prev + 1);
            }
        } else {
            // End of dialog or manual end
            setCurrentStep(activeQuestions.length); // Move past end
        }

        setChatHistory(prev => {
            const newHistory = [...prev, userMsg];
            if (nextBotMsg) newHistory.push(nextBotMsg);
            return newHistory;
        });

        // Removed simple increment, handled above
        setUserInputValue('');
    };

    return (
        <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col items-center justify-center">
            <div className="relative w-[320px] h-[650px] bg-black rounded-[50px] border-[12px] border-black shadow-2xl overflow-hidden ring-1 ring-gray-900/10">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-2xl z-20"></div>

                {/* Status Bar */}
                <div className="absolute top-0 w-full h-[44px] px-6 flex justify-between items-center z-10 text-white text-[10px] font-medium pt-2">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5">
                        <Signal className="w-3 h-3" />
                        <Wifi className="w-3 h-3" />
                        <Battery className="w-4 h-4" />
                    </div>
                </div>

                {/* Telegram Header */}
                <div className="absolute top-0 w-full h-[100px] bg-[#2A2A2A] z-0 pt-[44px] px-4 flex items-center gap-3 border-b border-white/10">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                        B
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-sm">Bot Assistant</h3>
                        <p className="text-blue-400 text-xs">bot</p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="w-full h-full bg-[#0E1621] pt-[110px] pb-[80px] px-3 overflow-y-auto space-y-3 scrollbar-hide">
                    <div className="flex justify-center mb-4">
                        <span className="bg-[#182533] text-gray-400 text-[10px] px-2 py-1 rounded-full">Bugün</span>
                    </div>

                    {previewMode === 'list' ? (
                        // List Mode: Show all active questions
                        questions
                            .filter((q) => q.isActive && q.text.trim().length > 0)
                            .map((question) => (
                                <div key={question.id} className="flex flex-col items-start animate-in slide-in-from-left-2 duration-300">
                                    <div className="bg-[#2B5278] text-white px-4 py-2 rounded-2xl rounded-tl-none max-w-[85%] text-sm shadow-sm overflow-hidden">
                                        {question.attachment && (
                                            <div className="mb-2 -mx-4 -mt-2">
                                                {question.attachment.type === 'image' ? (
                                                    <img src={question.attachment.url} alt="Attachment" className="w-full h-auto object-cover max-h-[200px]" />
                                                ) : (
                                                    <div className="bg-white/10 p-3 flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                                            <FileText className="w-4 h-4 text-white" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-white text-xs font-medium truncate">{question.attachment.name}</p>
                                                            <p className="text-blue-200 text-[10px]">Fayl</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {question.text}
                                    </div>
                                    {question.buttons && question.buttons.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2 max-w-[85%]">
                                            {question.buttons.map((btn) => (
                                                <button
                                                    key={btn.id}
                                                    className="bg-[#2B5278]/20 hover:bg-[#2B5278]/30 border border-[#2B5278] text-[#2B5278] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                                >
                                                    {btn.text}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <span className="text-[10px] text-gray-500 mt-1 ml-2">09:41</span>
                                </div>
                            ))
                    ) : (
                        // Interactive Mode: Show chat history
                        chatHistory.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`${msg.type === 'user' ? 'bg-[#2B5278] text-white rounded-tr-none' : 'bg-[#182533] text-white rounded-tl-none'} px-4 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm break-words overflow-hidden`}>
                                    {msg.attachment && (
                                        <div className="mb-2 -mx-4 -mt-2">
                                            {msg.attachment.type === 'image' ? (
                                                <img src={msg.attachment.url} alt="Attachment" className="w-full h-auto object-cover max-h-[200px]" />
                                            ) : (
                                                <div className="bg-white/10 p-3 flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                                        <FileText className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white text-xs font-medium truncate">{msg.attachment.name}</p>
                                                        <p className="text-blue-200 text-[10px]">Fayl</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {msg.text}
                                </div>

                                {msg.type === 'bot' && msg.buttons && msg.buttons.length > 0 && currentStep === chatHistory.filter(m => m.type === 'bot').indexOf(msg) && (
                                    <div className="mt-2 flex flex-wrap gap-2 max-w-[85%]">
                                        {msg.buttons.map((btn) => (
                                            <button
                                                key={btn.id}
                                                onClick={() => handleUserResponse(btn.text)}
                                                className="bg-[#2B5278]/20 hover:bg-[#2B5278]/30 border border-[#2B5278] text-[#2B5278] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                            >
                                                {btn.text}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <span className="text-[10px] text-gray-500 mt-1 mx-2">09:41</span>
                            </div>
                        ))
                    )}
                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 w-full h-[80px] bg-[#17212B] px-4 py-2 flex items-center gap-3 border-t border-white/5">
                    <div className="w-8 h-8 rounded-full bg-[#2B5278] flex items-center justify-center">
                        <Plus className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={userInputValue}
                        onChange={(e) => setUserInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && userInputValue.trim() && handleUserResponse(userInputValue)}
                        placeholder="Mesaj yazın..."
                        className="flex-1 h-9 bg-[#0E1621] rounded-full px-4 text-white text-sm focus:outline-none placeholder-gray-500"
                    />
                    <button
                        onClick={() => userInputValue.trim() && handleUserResponse(userInputValue)}
                        className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
                    >
                        <Send className="w-4 h-4 ml-0.5" />
                    </button>
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-[120px] h-1 bg-white/20 rounded-full"></div>
            </div>
            <div className="flex items-center gap-2 mt-6 bg-gray-100 p-1 rounded-lg">
                <button
                    onClick={() => setPreviewMode('list')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${previewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Siyahı
                </button>
                <button
                    onClick={() => {
                        setPreviewMode('interactive');
                        resetChat();
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${previewMode === 'interactive' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Test Et
                </button>
                {previewMode === 'interactive' && (
                    <button
                        onClick={resetChat}
                        className="ml-2 p-1.5 hover:bg-white rounded-full text-gray-500 transition-colors"
                        title="Yenilə"
                    >
                        <RefreshCcw className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default BotPreview;
