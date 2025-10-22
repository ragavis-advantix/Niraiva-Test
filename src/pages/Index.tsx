import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Clock, FileText } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-niraiva-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="flex flex-col justify-center items-center mb-6">
            <img 
              src="/lovable-uploads/61f90f3e-8203-4812-8785-a19b6e5eeaab.png" 
              alt="Niraiva Logo" 
              className="h-32 w-32 md:h-40 md:w-40 mb-4" 
            />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-niraiva-600 to-niraiva-500">
              Niraiva
            </h1>
            <p className="text-niraiva-600 mt-2 font-medium">PREVENT · HEAL · HEALTHY</p>
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed px-4"
          >
            A comprehensive health management platform to track, monitor, and visualize your health journey.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
          >
            <Link
              to="/dashboard"
              className="px-6 py-3 bg-niraiva-600 text-white rounded-lg hover:bg-niraiva-700 transition-colors flex items-center justify-center"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Learn More
            </a>
          </motion.div>
        </motion.div>
        
        <div id="features" className="py-12 md:py-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white"
          >
            Key Features
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-card p-6 hover-lift"
            >
              <div className="rounded-full bg-niraiva-100 dark:bg-niraiva-900/30 p-3 inline-block mb-4">
                <Heart className="h-6 w-6 text-niraiva-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Health Dashboard</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track key health metrics and visualize your demographic data based on uploaded health reports.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-card p-6 hover-lift"
            >
              <div className="rounded-full bg-niraiva-100 dark:bg-niraiva-900/30 p-3 inline-block mb-4">
                <Clock className="h-6 w-6 text-niraiva-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Health Timeline</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Visualize your health journey with a comprehensive timeline of medical events and test results.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-card p-6 hover-lift"
            >
              <div className="rounded-full bg-niraiva-100 dark:bg-niraiva-900/30 p-3 inline-block mb-4">
                <FileText className="h-6 w-6 text-niraiva-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Disease Mapping</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Explore detailed diagnostic maps that show the progression of conditions over time.
              </p>
            </motion.div>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto py-12 md:py-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">Ready to Start?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 px-4">
            Begin your health management journey with Niraiva today.
          </p>
          <Link
            to="/dashboard"
            className="px-6 py-3 md:px-8 md:py-4 bg-niraiva-600 text-white rounded-lg hover:bg-niraiva-700 transition-colors inline-flex items-center text-lg"
          >
            Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </motion.div>
      </div>
      
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/61f90f3e-8203-4812-8785-a19b6e5eeaab.png" 
              alt="Niraiva Logo" 
              className="h-8 w-8 mr-2" 
            />
            <span className="text-xl font-semibold text-gray-900 dark:text-white">Niraiva</span>
          </div>
          <p className="text-niraiva-600 text-sm font-medium mb-2">PREVENT · HEAL · HEALTHY</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Niraiva Health. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
