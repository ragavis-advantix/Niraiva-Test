
import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { VoiceNavigation } from '@/components/VoiceNavigation';
import { toast } from '@/hooks/use-toast';

interface VoiceNavigationContextType {
  isListening: boolean;
  toggleListening: () => void;
  transcript: string;
}

const VoiceNavigationContext = createContext<VoiceNavigationContextType>({
  isListening: false,
  toggleListening: () => {},
  transcript: '',
});

export const useVoiceNavigation = () => useContext(VoiceNavigationContext);

interface VoiceNavigationProviderProps {
  children: ReactNode;
}

export function VoiceNavigationProvider({ children }: VoiceNavigationProviderProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Define all possible voice commands for the application
  const commands = [
    { trigger: 'go to dashboard', action: () => navigate('/dashboard') },
    { trigger: 'dashboard', action: () => navigate('/dashboard') },
    { trigger: 'show dashboard', action: () => navigate('/dashboard') },
    
    { trigger: 'go to timeline', action: () => navigate('/timeline') },
    { trigger: 'timeline', action: () => navigate('/timeline') },
    { trigger: 'show timeline', action: () => navigate('/timeline') },
    
    { trigger: 'go to diagnostic', action: () => navigate('/diagnostic') },
    { trigger: 'diagnostics', action: () => navigate('/diagnostic') },
    { trigger: 'diagnostic', action: () => navigate('/diagnostic') },
    { trigger: 'show diagnostic', action: () => navigate('/diagnostic') },
    
    { trigger: 'go home', action: () => navigate('/') },
    { trigger: 'home', action: () => navigate('/') },
    { trigger: 'show home', action: () => navigate('/') },
    
    { trigger: 'upload report', action: () => toast({ 
      title: "Feature Coming Soon", 
      description: "Report upload via voice command will be available in a future update." 
    })},
    
    // Page-specific commands
    // For diagnostic page
    { trigger: 'zoom in', action: () => {
      if (location.pathname === '/diagnostic') {
        const zoomInButton = document.querySelector('[aria-label="Zoom in"]') as HTMLButtonElement;
        if (zoomInButton) zoomInButton.click();
      }
    }},
    { trigger: 'zoom out', action: () => {
      if (location.pathname === '/diagnostic') {
        const zoomOutButton = document.querySelector('[aria-label="Zoom out"]') as HTMLButtonElement;
        if (zoomOutButton) zoomOutButton.click();
      }
    }},
    { trigger: 'reset view', action: () => {
      if (location.pathname === '/diagnostic') {
        const resetButton = document.querySelector('[aria-label="Reset view"]') as HTMLButtonElement;
        if (resetButton) resetButton.click();
      }
    }},
    
    // General commands
    { trigger: 'scroll down', action: () => window.scrollBy({ top: 300, behavior: 'smooth' }) },
    { trigger: 'scroll up', action: () => window.scrollBy({ top: -300, behavior: 'smooth' }) },
    { trigger: 'go back', action: () => window.history.back() }
  ];

  // Process voice commands
  const processCommand = (text: string) => {
    const lowerText = text.toLowerCase();
    console.log('Processing command:', lowerText);
    
    for (const command of commands) {
      if (lowerText.includes(command.trigger)) {
        toast({
          title: "Voice Command Detected",
          description: `Executing: "${command.trigger}"`,
        });
        command.action();
        return true;
      }
    }
    
    return false;
  };

  // Initialize speech recognition
  useEffect(() => {
    // Initialize the SpeechRecognition API with proper browser prefixes
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => {
        console.log('Voice recognition started');
        setIsListening(true);
      };
      
      recognitionRef.current.onend = () => {
        console.log('Voice recognition ended');
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Voice recognition error:', event.error);
        toast({
          title: "Voice Recognition Error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive"
        });
        setIsListening(false);
      };
      
      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
        
        // Process final results
        if (event.results[current].isFinal) {
          processCommand(transcriptText);
        }
      };
    } else {
      console.error('Speech recognition not supported');
    }
    
    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [navigate, location.pathname]);

  // Toggle voice recognition
  const toggleListening = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
        toast({
          title: "Voice Navigation Active",
          description: "Try saying 'go to dashboard' or 'zoom in' on diagnostic page",
        });
      }
    } else {
      toast({
        title: "Browser Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <VoiceNavigationContext.Provider value={{ isListening, toggleListening, transcript }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50">
        <VoiceNavigation 
          className="shadow-lg" 
          isListening={isListening} 
          transcript={transcript}
          toggleListening={toggleListening} 
        />
      </div>
    </VoiceNavigationContext.Provider>
  );
}
