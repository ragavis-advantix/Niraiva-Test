
import { motion } from 'framer-motion';
import { HealthParameter, getStatusClass, getChangeIcon } from '@/utils/healthData';
import { cn } from '@/lib/utils';

interface HealthCardProps {
  parameter: HealthParameter;
  className?: string;
}

export function HealthCard({ parameter, className }: HealthCardProps) {
  const statusClass = getStatusClass(parameter.status);
  const changeIcon = getChangeIcon(parameter.recentChange);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "glass-card p-4 flex flex-col hover-lift",
        className
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{parameter.name}</h3>
        <span className={`health-tag ${statusClass}`}>
          {parameter.status}
        </span>
      </div>
      
      <div className="flex items-end mt-2 space-x-2">
        <span className="text-3xl font-semibold text-gray-900 dark:text-white">
          {parameter.value}
        </span>
        {parameter.unit && (
          <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {parameter.unit}
          </span>
        )}
      </div>
      
      {parameter.recentChange && (
        <div className="mt-2 text-sm flex items-center">
          <span className={cn(
            "flex items-center",
            parameter.recentChange === 'improved' ? 'text-health-good' : 
            parameter.recentChange === 'declined' ? 'text-health-poor' : 
            'text-gray-500 dark:text-gray-400'
          )}>
            {changeIcon} {parameter.recentChange}
          </span>
        </div>
      )}
      
      <div className="mt-auto pt-2 text-xs text-gray-500 dark:text-gray-400">
        Last updated: {new Date(parameter.timestamp).toLocaleDateString()}
      </div>
    </motion.div>
  );
}
