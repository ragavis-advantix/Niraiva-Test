export type EventPriority = 'high' | 'medium' | 'normal';
export type EventType = 'test' | 'diagnosis' | 'treatment' | 'medication' | 'appointment';
export type EventStatus = 'completed' | 'pending' | 'missed';

export interface EventMetadata {
    priority: EventPriority;
    doctor?: {
        name: string;
        specialty?: string;
        lab?: string;
    };
    diagnosis?: string;
    location?: string;
    tags?: string[];
    followUp?: {
        date: string;
        description: string;
    };
    attachments?: Array<{
        name: string;
        type: string;
        url: string;
    }>;
}

export interface TimelineEvent {
    id: string;
    date: string;
    title: string;
    description: string;
    type: EventType;
    status: EventStatus;
    parameters: any[];
    highlight?: boolean;
    metadata?: EventMetadata;
}

export interface EventAnalytics {
    totalEvents: number;
    byType: Record<EventType, number>;
    completionRate: number;
    trendsData: Record<string, number>;
}