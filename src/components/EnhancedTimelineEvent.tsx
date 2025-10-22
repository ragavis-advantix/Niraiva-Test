import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Link, FileText, Bell, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TimelineEvent as ITimelineEvent } from '@/types/timeline';
import { Card } from '@/components/ui/card';

interface EnhancedTimelineEventProps {
    event: ITimelineEvent;
    isLast: boolean;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onShare?: () => void;
    onSetReminder?: () => void;
    onViewDocuments?: () => void;
    relatedEvents?: ITimelineEvent[];
}

export const EnhancedTimelineEvent: React.FC<EnhancedTimelineEventProps> = ({
    event,
    isLast,
    isExpanded,
    onToggleExpand,
    onShare,
    onSetReminder,
    onViewDocuments,
    relatedEvents = []
}) => {
    const priorityColors = {
        high: 'border-red-200 dark:border-red-800',
        medium: 'border-yellow-200 dark:border-yellow-800',
        normal: 'border-gray-200 dark:border-gray-700'
    };

    return (
        <div className="relative">
            <Card
                className={`p-4 transition-all hover:shadow-md ${priorityColors[event.metadata?.priority || 'normal']
                    }`}
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                                {event.title}
                            </h4>
                            {event.metadata?.priority === 'high' && (
                                <Badge variant="destructive">High Priority</Badge>
                            )}
                            {event.metadata?.tags?.map((tag) => (
                                <Badge key={tag} variant="secondary">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {event.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                            {event.metadata?.doctor && (
                                <span>Dr. {event.metadata.doctor.name}</span>
                            )}
                            {event.metadata?.location && (
                                <span>{event.metadata.location}</span>
                            )}
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onToggleExpand}>
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                        {event.parameters?.length > 0 && (
                            <div className="mb-4">
                                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    Health Parameters
                                </h5>
                                <div className="grid grid-cols-2 gap-3">
                                    {event.parameters.map((param) => (
                                        <div
                                            key={param.id}
                                            className="p-2 bg-gray-50 dark:bg-gray-900 rounded"
                                        >
                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                {param.name}
                                            </div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {param.value} {param.unit}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {relatedEvents.length > 0 && (
                            <div className="mb-4">
                                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    Related Events
                                </h5>
                                <div className="space-y-2">
                                    {relatedEvents.map((related) => (
                                        <div
                                            key={related.id}
                                            className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded text-sm"
                                        >
                                            <Link className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-600 dark:text-gray-300">
                                                {related.title}
                                            </span>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-gray-500">
                                                {new Date(related.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            {event.metadata?.attachments?.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onViewDocuments}
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Documents
                                </Button>
                            )}
                            {event.metadata?.followUp && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onSetReminder}
                                >
                                    <Bell className="h-4 w-4 mr-2" />
                                    Set Reminder
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onShare}
                            >
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                        </div>
                    </motion.div>
                )}
            </Card>
            {!isLast && (
                <div className="absolute left-6 top-full h-4 w-px bg-gray-200 dark:bg-gray-700" />
            )}
        </div>
    );
};