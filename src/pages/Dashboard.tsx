
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { VoiceNavigation } from '@/components/VoiceNavigation';
import { useVoiceNavigation } from '@/components/VoiceNavigationProvider';
import { ReportUploader } from '@/components/ReportUploader';
import { HealthCard } from '@/components/HealthCard';
import { useReports } from '@/contexts/ReportContext';

const Dashboard = () => {
  const { isListening, toggleListening, transcript } = useVoiceNavigation();
  const { userProfile, healthParameters, chronicConditions } = useReports();

  // Animate in content on page load
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
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Health Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            View and manage your health information
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card p-6 mb-6"
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Profile Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                    <div className="text-lg text-gray-900 dark:text-white">{userProfile.name}</div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Age & Gender</label>
                    <div className="text-lg text-gray-900 dark:text-white">{userProfile.age} years, {userProfile.gender}</div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Blood Type</label>
                    <div className="text-lg text-gray-900 dark:text-white">{userProfile.bloodType}</div>
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Height & Weight</label>
                    <div className="text-lg text-gray-900 dark:text-white">
                      {userProfile.height && userProfile.height.value != null ? userProfile.height.value : '--'} {userProfile.height && userProfile.height.unit ? userProfile.height.unit : ''}, {userProfile.weight && userProfile.weight.value != null ? userProfile.weight.value : '--'} {userProfile.weight && userProfile.weight.unit ? userProfile.weight.unit : ''}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">BMI</label>
                    <div className="text-lg text-gray-900 dark:text-white">{typeof userProfile.bmi === 'number' ? userProfile.bmi.toFixed(1) : '--'}</div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Emergency Contact</label>
                    <div className="text-lg text-gray-900 dark:text-white">{userProfile.emergencyContact}</div>
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Allergies</label>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(userProfile.allergies) ? userProfile.allergies : []).map((allergy, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full text-sm"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Current Medications</h2>

              <div className="space-y-4">
                {(Array.isArray(userProfile.medications) ? userProfile.medications : []).map((medication, index) => (
                  <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-wrap justify-between">
                      <div className="mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">{medication.name}</span>
                      </div>
                      <div className="text-sm text-niraiva-600 dark:text-niraiva-400">
                        Since {medication.startDate ? new Date(medication.startDate).toLocaleDateString() : '--'}
                      </div>
                    </div>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400 mr-3">{medication.dosage}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{medication.frequency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <ReportUploader />
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Key Health Parameters</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Array.isArray(healthParameters) ? healthParameters : []).slice(0, 4).map((parameter) => (
              <HealthCard key={parameter.id} parameter={parameter} />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Chronic Conditions</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Array.isArray(chronicConditions) ? chronicConditions : []).map((condition) => (
              <div
                key={condition.id}
                className="glass-card p-4 hover-lift"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{condition.name}</h3>
                  <span className={`health-tag ${condition.severity === 'mild' ? 'health-tag-good' :
                    condition.severity === 'moderate' ? 'health-tag-moderate' :
                      'health-tag-poor'
                    }`}>
                    {condition.severity}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <span>Diagnosed: {condition.diagnosedDate ? new Date(condition.diagnosedDate).toLocaleDateString() : '--'}</span>
                </div>

                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium mr-2">Current Status:</span>
                  <span className={`text-sm ${condition.currentStatus === 'controlled' ? 'text-health-good' :
                    condition.currentStatus === 'in-remission' ? 'text-health-moderate' :
                      'text-health-poor'
                    }`}>
                    {condition.currentStatus}
                  </span>
                </div>

                <div className="mt-2">
                  <div className="text-sm font-medium mb-1">Related Parameters:</div>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(condition.relatedParameters) ? condition.relatedParameters : []).map((paramId) => {
                      const param = (Array.isArray(healthParameters) ? healthParameters : []).find(p => p.id === paramId);
                      return param ? (
                        <span
                          key={paramId}
                          className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                        >
                          {param.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
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

export default Dashboard;
