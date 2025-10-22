import React, { createContext, useState, useContext, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import {
  userProfile,
  healthParameters,
  chronicConditions,
  type UserProfile,
  type HealthParameter,
  type ChronicCondition
} from '@/utils/healthData';

// Define the structure for a report
export interface Report {
  id: string;
  name: string;
  type: string;
  date: string;
  content: any;
  file?: File | null;
}

type ReportContextType = {
  reports: Report[];
  addReport: (file: File) => Promise<void>;
  retryUpload: (id: string) => Promise<void>;
  removeReport: (id: string) => void;
  clearReports: () => void;
  isProcessing: boolean;
  uploadEndpoint: string;
  lastUpload?: {
    ok: boolean;
    status: number | null;
    url: string;
    message?: string;
    time: string;
  } | null;
  userProfile: UserProfile;
  healthParameters: HealthParameter[];
  chronicConditions: ChronicCondition[];
  updateHealthData: (data: Partial<{
    userProfile: Partial<UserProfile>;
    parameters: Partial<HealthParameter>[];
    conditions: Partial<ChronicCondition>[];
  }>) => void;
};

const ReportContext = createContext<ReportContextType>({
  reports: [],
  addReport: async () => { },
  retryUpload: async () => { },
  removeReport: () => { },
  clearReports: () => { },
  isProcessing: false,
  uploadEndpoint: 'http://localhost:5678/webhook/test',
  lastUpload: null,
  userProfile,
  healthParameters,
  chronicConditions,
  updateHealthData: () => { },
});

// Helper: convert File to data URL
async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Helper: load image from data URL
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

interface ReportProviderProps {
  children: ReactNode;
}

export const useReports = () => useContext(ReportContext);

export function ReportProvider({ children }: ReportProviderProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUpload, setLastUpload] = useState<ReportContextType['lastUpload']>(null);

  const defaultN8nWebhook = 'http://localhost:5678/webhook/test';
  const _uploadEndpoint = (import.meta.env.VITE_UPLOAD_PROXY as string) || 'http://localhost:4000/api/upload' || defaultN8nWebhook;
  console.debug('[ReportContext] using upload endpoint:', _uploadEndpoint);

  const [profileData, setProfileData] = useState<UserProfile>(userProfile);
  const [parameterData, setParameterData] = useState<HealthParameter[]>(healthParameters);
  const [conditionData, setConditionData] = useState<ChronicCondition[]>(chronicConditions);

  // Helper to send file to endpoint
  async function sendFileToEndpoint(file: File) {
    const form = new FormData();
    form.append('file', file, file.name);

    try {
      console.debug('[ReportContext] sending file to:', _uploadEndpoint, file.name);
      const resp = await fetch(_uploadEndpoint, { method: 'POST', body: form });
      const contentType = resp.headers.get('content-type') || '';
      const normalization = resp.headers.get('x-n8n-normalization') || null;

      let parsed: any = null;
      let type = 'text/plain';

      if (contentType.includes('application/json')) {
        try {
          parsed = await resp.json();
          type = 'application/json';
        } catch (e) {
          const txt = await resp.text();
          try { parsed = JSON.parse(txt); type = 'application/json'; } catch { parsed = txt; type = 'text/plain'; }
        }
      } else {
        parsed = await resp.text();
      }

      // If server returned an array (n8n items), try to normalize on client too
      if (Array.isArray(parsed) && parsed.length > 0) {
        const first = parsed[0];
        if (first && typeof first === 'object') {
          parsed = first.json || first;
        }
      }

      console.debug('[ReportContext] upload response:', { ok: resp.ok, status: resp.status, contentType, normalization, parsedSummary: typeof parsed === 'object' ? Object.keys(parsed).slice(0, 10) : String(parsed).slice(0, 200) });

      return { ok: resp.ok, status: resp.status, statusText: resp.statusText, content: parsed, type };
    } catch (err) {
      console.error('[ReportContext] upload error:', err);
      return { ok: false, status: null, statusText: (err as Error).message, content: null, type: 'error' };
    }
  }

  const updateHealthData = (data: Partial<{
    userProfile: Partial<UserProfile>;
    parameters: Partial<HealthParameter>[];
    conditions: Partial<ChronicCondition>[];
  }>) => {
    if (data.userProfile) {
      setProfileData(prev => {
        const updated = { ...prev };
        Object.entries(data.userProfile!).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            (updated as any)[key] = value;
          }
        });
        return updated;
      });
    }

    if (data.parameters) {
      setParameterData(prev => {
        const updated = [...prev];
        data.parameters!.forEach(param => {
          if (param.name) {
            const index = updated.findIndex(p =>
              p.name.toLowerCase() === param.name.toLowerCase()
            );
            if (index > -1) {
              updated[index] = { ...updated[index], ...param };
            } else {
              updated.push({
                id: `param-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                ...param,
                status: param.status || 'normal',
                timestamp: new Date().toISOString()
              } as HealthParameter);
            }
          }
        });
        return updated;
      });
    }

    if (data.conditions) {
      setConditionData(prev => {
        const updated = [...prev];
        data.conditions!.forEach(condition => {
          if (condition.name) {
            const index = updated.findIndex(c =>
              c.name.toLowerCase() === condition.name.toLowerCase()
            );
            const chronicCond: ChronicCondition = {
              id: `cond-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: condition.name,
              diagnosedDate: condition.diagnosedDate || new Date().toISOString().split('T')[0],
              severity: condition.severity || 'moderate',
              currentStatus: condition.currentStatus || 'controlled',
              relatedParameters: condition.relatedParameters || [],
              treatment: condition.treatment || '',
              notes: condition.notes || ''
            };
            if (index > -1) {
              updated[index] = { ...updated[index], ...chronicCond };
            } else {
              updated.push(chronicCond);
            }
          }
        });
        return updated;
      });
    }
  };

  const addReport = async (file: File): Promise<void> => {
    setIsProcessing(true);
    try {
      const id = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      let content: any = {};
      let type = file.type || '';

      const resp = await sendFileToEndpoint(file);
      if (resp.ok) {
        content = resp.content;
        type = resp.type;
      } else {
        // Local fallback processing
        if (file.type === 'application/json' || file.name.toLowerCase().endsWith('.json')) {
          const text = await file.text();
          try { content = JSON.parse(text); } catch { content = text; }
          type = 'application/json';
        } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          content = { pages: Math.floor(Math.random() * 10) + 1, fileSize: file.size };
        } else if (file.type.startsWith('image/') || /\.(png|jpe?g)$/i.test(file.name)) {
          try {
            const dataUrl = await fileToDataURL(file);
            const img = await loadImage(dataUrl);
            content = { width: img.width, height: img.height, fileSize: file.size };
            type = file.type || 'image';
          } catch {
            content = { message: 'Image file', fileName: file.name, fileSize: file.size };
          }
        } else {
          content = { message: 'Unprocessed file', fileName: file.name };
        }
      }

      const newReport: Report = {
        id,
        name: file.name,
        type,
        date: new Date().toISOString(),
        content,
        file,
      };

      // Update all health sections from uploaded file (be tolerant to different shapes)
      if (newReport.content && typeof newReport.content === 'object') {
        const raw = newReport.content || {};
        const data = raw.data && typeof raw.data === 'object' ? raw.data : raw;

        // PROFILE: prefer data.profile -> raw.profile -> defaults
        const profileFrom = (data && data.profile) || raw.profile || {};

        // MEDICATIONS: look in multiple locations and normalize shape
        const medsCandidate = Array.isArray(data.medications) ? data.medications :
          Array.isArray(raw.medications) ? raw.medications :
            Array.isArray(profileFrom.medications) ? profileFrom.medications : [];

        const normalizeMedication = (m: any) => {
          if (!m) return null;
          if (typeof m === 'string') {
            return { name: m, dosage: '', frequency: '', startDate: '' };
          }
          return {
            name: m.name || m.medication || m.drug || '',
            dosage: m.dosage || m.dose || m.amount || '',
            frequency: m.frequency || m.freq || m.schedule || '',
            startDate: m.startDate || m.started || m.start || ''
          };
        };

        const normalizedMeds = medsCandidate.map(normalizeMedication).filter(Boolean);

        // Merge profile data safely into state
        setProfileData(prev => {
          const baseDefaults = {
            id: null, name: null, age: null, gender: null,
            height: null, weight: null, bmi: null, bloodType: null,
            emergencyContact: null, allergies: [], medications: []
          } as any;

          const base = { ...baseDefaults, ...(profileFrom || {}) };
          if (normalizedMeds.length > 0) base.medications = normalizedMeds;
          return { ...prev, ...base };
        });

        // PARAMETERS: accept different placements
        const paramsCandidate = Array.isArray(data.parameters) ? data.parameters : (Array.isArray(raw.parameters) ? raw.parameters : []);
        setParameterData(paramsCandidate);

        // CONDITIONS: accept multiple keys
        const chronicConds = Array.isArray(data.conditions) ? data.conditions : (Array.isArray(raw.conditions) ? raw.conditions : (Array.isArray(data.chronicConditions) ? data.chronicConditions : (Array.isArray(raw.chronicConditions) ? raw.chronicConditions : [])));
        setConditionData(chronicConds);
      }

      setReports(prev => [...prev, newReport]);
      setLastUpload({
        ok: resp.ok,
        status: resp.status,
        url: _uploadEndpoint,
        message: resp.statusText,
        time: new Date().toISOString()
      });

      toast({
        title: "Report Processed",
        description: `${file.name} has been successfully processed.`,
      });
    } catch (error) {
      console.error("Error processing report:", error);
      toast({
        title: "Processing Failed",
        description: `Failed to process ${file.name}.`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeReport = (id: string) => {
    setReports(reports.filter(report => report.id !== id));
    toast({
      description: "Report removed successfully.",
    });
  };

  const clearReports = () => {
    setReports([]);
    toast({
      description: "All reports cleared.",
    });
  };

  const retryUpload = async (id: string) => {
    const report = reports.find(r => r.id === id);
    if (!report?.file) {
      toast({
        title: 'Retry Failed',
        description: 'No original file available to retry.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const resp = await sendFileToEndpoint(report.file);
      if (resp.ok) {
        setReports(prev => prev.map(r =>
          r.id === id ? { ...r, content: resp.content, type: resp.type } : r
        ));
        toast({
          title: 'Retry Succeeded',
          description: `${report.name} uploaded successfully.`
        });
      } else {
        toast({
          title: 'Retry Failed',
          description: `Upload failed: ${resp.statusText}`,
          variant: 'destructive'
        });
      }
      setLastUpload({
        ok: resp.ok,
        status: resp.status,
        url: _uploadEndpoint,
        message: resp.statusText,
        time: new Date().toISOString()
      });
    } catch (err) {
      toast({
        title: 'Retry Failed',
        description: (err as Error).message,
        variant: 'destructive'
      });
      setLastUpload({
        ok: false,
        status: null,
        url: _uploadEndpoint,
        message: (err as Error).message,
        time: new Date().toISOString()
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ReportContext.Provider value={{
      reports,
      addReport,
      retryUpload,
      removeReport,
      clearReports,
      isProcessing,
      uploadEndpoint: _uploadEndpoint,
      lastUpload,
      userProfile: profileData,
      healthParameters: parameterData,
      chronicConditions: conditionData,
      updateHealthData,
    }}>
      {children}
    </ReportContext.Provider>
  );
}