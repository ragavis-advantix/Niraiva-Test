
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { VoiceNavigationProvider } from "@/components/VoiceNavigationProvider";
import { ReportProvider } from "@/contexts/ReportContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Timeline from "./pages/Timeline";
import Diagnostic from "./pages/Diagnostic";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ReportProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <VoiceNavigationProvider>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/timeline" element={<Timeline />} />
                <Route path="/diagnostic" element={<Diagnostic />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </VoiceNavigationProvider>
        </BrowserRouter>
      </ReportProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
