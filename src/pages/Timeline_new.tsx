import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Filter, Search, Calendar, Check, Clock, Download, Share2,
    Tag, Bell, TrendingUp, Link, CalendarCheck, FileText,
    AlertCircle, ChevronDown, ChevronRight, X
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { VoiceNavigation } from '@/components/VoiceNavigation';
import { useVoiceNavigation } from '@/components/VoiceNavigationProvider';
import { ReportUploader } from '@/components/ReportUploader';
import { useReports } from '@/contexts/ReportContext';
import { timelineEvents as defaultTimelineEvents } from '@/utils/healthData';
import { EnhancedTimelineEvent } from '@/components/EnhancedTimelineEvent';
import { analyzeReport, groupEventsByTime, getRelatedEvents } from '@/utils/timeline';
import type { TimelineEvent, EventAnalytics } from '@/types/timeline';

// UI Components
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// Event types for filtering
const eventTypes = ['test', 'diagnosis', 'treatment', 'medication', 'appointment'] as const;

// Analytics helpers
const calculateAnalytics = (events: TimelineEvent[]): EventAnalytics => ({
    totalEvents: events.length,
    byType: events.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>),
    completionRate: (events.filter(e => e.status === 'completed').length / events.length) * 100,
    trendsData: events.reduce((acc, event) => {
        const month = new Date(event.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
    }, {} as Record<string, number>)
});

const Timeline = () => {
    const { isListening, toggleListening, transcript } = useVoiceNavigation();
    const { reports, healthParameters, chronicConditions } = useReports();

    // State management
    const [filterType, setFilterType] = useState<typeof eventTypes[number] | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [expandedEvents, setExpandedEvents] = useState<string[]>([]);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [allEvents, setAllEvents] = useState<TimelineEvent[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([]);

    // Generate events from reports and default events
    useEffect(() => {
        const updatedEvents: TimelineEvent[] = [...defaultTimelineEvents].map(event => ({
            ...event,
            parameters: event.parameters || []
        }));

        // Add events from reports with enhanced analysis
        if (reports.length > 0) {
            const reportEvents = reports.map(report => {
                const analysis = analyzeReport(report.content?.data || {});
                return {
                    id: `event-report-${report.id}`,
                    date: report.date,
                    title: analysis.title,
                    description: analysis.description,
                    type: analysis.type as typeof eventTypes[number],
                    parameters: healthParameters.filter(param =>
                        report.content?.data?.parameters?.some((p: any) =>
                            p.name === param.name
                        )
                    ),
                    status: 'completed' as const,
                    metadata: analysis.metadata
                } as TimelineEvent;
            });

            updatedEvents.push(...reportEvents);
        }

        // Sort by date (newest first)
        updatedEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setAllEvents(updatedEvents);
    }, [reports, healthParameters]);

    // Apply filters to events
    useEffect(() => {
        let filtered = allEvents.map(event => ({
            ...event,
            parameters: event.parameters || []
        }));

        // Apply date range filter
        if (dateRange.start && dateRange.end) {
            filtered = filtered.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= new Date(dateRange.start) && eventDate <= new Date(dateRange.end);
            });
        }

        // Apply type filter
        if (filterType) {
            filtered = filtered.filter(event => event.type === filterType);
        }

        // Apply tag filter
        if (selectedTags.length > 0) {
            filtered = filtered.filter(event =>
                event.metadata?.tags?.some(tag => selectedTags.includes(tag))
            );
        }

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(query) ||
                event.description.toLowerCase().includes(query)
            );
        }

        setFilteredEvents(filtered);
    }, [allEvents, filterType, searchQuery, dateRange, selectedTags]);

    // Compute analytics
    const analytics = useMemo(() => calculateAnalytics(filteredEvents), [filteredEvents]);

    // Event handlers
    const handleExport = async () => {
        const exportData = {
            events: filteredEvents,
            analytics,
            exportDate: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `health-timeline-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleShare = (event: TimelineEvent) => {
        // Implement sharing functionality
        console.log('Sharing event:', event);
    };

    const toggleEventExpand = (eventId: string) => {
        setExpandedEvents(prev =>
            prev.includes(eventId)
                ? prev.filter(id => id !== eventId)
                : [...prev, eventId]
        );
    };

    const groupedEvents = useMemo(() =>
        groupEventsByTime(filteredEvents),
        [filteredEvents]
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
            <Navbar />

            <div className="container mx-auto px-4 pt-24 pb-16">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Health Timeline</h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">Track your health journey chronologically</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExport}
                                className="flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Export
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAnalytics(true)}
                                className="flex items-center gap-2"
                            >
                                <TrendingUp className="h-4 w-4" />
                                Analytics
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-niraiva-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {eventTypes.map(type => (
                                <Button
                                    key={type}
                                    variant={filterType === type ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setFilterType(filterType === type ? null : type)}
                                    className="capitalize"
                                >
                                    {type}
                                </Button>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <span className="text-gray-500 self-center">to</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <ReportUploader />
                        </motion.div>

                        <div className="space-y-8">
                            {Object.entries(groupedEvents).map(([timeGroup, events]) => (
                                <motion.div
                                    key={timeGroup}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        {timeGroup}
                                    </h2>
                                    <div className="space-y-4">
                                        {events.map((event, index) => (
                                            <EnhancedTimelineEvent
                                                key={event.id}
                                                event={event}
                                                isLast={index === events.length - 1}
                                                isExpanded={expandedEvents.includes(event.id)}
                                                onToggleExpand={() => toggleEventExpand(event.id)}
                                                onShare={() => handleShare(event)}
                                                relatedEvents={getRelatedEvents(event, allEvents)}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timeline Analytics</h3>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600 dark:text-gray-300">Completion Rate</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {Math.round(analytics.completionRate)}%
                                        </span>
                                    </div>
                                    <Progress value={analytics.completionRate} className="h-2" />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {Object.entries(analytics.byType).map(([type, count]) => (
                                        <div key={type} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">{type}</div>
                                            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{count as number}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {selectedTags.length > 0 && (
                            <Card className="p-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Filters</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedTags.map(tag => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="cursor-pointer"
                                            onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                                        >
                                            {tag}
                                            <X className="ml-1 h-3 w-3" />
                                        </Badge>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Timeline Analytics</DialogTitle>
                        <DialogDescription>
                            Detailed analysis of your health events and trends
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 space-y-6">
                        {/* Add detailed analytics visualizations here */}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Timeline;