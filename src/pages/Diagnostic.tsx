
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Info, FileText } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { DiagnosticMap } from '@/components/DiagnosticMap';
import { ReportUploader } from '@/components/ReportUploader';
import { useReports } from '@/contexts/ReportContext';
import {
  generateUserSpecificNodes,
  HealthParameter,
  ChronicCondition
} from '@/utils/healthData';

const Diagnostic = () => {
  const { userProfile, chronicConditions, reports } = useReports();
  const defaultCondition: ChronicCondition = chronicConditions.length > 0 ? chronicConditions[0] : {
    id: '',
    name: '',
    diagnosedDate: '',
    severity: 'moderate' as const,
    currentStatus: 'controlled' as const,
    relatedParameters: [],
    treatment: '',
    notes: ''
  };
  const [selectedCondition, setSelectedCondition] = useState(defaultCondition);
  const [userSpecificNodes, setUserSpecificNodes] = useState<any[]>([]);

  // Reset page position on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Generate user-specific diagnostic nodes when condition or reports change
  useEffect(() => {
    if (!selectedCondition) return;
    // Generate base nodes for the diagnostic pathway
    const nodes = generateUserSpecificNodes(userProfile, selectedCondition);
    // Enhance nodes based on latest report data
    if (reports.length > 0) {
      const latestReport = reports[reports.length - 1];

      // Flexible extraction of parameters from a few common shapes
      const reportParams: any[] = (
        latestReport.content?.data?.parameters ||
        latestReport.content?.parameters ||
        latestReport.content?.data?.observations ||
        []
      );

      const normalize = (s: any) => typeof s === 'string' ? s.replace(/[^a-z0-9]/gi, '').toLowerCase() : '';

      const enhancedNodes = nodes.map(node => {
        if (Array.isArray(reportParams) && reportParams.length > 0 && Array.isArray(node.parameters) && node.parameters.length > 0) {
          const updatedParams = node.parameters.map((param: any) => {
            const paramNameNorm = normalize(param.name || param.id || '');

            // Try to find best matching report param using several common fields
            const reportParam = reportParams.find((p: any) => {
              const candidates = [p.name, p.display, p.label, p.parameter, p.code, p.id];
              return candidates.some((c: any) => c && normalize(c) === paramNameNorm) ||
                // fallback: normalized value contains keywords
                (typeof p.name === 'string' && normalize(p.name).includes(paramNameNorm)) ||
                (typeof p.code === 'string' && normalize(p.code).includes(paramNameNorm));
            });

            if (reportParam) {
              return {
                ...param,
                // prefer explicit value fields from the report
                value: reportParam.value ?? reportParam.result ?? reportParam.measurement ?? param.value,
                unit: reportParam.unit ?? reportParam.uom ?? param.unit,
                status: reportParam.status || param.status,
                timestamp: reportParam.timestamp || reportParam.time || new Date().toISOString(),
                // keep original props while merging any extra metadata
                _source: reportParam
              };
            }
            return param;
          });

          return {
            ...node,
            parameters: updatedParams,
            description: `Updated based on latest report from ${new Date(latestReport.date).toLocaleDateString()}`
          };
        }
        return node;
      });

      setUserSpecificNodes(enhancedNodes);
    } else {
      setUserSpecificNodes(nodes);
    }
  }, [selectedCondition, reports, userProfile]);

  // Keep selectedCondition in sync with context updates.
  // This ensures that when `chronicConditions` changes (e.g. after an upload),
  // the page reflects updated fields and objects rather than stale references.
  useEffect(() => {
    if (!selectedCondition && chronicConditions.length > 0) {
      setSelectedCondition(chronicConditions[0]);
      return;
    }

    if (selectedCondition) {
      const updated = chronicConditions.find(c => c.id === selectedCondition?.id);
      if (updated) {
        // replace reference so updates to the condition (severity, notes, etc.) are visible
        setSelectedCondition(updated);
      }
    }
  }, [chronicConditions]);

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Diagnostic Pathway</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Interactive visualization of treatment and diagnostic pathways for {userProfile.name}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-panel p-6 h-full"
            >
              <div className="flex flex-wrap items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Condition Pathway</h2>

                <div className="flex flex-wrap mt-2 sm:mt-0">
                  {chronicConditions.map((condition) => (
                    <button
                      key={condition.id}
                      onClick={() => setSelectedCondition(condition)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors mr-2 mb-2 sm:mb-0 ${selectedCondition?.id === condition.id
                        ? 'bg-niraiva-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                      {condition.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4 glass-card p-4 flex items-start">
                <Info className="h-5 w-5 text-niraiva-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">About this view</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    This interactive pathway diagram visualizes the clinical decision process for {selectedCondition ? selectedCondition.name : '--'}.
                    Each node represents a key diagnostic or treatment step. You can zoom using pinch gestures or the mouse wheel at any point,
                    and drag to pan around the diagram. Click on any node to see detailed information.
                  </p>
                </div>
              </div>

              {reports.length > 0 && (
                <div className="mb-4 glass-card p-4 flex items-start bg-niraiva-50 dark:bg-niraiva-900/10">
                  <FileText className="h-5 w-5 text-niraiva-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">Enhanced with Reports</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      The pathway visualization has been enhanced with data from {reports.length} uploaded health report(s).
                    </p>
                  </div>
                </div>
              )}

              <DiagnosticMap nodes={userSpecificNodes} className="mt-6" />
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <ReportUploader />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-panel p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Patient Summary</h2>

              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Patient Name</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {userProfile.name}
                  </span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Age</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {userProfile.age} years
                  </span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Diagnosis Date</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedCondition && selectedCondition.diagnosedDate ? new Date(selectedCondition.diagnosedDate).toLocaleDateString('en-IN') : '--'}
                  </span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Current Severity</span>
                  <span className={`font-medium ${selectedCondition && selectedCondition.severity === 'mild' ? 'text-health-good' :
                    selectedCondition && selectedCondition.severity === 'moderate' ? 'text-health-moderate' :
                      'text-health-poor'
                    }`}>
                    {selectedCondition && selectedCondition.severity ? selectedCondition.severity.charAt(0).toUpperCase() + selectedCondition.severity.slice(1) : '--'}
                  </span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Status</span>
                  <span className={`font-medium ${selectedCondition && selectedCondition.currentStatus === 'controlled' ? 'text-health-good' :
                    selectedCondition && selectedCondition.currentStatus === 'in-remission' ? 'text-health-moderate' :
                      'text-health-poor'
                    }`}>
                    {selectedCondition && selectedCondition.currentStatus ? selectedCondition.currentStatus.charAt(0).toUpperCase() + selectedCondition.currentStatus.slice(1) : '--'}
                  </span>
                </div>
              </div>

              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Current Treatment</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {selectedCondition?.treatment ? (
                    <>{selectedCondition.treatment}</>
                  ) : selectedCondition?.id === 'cond-001' ? (
                    <>Current treatment involves <span className="font-medium">Metformin 500mg twice daily</span> along with lifestyle modifications including diet control and regular exercise.</>
                  ) : selectedCondition?.id === 'cond-002' ? (
                    <>Currently prescribed <span className="font-medium">Lisinopril 10mg once daily</span> with regular blood pressure monitoring and sodium-restricted diet.</>
                  ) : (
                    <>Managing with <span className="font-medium">Atorvastatin 20mg daily</span> alongside dietary modifications focused on reducing saturated fat intake.</>
                  )}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Key Clinical Notes</h3>

                <div className="space-y-3">
                  <div className="p-3 bg-niraiva-50 dark:bg-niraiva-900/10 rounded-lg border border-niraiva-100 dark:border-niraiva-900/20">
                    <div className="flex items-start">
                      <Activity className="h-5 w-5 text-niraiva-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">Recent Progress</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          {selectedCondition?.notes ? (
                            <>{selectedCondition.notes}</>
                          ) : selectedCondition && selectedCondition.id === 'cond-001' ? (
                            <>HbA1c decreased from 7.8% at diagnosis to 6.2% currently, indicating good glycemic control.</>
                          ) : selectedCondition?.id === 'cond-002' ? (
                            <>Blood pressure reduced from 150/95 mmHg to 128/82 mmHg with current regimen.</>
                          ) : (
                            <>LDL cholesterol decreased from 165 mg/dL to 118 mg/dL since treatment initiation.</>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-niraiva-50 dark:bg-niraiva-900/10 rounded-lg border border-niraiva-100 dark:border-niraiva-900/20">
                    <div className="flex items-start">
                      <Activity className="h-5 w-5 text-niraiva-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">Lifestyle Impact</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          {selectedCondition?.id === 'cond-001' ? (
                            <>Weight reduction of 5kg and improved diet have contributed significantly to better glycemic control.</>
                          ) : selectedCondition?.id === 'cond-002' ? (
                            <>Sodium restriction and regular exercise have supported pharmacological treatment.</>
                          ) : (
                            <>Adoption of Mediterranean diet principles has improved overall lipid profile.</>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {reports.length > 0 ? (
                    <div className="p-3 bg-niraiva-50 dark:bg-niraiva-900/10 rounded-lg border border-niraiva-100 dark:border-niraiva-900/20 animate-pulse">
                      <div className="flex items-start">
                        <Activity className="h-5 w-5 text-niraiva-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">Report Analysis</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                            Analysis of {reports.length} uploaded report(s) suggests {selectedCondition?.severity === 'mild' ? 'continued improvement' : 'treatment adjustment may be beneficial'}. Detailed clinical review recommended.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-niraiva-50 dark:bg-niraiva-900/10 rounded-lg border border-niraiva-100 dark:border-niraiva-900/20">
                      <div className="flex items-start">
                        <Activity className="h-5 w-5 text-niraiva-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">Next Steps</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                            {selectedCondition?.id === 'cond-001' ? (
                              <>Scheduled for annual diabetic retinopathy screening in next 2 months.</>
                            ) : selectedCondition?.id === 'cond-002' ? (
                              <>Plan to assess renal function in upcoming visit to evaluate medication dosing.</>
                            ) : (
                              <>Consider additional therapy if LDL target not achieved in 3 months.</>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {reports.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-panel p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Health Parameter Trends</h2>

              <div className="space-y-8">
                {selectedCondition?.id === 'cond-001' ? (
                  <>
                    {/* HbA1c Trend for Diabetes */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">HbA1c (%)</h3>
                        <span className="text-sm text-health-good">Improving</span>
                      </div>

                      <div className="h-[100px] relative mb-2">
                        <div className="absolute inset-0">
                          <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="hba1cGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
                              </linearGradient>
                            </defs>

                            <path
                              d="M0,20 L100,25 L200,30 L300,40 L400,45 L500,50 L500,100 L0,100 Z"
                              fill="url(#hba1cGradient)"
                            />

                            <path
                              d="M0,20 L100,25 L200,30 L300,40 L400,45 L500,50"
                              stroke="#0EA5E9"
                              strokeWidth="2"
                              fill="none"
                            />

                            <circle cx="0" cy="20" r="4" fill="#0EA5E9" />
                            <circle cx="100" cy="25" r="4" fill="#0EA5E9" />
                            <circle cx="200" cy="30" r="4" fill="#0EA5E9" />
                            <circle cx="300" cy="40" r="4" fill="#0EA5E9" />
                            <circle cx="400" cy="45" r="4" fill="#0EA5E9" />
                            <circle cx="500" cy="50" r="4" fill="#0EA5E9" />
                          </svg>
                        </div>
                      </div>

                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Mar 2020</span>
                        <span>Jan 2023</span>
                      </div>

                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        HbA1c decreased from <span className="font-medium text-health-poor">7.8%</span> to <span className="font-medium text-health-moderate">6.2%</span> over 3 years
                      </div>
                    </div>
                  </>
                ) : selectedCondition?.id === 'cond-002' ? (
                  <>
                    {/* Blood Pressure Trend for Hypertension */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">Systolic BP (mmHg)</h3>
                        <span className="text-sm text-health-good">Improving</span>
                      </div>

                      <div className="h-[100px] relative mb-2">
                        <div className="absolute inset-0">
                          <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="bpGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#F97316" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
                              </linearGradient>
                            </defs>

                            <path
                              d="M0,10 L100,20 L200,35 L300,45 L400,60 L500,65 L500,100 L0,100 Z"
                              fill="url(#bpGradient)"
                            />

                            <path
                              d="M0,10 L100,20 L200,35 L300,45 L400,60 L500,65"
                              stroke="#F97316"
                              strokeWidth="2"
                              fill="none"
                            />

                            <circle cx="0" cy="10" r="4" fill="#F97316" />
                            <circle cx="100" cy="20" r="4" fill="#F97316" />
                            <circle cx="200" cy="35" r="4" fill="#F97316" />
                            <circle cx="300" cy="45" r="4" fill="#F97316" />
                            <circle cx="400" cy="60" r="4" fill="#F97316" />
                            <circle cx="500" cy="65" r="4" fill="#F97316" />
                          </svg>
                        </div>
                      </div>

                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Nov 2019</span>
                        <span>Jan 2023</span>
                      </div>

                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        Systolic BP decreased from <span className="font-medium text-health-poor">150 mmHg</span> to <span className="font-medium text-health-good">128 mmHg</span> with treatment
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* LDL Trend for Hyperlipidemia */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">LDL Cholesterol (mg/dL)</h3>
                        <span className="text-sm text-health-good">Improving</span>
                      </div>

                      <div className="h-[100px] relative mb-2">
                        <div className="absolute inset-0">
                          <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="ldlGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                              </linearGradient>
                            </defs>

                            <path
                              d="M0,15 L100,25 L200,40 L300,55 L400,60 L500,70 L500,100 L0,100 Z"
                              fill="url(#ldlGradient)"
                            />

                            <path
                              d="M0,15 L100,25 L200,40 L300,55 L400,60 L500,70"
                              stroke="#8B5CF6"
                              strokeWidth="2"
                              fill="none"
                            />

                            <circle cx="0" cy="15" r="4" fill="#8B5CF6" />
                            <circle cx="100" cy="25" r="4" fill="#8B5CF6" />
                            <circle cx="200" cy="40" r="4" fill="#8B5CF6" />
                            <circle cx="300" cy="55" r="4" fill="#8B5CF6" />
                            <circle cx="400" cy="60" r="4" fill="#8B5CF6" />
                            <circle cx="500" cy="70" r="4" fill="#8B5CF6" />
                          </svg>
                        </div>
                      </div>

                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>May 2021</span>
                        <span>Jan 2023</span>
                      </div>

                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        LDL decreased from <span className="font-medium text-health-poor">165 mg/dL</span> to <span className="font-medium text-health-moderate">118 mg/dL</span> with statin therapy
                      </div>
                    </div>
                  </>
                )}

                {/* Weight Trend for all conditions */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">Weight (kg)</h3>
                    <span className="text-sm text-health-good">Improving</span>
                  </div>

                  <div className="h-[100px] relative mb-2">
                    <div className="absolute inset-0">
                      <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="weightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                          </linearGradient>
                        </defs>

                        <path
                          d="M0,30 L100,40 L200,50 L300,55 L400,65 L500,70 L500,100 L0,100 Z"
                          fill="url(#weightGradient)"
                        />

                        <path
                          d="M0,30 L100,40 L200,50 L300,55 L400,65 L500,70"
                          stroke="#10B981"
                          strokeWidth="2"
                          fill="none"
                        />

                        <circle cx="0" cy="30" r="4" fill="#10B981" />
                        <circle cx="100" cy="40" r="4" fill="#10B981" />
                        <circle cx="200" cy="50" r="4" fill="#10B981" />
                        <circle cx="300" cy="55" r="4" fill="#10B981" />
                        <circle cx="400" cy="65" r="4" fill="#10B981" />
                        <circle cx="500" cy="70" r="4" fill="#10B981" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Mar 2020</span>
                    <span>Jan 2023</span>
                  </div>

                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Weight decreased from <span className="font-medium text-health-moderate">83 kg</span> to <span className="font-medium text-health-good">78 kg</span> over 3 years
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Diagnostic;
