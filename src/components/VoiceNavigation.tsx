
import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceNavigationProps {
  className?: string;
  isListening: boolean;
  transcript: string;
  toggleListening: () => void;
}

export function VoiceNavigation({ className, isListening, transcript, toggleListening }: VoiceNavigationProps) {
  return (
    <div className={className}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={toggleListening}
        className={`rounded-full p-3 flex items-center justify-center ${
          isListening 
            ? 'bg-niraiva-600 text-white' 
            : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
        } transition-all duration-300 shadow-md hover:shadow-lg`}
        aria-label={isListening ? 'Stop voice navigation' : 'Start voice navigation'}
      >
        {isListening ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </motion.button>
      
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-2 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg text-sm text-center min-w-[200px]"
          >
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Listening...</div>
            <div className="flex justify-center space-x-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: ["4px", "16px", "4px"],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-1 bg-niraiva-500 rounded-full"
                />
              ))}
            </div>
            {transcript && (
              <div className="mt-1 text-xs font-medium text-gray-700 dark:text-gray-300 max-w-[180px] truncate">
                "{transcript}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
