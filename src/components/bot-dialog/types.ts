export interface Question {
    id: number;
    text: string;
    textRu?: string;
    isActive: boolean;
    externalLink?: string;
    buttons?: { id: number; text: string; textRu?: string; nextQuestionId?: number | null }[];
    attachment?: { type: 'image' | 'file', url: string, name: string };
    defaultNextId?: number | null;
}

export interface NewQuestionState {
    text: string;
    textRu?: string;
    buttons: { id: number; text: string; textRu?: string; nextQuestionId?: number | null }[];
    attachment?: { type: 'image' | 'file', url: string, name: string };
    externalLink?: string;
    defaultNextId?: number | null;
}

export interface ChatMessage {
    id: number;
    type: 'bot' | 'user';
    text: string;
    buttons?: { id: number; text: string; nextQuestionId?: number | null }[];
    attachment?: { type: 'image' | 'file', url: string, name: string };
}
