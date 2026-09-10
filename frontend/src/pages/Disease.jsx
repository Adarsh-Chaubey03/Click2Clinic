import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { diseases, assets } from '../assets/assets.js';
import { FaArrowLeft } from 'react-icons/fa';

const Disease = () => {
  const { disease } = useParams();
  const navigate = useNavigate();
  const diseaseData = diseases.find(
    (d) => d.name.toLowerCase() === decodeURIComponent(disease).toLowerCase()
  );

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  if (!diseaseData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-lg mx-auto text-center bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Disease Not Found</h2>
          <p className="text-gray-600 mb-8 text-lg">The disease you are looking for does not exist.</p>
          <button
            onClick={() => navigate('/awareness')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 font-semibold shadow-md"
            aria-label="Back to Awareness"
          >
            <FaArrowLeft /> Back to Awareness
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-16 pb-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden h-56 sm:h-72 flex items-end mb-10 bg-gradient-to-r from-indigo-600 to-blue-500">
          <img
            src={diseaseData.image || assets.placeholder_image}
            alt={diseaseData.name}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/70 via-blue-700/40 to-transparent"></div>
          <div className="relative z-10 p-8 sm:p-12">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-2 drop-shadow-lg">{diseaseData.name}</h1>
            <p className="text-white text-base sm:text-lg font-medium drop-shadow">Category: {diseaseData.category}</p>
          </div>
        </div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-10 -mt-16 relative z-20"
        >
          <button
            onClick={() => navigate('/awareness')}
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all duration-300 font-medium"
            aria-label="Back to Awareness"
          >
            <FaArrowLeft /> Back to Awareness
          </button>
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed">{diseaseData.description}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Affected People</h2>
              <p className="text-gray-600">{diseaseData.affectedPeople}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Symptoms</h2>
              {diseaseData.symptoms && diseaseData.symptoms.length > 0 ? (
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  {diseaseData.symptoms.map((symptom, idx) => (
                    <li key={idx} className="text-gray-600">{symptom}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No symptoms data available</p>
              )}
            </div>
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Precautions</h2>
              {diseaseData.precautions && diseaseData.precautions.length > 0 ? (
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  {diseaseData.precautions.map((precaution, idx) => (
                    <li key={idx} className="text-gray-600">{precaution}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No precautions data available</p>
              )}
            </div>
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Treatments</h2>
              {diseaseData.treatments && diseaseData.treatments.length > 0 ? (
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  {diseaseData.treatments.map((treatment, idx) => (
                    <li key={idx} className="text-gray-600">{treatment}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No treatments data available</p>
              )}
            </div>
            <a
              href={`https://www.who.int/search?query=${encodeURIComponent(diseaseData.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-blue-600 hover:text-blue-800 text-lg font-medium transition-all duration-300 hover:underline"
              aria-label={`Learn more about ${diseaseData.name} on WHO`}
            >
              More Info on WHO
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Disease;