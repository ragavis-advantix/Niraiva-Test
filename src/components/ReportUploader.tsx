
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, X, Check, FileText, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useReports } from '@/contexts/ReportContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function ReportUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const { reports, addReport, removeReport, isProcessing } = useReports();

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  // Process files
  const handleFiles = (files: File[]) => {
    // Filter for PDFs, JSONs, and images (png/jpg/jpeg)
    const validFiles = files.filter(file => {
      const lower = file.name.toLowerCase();
      return (
        file.type === 'application/pdf' ||
        file.type === 'application/json' ||
        file.type === 'image/png' ||
        file.type === 'image/jpeg' ||
        lower.endsWith('.json') ||
        lower.endsWith('.png') ||
        lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg')
      );
    });

    if (validFiles.length === 0) {
      toast({
        title: "Invalid file format",
        description: "Please upload PDF, JSON, PNG, or JPEG files only.",
        variant: "destructive"
      });
      return;
    }

    // Add to pending files
    // Immediately process each valid file and clear pendingFiles after
    validFiles.forEach(async (file) => {
      await addReport(file);
    });
    setPendingFiles([]);

    // Show success toast
    toast({
      title: "Files Added",
      description: `${validFiles.length} file(s) ready for upload.`,
    });
  };

  // Remove a pending file
  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload files to the context
  const uploadFiles = async () => {
    if (pendingFiles.length === 0) return;

    for (const file of pendingFiles) {
      await addReport(file);
    }

    setPendingFiles([]);
  };

  return (
    <div className="glass-panel p-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upload Health Reports</h3>
      {/* endpoint and last upload intentionally hidden for privacy */}

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging
          ? 'border-niraiva-500 bg-niraiva-50 dark:bg-niraiva-900/10'
          : 'border-gray-300 dark:border-gray-700'
          }`}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          Drag and drop your health reports here
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Supported formats: PDF, JSON, PNG, JPEG
        </p>

        <label className="inline-block">
          <span className="cursor-pointer px-4 py-2 bg-niraiva-100 text-niraiva-700 dark:bg-niraiva-900/30 dark:text-niraiva-400 rounded-lg hover:bg-niraiva-200 dark:hover:bg-niraiva-900/50 transition-colors">
            Browse Files
          </span>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.json,.png,.jpg,.jpeg"
            multiple
            onChange={handleFileInputChange}
          />
        </label>
      </div>

      {pendingFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Ready to Upload:</h4>
          <ul className="space-y-2 max-h-[200px] overflow-y-auto">
            {pendingFiles.map((file, index) => (
              <li key={`pending-${index}`} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                    {file.name}
                  </span>
                </div>
                <button
                  onClick={() => removePendingFile(index)}
                  className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={uploadFiles}
            disabled={isProcessing}
            className={`mt-4 w-full py-2 px-4 rounded-lg flex items-center justify-center transition-colors ${isProcessing
              ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              : 'bg-niraiva-600 text-white hover:bg-niraiva-700'
              }`}
          >
            {isProcessing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Upload className="h-4 w-4" />
                </motion.div>
                Processing...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Enter
              </>
            )}
          </motion.button>
        </div>
      )}

      {reports.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Processed Reports:</h4>
          <ul className="space-y-2 max-h-[200px] overflow-y-auto">
            {reports.map((report) => (
              <li key={report.id} className="flex items-center justify-between p-2 bg-niraiva-50 dark:bg-niraiva-900/10 rounded">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-niraiva-600 mr-2" />
                  <div className="truncate max-w-[200px]">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {report.name}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(report.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        onClick={() => setSelectedReport(report.id)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{report.name} - Response Content</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(report.content, null, 2)}
                        </pre>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <button
                    onClick={() => removeReport(report.id)}
                    className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
