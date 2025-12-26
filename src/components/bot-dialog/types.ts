export interface Question {
    id: number;
    text: string;
    textRu?: string;
    isActive: boolean;

    // For Categories, this is the name (e.g. "Services")
    // For Questions, this is the label (e.g. "Price?")

    // Parent/Child Relationship
    // If parentId is null -> It's a Category
    // If parentId is set -> It's a Question in that Category
    parentId?: number | null;

    // The Answer (Only relevant for Questions)
    answer?: string;
    answerRu?: string;

    buttons?: Button[]; // Still kept for compatibility if we need sub-menus later
    attachment?: { type: 'image' | 'file', url: string, name: string };
    externalLink?: string;
    linkText?: string;
    linkTextRu?: string;
}

export interface Button {
    id: number;
    text: string;
    nextQuestionId?: number | null;
}

export interface NewQuestionState {
    text: string;
    textRu?: string;
    parentId?: number | null;
    answer?: string;
    answerRu?: string;
    buttons: Button[];
}
