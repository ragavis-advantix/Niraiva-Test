
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TimelineEvent as TimelineEventType } from '@/utils/healthData';
import { HealthCard } from '@/components/HealthCard';
import { cn } from '@/lib/utils';

interface TimelineEventProps {
  event: TimelineEventType;
  isLast?: boolean;
}

export function TimelineEvent({ event, isLast = false }: TimelineEventProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  const getEventTypeColor = () => {
    switch (event.type) {
      case 'test':
        return 'border-blue-400 bg-blue-100 dark:bg-blue-900/30';
      case 'diagnosis':
        return 'border-purple-400 bg-purple-100 dark:bg-purple-900/30';
      case 'treatment':
        return 'border-green-400 bg-green-100 dark:bg-green-900/30';
      case 'medication':
        return 'border-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'appointment':
        return 'border-gray-400 bg-gray-100 dark:bg-gray-900/30';
      default:
        return 'border-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };
  
  const getEventStatusColor = () => {
    switch (event.status) {
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'missed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };
  
  return (
    <div className={cn("relative pl-8", !isLast && "pb-8")}>
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
      )}
      
      {/* Event dot */}
      <div className={cn(
        "absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center",
        getEventTypeColor(),
        event.highlight ? "ring-2 ring-niraiva-500 ring-offset-2" : ""
      )}>
        <span className="text-xs font-medium">
          {event.type.charAt(0).toUpperCase()}
        </span>
      </div>
      
      {/* Event card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "glass-card p-4 hover-lift",
          event.highlight ? "border-niraiva-400" : ""
        )}
      >
        <div className="flex flex-wrap items-start justify-between mb-2">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(event.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{event.title}</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={cn(
              "text-sm font-medium",
              getEventStatusColor()
            )}>
              {event.status}
            </span>
            
            <span className={cn(
              "inline-block px-2 py-1 text-xs rounded-full",
              getEventTypeColor()
            )}>
              {event.type}
            </span>
          </div>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300">{event.description}</p>
        
        {(event.parameters && event.parameters.length > 0) && (
          <button
            onClick={toggleExpanded}
            className="mt-2 flex items-center text-sm text-niraiva-600 hover:text-niraiva-700 transition-colors"
          >
            {isExpanded ? (
              <>Hide details <ChevronUp className="ml-1 h-4 w-4" /></>
            ) : (
              <>Show details <ChevronDown className="ml-1 h-4 w-4" /></>
            )}
          </button>
        )}
        
        {isExpanded && event.parameters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {event.parameters.map((parameter) => (
              <HealthCard 
                key={parameter.id} 
                parameter={parameter}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
