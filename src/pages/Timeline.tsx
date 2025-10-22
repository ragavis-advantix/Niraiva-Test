
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
// Dialog import fixed above

// Helper functions for report analysis
const determineReportType = (content: any): 'lab_test' | 'prescription' | 'consultation' | 'treatment_plan' | 'general' => {
  if (content.labTests || content.testResults || (content.parameters && content.parameters.length > 0)) {
    return 'lab_test';
  }
  if (content.medications || content.prescriptions) {
    return 'prescription';
  }
  if (content.consultation || content.doctorNotes || content.diagnosis) {
    return 'consultation';
  }
  if (content.treatment || content.treatmentPlan) {
    return 'treatment_plan';
  }
  return 'general';
};

const extractDoctorInfo = (content: any) => {
  const doctor = content.doctor || content.physician || content.consultant || {};
  if (!doctor.name && !doctor.specialty && !doctor.lab) return null;
  return {
    name: doctor.name || doctor.fullName,
    specialty: doctor.specialty || doctor.department,
    lab: doctor.lab || doctor.laboratory
  };
};

const extractTestInfo = (content: any) => {
  const tests = content.labTests || content.testResults || content.parameters || [];
  if (!Array.isArray(tests) && typeof tests === 'object') {
    return {
      name: tests.name || 'General Tests',
      parameters: Object.keys(tests).filter(key => typeof tests[key] === 'number' || typeof tests[key] === 'string')
    };
  }
  return {
    name: tests[0]?.name || tests[0]?.type || 'Medical Tests',
    parameters: tests.map((t: any) => t.name || t.parameter || t.type).filter(Boolean)
  };
};

// Removed local groupEventsByTime, using imported version


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

// Helper functions
const getPriorityLevel = (event: any) => {
  if (event.type === 'diagnosis' || event.parameters?.some((p: any) => p.status === 'critical')) return 'high';
  if (event.type === 'medication' || event.parameters?.some((p: any) => p.status === 'warning')) return 'medium';
  return 'normal';
};


const formatDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
};

