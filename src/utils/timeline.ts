import { EventPriority, TimelineEvent } from '@/types/timeline';

export const analyzeReport = (content: any) => {
    // Determine report type
    const type = content.type || determineReportType(content);

    // Extract doctor information
    const doctorInfo = extractDoctorInfo(content);

    // Generate metadata
    const metadata = {
        priority: calculatePriority(content),
        doctor: doctorInfo,
        diagnosis: content.diagnosis,
        location: content.location || doctorInfo?.lab,
        tags: generateTags(content),
        followUp: content.followUp,
        attachments: content.attachments
    };

    return {
        type,
        metadata,
        title: generateTitle(type, doctorInfo, content),
        description: generateDescription(type, content)
    };
};

export const determineReportType = (content: any) => {
    if (content.labTests || content.testResults || (content.parameters?.length > 0)) {
        return 'test';
    }
    if (content.medications || content.prescriptions) {
        return 'medication';
    }
    if (content.consultation || content.doctorNotes) {
        return 'appointment';
    }
    if (content.diagnosis) {
        return 'diagnosis';
    }
    if (content.treatment || content.treatmentPlan) {
        return 'treatment';
    }
    return 'test';
};

export const extractDoctorInfo = (content: any) => {
    const doctor = content.doctor || content.physician || content.consultant || {};
    if (!doctor.name && !doctor.specialty && !doctor.lab) return null;

    return {
        name: doctor.name || doctor.fullName,
        specialty: doctor.specialty || doctor.department,
        lab: doctor.lab || doctor.laboratory
    };
};

export const calculatePriority = (content: any): EventPriority => {
    if (content.urgent || content.critical || content.diagnosis) {
        return 'high';
    }
    if (content.medications || content.followUp) {
        return 'medium';
    }
    return 'normal';
};

export const generateTags = (content: any): string[] => {
    const tags = new Set<string>();

    if (content.category) tags.add(content.category);
    if (content.specialty) tags.add(content.specialty);
    if (content.diagnosis) tags.add('Diagnosis');
    if (content.medications?.length > 0) tags.add('Medication');
    if (content.urgent) tags.add('Urgent');
    if (content.followUp) tags.add('Follow-up Required');

    return Array.from(tags);
};

export const generateTitle = (type: string, doctor: any, content: any): string => {
    switch (type) {
        case 'test':
            return `${content.testName || 'Medical Test'}${doctor ? ` at ${doctor.lab || 'Laboratory'}` : ''}`;
        case 'diagnosis':
            return `Diagnosis${doctor ? ` by Dr. ${doctor.name}` : ''}`;
        case 'treatment':
            return `Treatment Plan${doctor ? ` from Dr. ${doctor.name}` : ''}`;
        case 'medication':
            return `Medication Update${doctor ? ` by Dr. ${doctor.name}` : ''}`;
        case 'appointment':
            return `Consultation${doctor ? ` with Dr. ${doctor.name}` : ''}`;
        default:
            return content.title || 'Medical Report';
    }
};

export const generateDescription = (type: string, content: any): string => {
    switch (type) {
        case 'test':
            return content.summary || `Medical tests conducted: ${content.parameters?.map((p: any) => p.name).join(', ')}`;
        case 'diagnosis':
            return content.diagnosis || 'New medical diagnosis recorded';
        case 'treatment':
            return content.treatment?.description || 'Updated treatment plan';
        case 'medication':
            return `Medications: ${content.medications?.map((m: any) => m.name).join(', ')}`;
        case 'appointment':
            return content.notes || 'Medical consultation notes';
        default:
            return content.description || 'Medical report details';
    }
};

export const getRelatedEvents = (event: TimelineEvent, allEvents: TimelineEvent[]): TimelineEvent[] => {
    return allEvents.filter(e =>
        e.id !== event.id && (
            // Related by parameters
            e.parameters?.some(p1 =>
                event.parameters?.some(p2 => p1.name === p2.name)
            ) ||
            // Related by diagnosis
            (e.metadata?.diagnosis && event.metadata?.diagnosis &&
                e.metadata.diagnosis === event.metadata.diagnosis) ||
            // Related by doctor
            (e.metadata?.doctor?.name && event.metadata?.doctor?.name &&
                e.metadata.doctor.name === event.metadata.doctor.name)
        )
    );
};

export const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
};

export const groupEventsByTime = (events: TimelineEvent[]): Record<string, TimelineEvent[]> => {
    const groups: Record<string, TimelineEvent[]> = {
        'Today': [],
        'Yesterday': [],
        'This Week': [],
        'This Month': [],
        'Last 3 Months': [],
        'This Year': [],
        'Older': []
    };

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const yearAgo = new Date(now);
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    events.forEach(event => {
        const eventDate = new Date(event.date);

        if (eventDate.toDateString() === now.toDateString()) {
            groups['Today'].push(event);
        } else if (eventDate.toDateString() === yesterday.toDateString()) {
            groups['Yesterday'].push(event);
        } else if (eventDate >= weekAgo) {
            groups['This Week'].push(event);
        } else if (eventDate >= monthAgo) {
            groups['This Month'].push(event);
        } else if (eventDate >= threeMonthsAgo) {
            groups['Last 3 Months'].push(event);
        } else if (eventDate >= yearAgo) {
            groups['This Year'].push(event);
        } else {
            groups['Older'].push(event);
        }
    });

    // Remove empty groups
    Object.keys(groups).forEach(key => {
        if (groups[key].length === 0) {
            delete groups[key];
        }
    });

    return groups;
};