const Timeline = () => {
  const { isListening, toggleListening, transcript } = useVoiceNavigation();
  const { reports, healthParameters, chronicConditions } = useReports();

  // Filtering and search state
  const [filterType, setFilterType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // UI state
  const [expandedEvents, setExpandedEvents] = useState<string[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  // Events state
  const [allEvents, setAllEvents] = useState<TimelineEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);

  // Add missing event handlers
  const toggleEventExpand = (eventId: string) => {
    setExpandedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleShare = (event: TimelineEvent) => {
    // Implement sharing functionality
    console.log('Sharing event:', event);
  };
  // Generate events from reports and default events
  useEffect(() => {
    const timelineEvents = defaultTimelineEvents.map(event => ({
      ...event,
      parameters: event.parameters || []  // Ensure parameters is defined
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

      timelineEvents.push(...reportEvents);
    }

    // Sort by date (newest first)
    timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setAllEvents(timelineEvents);
  }, [reports, healthParameters]);

  // Computed values
  const eventAnalytics = useMemo(() => {
    return {
      totalEvents: filteredEvents.length,
      byType: filteredEvents.reduce((acc: any, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {}),
      completionRate: (filteredEvents.filter(e => e.status === 'completed').length / filteredEvents.length) * 100,
      trendsData: filteredEvents.reduce((acc: any, event) => {
        const month = new Date(event.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {})
    };
  }, [filteredEvents]);

  // Update timeline events when reports or health parameters change
  useEffect(() => {
    let updatedEvents = [...defaultTimelineEvents].map(event => ({
      ...event,
      parameters: event.parameters || []
    }));

    // Add new events from reports with intelligent analysis
    if (reports.length > 0) {
      const reportEvents = reports.map(report => {
        const reportContent = report.content?.data || {};
        const reportType = determineReportType(reportContent);
        const doctorInfo = extractDoctorInfo(reportContent);
        const testInfo = extractTestInfo(reportContent);

        // Create an appropriate title and description based on report type
        let title = '';
        let description = '';
        let type: 'test' | 'diagnosis' | 'treatment' | 'medication' | 'appointment' = 'test';

        switch (reportType) {
          case 'lab_test':
            title = `Lab Test: ${testInfo.name || 'Comprehensive Panel'}`;
            description = `Lab tests conducted${doctorInfo ? ` by ${doctorInfo.lab || 'the laboratory'}` : ''}. ${testInfo.parameters?.length ? `Includes ${testInfo.parameters.join(', ')}` : ''
              }`;
            type = 'test';
            break;

          case 'prescription':
            title = `Medical Prescription${doctorInfo ? ` from Dr. ${doctorInfo.name}` : ''}`;
            description = `Prescription for ${reportContent.medications?.map((med: any) => med.name).join(', ') || 'prescribed medications'
              }`;
            type = 'medication';
            break;

          case 'consultation':
            title = `Doctor's Consultation${doctorInfo ? ` with Dr. ${doctorInfo.name}` : ''}`;
            description = `${doctorInfo?.specialty ? `${doctorInfo.specialty} consultation` : 'Medical consultation'
              }${reportContent.diagnosis ? `: ${reportContent.diagnosis}` : ''}`;
            type = 'appointment';
            break;

          case 'treatment_plan':
            title = 'Treatment Plan Update';
            description = `${reportContent.treatment?.description || 'Updated treatment plan'
              }${doctorInfo ? ` prescribed by Dr. ${doctorInfo.name}` : ''}`;
            type = 'treatment';
            break;

          default:
            title = `Health Report: ${report.name}`;
            description = 'Medical report with updated health information';
            type = 'test';
        }

        return {
          id: `event-report-${report.id}`,
          date: report.date,
          title,
          description,
          type,
          parameters: healthParameters.filter(param =>
            reportContent.parameters?.some((p: any) =>
              p.name === param.name
            )
          ),
          status: 'completed' as const,
          highlight: true,
          metadata: {
            doctor: doctorInfo,
            testDetails: testInfo
          }
        };
      });

      updatedEvents = [...reportEvents, ...updatedEvents];
    }

    // Apply current filters
    let filtered = updatedEvents.map(event => ({
      ...event,
      parameters: event.parameters || []
    }));
    if (filterType) {
      filtered = filtered.filter(event => event.type === filterType);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setFilteredEvents(filtered);
  }, [reports, healthParameters, filterType, searchQuery]);

  // Reset page position on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-wrap justify-between items-end"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Health Timeline</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Track your health events and lab reports chronologically
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-niraiva-500"
              />
            </div>

            <div className="relative">
              <div className="flex gap-2">
                {[
                  { type: '', label: 'All', icon: 'grid' },
                  { type: 'test', label: 'Tests', icon: 'flask', color: 'blue' },
                  { type: 'diagnosis', label: 'Diagnoses', icon: 'stethoscope', color: 'purple' },
                  { type: 'treatment', label: 'Treatments', icon: 'pill', color: 'green' },
                  { type: 'medication', label: 'Medications', icon: 'prescription', color: 'yellow' },
                  { type: 'appointment', label: 'Appointments', icon: 'calendar', color: 'gray' }
                ].map(({ type, label, color }) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type || null)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filterType === type
                      ? `bg-${color}-100 text-${color}-700 dark:bg-${color}-900/30 dark:text-${color}-400`
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      } border border-gray-200 dark:border-gray-700`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-panel p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Events</h2>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-health-good rounded-full mr-2"></span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Completed</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-health-moderate rounded-full mr-2"></span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Pending</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {filteredEvents.length > 0 ? (
                  Object.entries(groupEventsByTime(filteredEvents)).map(([timeGroup, events]) => (
                    <div key={timeGroup} className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm py-2">
                        {timeGroup}
                      </h3>
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
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No events found. Try adjusting your filters.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ReportUploader />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-panel p-4"
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upcoming Events</h3>

              <div className="space-y-3">
                {filteredEvents
                  .filter(event => event.status === 'pending')
                  .map(event => (
                    <div key={event.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                      <div className="flex items-start mb-2">
                        <Calendar className="h-5 w-5 text-niraiva-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(event.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{event.description}</p>
                    </div>
                  ))}

                {filteredEvents.filter(event => event.status === 'pending').length === 0 && (
                  <div className="text-center py-4">
                    <Check className="h-8 w-8 text-health-good mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">No upcoming events</p>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-6"
            >
              {/* Health Events Summary */}
              <Card className="p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Health Events Summary</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Overall Progress</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.round(eventAnalytics.completionRate)}%
                      </span>
                    </div>
                    <Progress value={eventAnalytics.completionRate} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(eventAnalytics.byType).map(([type, count]) => (
                      <div key={type} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">{type}</div>
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">{count as number}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                    onClick={() => {/* Export logic */ }}
                  >
                    <Download className="h-4 w-4" />
                    Export Timeline
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                    onClick={() => {/* Share logic */ }}
                  >
                    <Share2 className="h-4 w-4" />
                    Share Report
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                    onClick={() => setShowAnalytics(true)}
                  >
                    <TrendingUp className="h-4 w-4" />
                    View Analytics
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                    onClick={() => {/* Calendar sync logic */ }}
                  >
                    <CalendarCheck className="h-4 w-4" />
                    Sync Calendar
                  </Button>
                </div>
              </Card>

              {/* Reminders & Follow-ups */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upcoming Follow-ups</h3>
                  <Button variant="ghost" size="sm">
                    <Bell className="h-4 w-4 mr-2" />
                    Add Reminder
                  </Button>
                </div>
                <div className="space-y-3">
                  {reminders.length > 0 ? (
                    reminders.map(reminder => (
                      <div key={reminder.id} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <AlertCircle className={`h-5 w-5 ${reminder.priority === 'high' ? 'text-red-500' :
                          reminder.priority === 'medium' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`} />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{reminder.title}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">{reminder.date}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-3">
                      No upcoming follow-ups
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6">
        <VoiceNavigation
          isListening={isListening}
          transcript={transcript}
          toggleListening={toggleListening}
        />
      </div>
    </div>
  );
};

export default Timeline;
