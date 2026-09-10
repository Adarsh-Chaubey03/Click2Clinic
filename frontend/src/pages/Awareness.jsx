import { useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { diseases } from "../assets/assets.js";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Awareness = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const { backendUrl } = useContext(AppContext);
  const [latestDisease, setLatestDisease] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const categories = ["All", "Viral", "Chronic", "Common"];

  // Filter diseases
  const filteredDiseases = diseases.filter(
    (disease) =>
      (selectedCategory === "All" || disease.category === selectedCategory) &&
      disease.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch latest disease data
  const fetchDiseaseData = async (forceRefresh = false) => {
    if (isLoading) return;
    if (!forceRefresh && localStorage.getItem("latestDisease")) {
      setLatestDisease(JSON.parse(localStorage.getItem("latestDisease")));
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await axios.post(backendUrl + "/api/user/gemini-response");
      if (data.success) {
        setLatestDisease(data.data);
        localStorage.setItem("latestDisease", JSON.stringify(data.data));
      } else {
        toast.error("Failed to fetch latest health alert");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch latest health alert");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiseaseData();
  }, []);

  // Sidebar sections for selected disease
  const sections = [
    { id: "overview", label: "Overview", icon: "📋" },
    { id: "symptoms", label: "Symptoms", icon: "🩺" },
    { id: "causes", label: "Causes & Risk", icon: "🔬" },
    { id: "diagnosis", label: "Diagnosis", icon: "🧪" },
    { id: "treatment", label: "Treatment", icon: "💊" },
    { id: "prevention", label: "Prevention", icon: "🛡️" },
    { id: "faq", label: "FAQs", icon: "❓" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              📚 Health Library
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Health Tips & Disease Guide
            </h1>
            <p className="text-teal-100 text-lg max-w-2xl mx-auto mb-8">
              Comprehensive information about diseases, symptoms, treatments, and prevention
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search conditions, symptoms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Current Outbreak Alert */}
        {latestDisease && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-red-800 text-lg mb-1">Current Health Alert: {latestDisease.disease}</h3>
                  <button 
                    onClick={() => fetchDiseaseData(true)} 
                    disabled={isLoading}
                    className="flex items-center gap-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
                <p className="text-red-700 text-sm mb-2">{latestDisease.description}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="text-red-600 font-semibold">{latestDisease.infected?.toLocaleString()} cases</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-red-600 font-semibold">{latestDisease.deaths?.toLocaleString()} deaths</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${selectedCategory === cat
                ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex gap-8">
          {/* Sidebar - Disease List */}
          <div className={`
            fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 lg:relative lg:transform-none lg:shadow-none lg:z-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}>
            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="h-full overflow-y-auto bg-white rounded-2xl border border-gray-200 lg:sticky lg:top-4">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Health Conditions</h3>
                <p className="text-sm text-gray-500">{filteredDiseases.length} articles</p>
              </div>
              <div className="p-2">
                {filteredDiseases.map((disease) => (
                  <button
                    key={disease.name}
                    onClick={() => {
                      setSelectedDisease(disease);
                      setActiveSection("overview");
                      setSidebarOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl mb-1 transition-all duration-200 ${selectedDisease?.name === disease.name
                      ? "bg-teal-50 border-l-4 border-teal-600"
                      : "hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={disease.image}
                        alt={disease.name}
                        className="w-10 h-10 rounded-lg object-cover"
                        onError={(e) => e.target.src = "https://via.placeholder.com/40"}
                      />
                      <div>
                        <p className={`font-medium ${selectedDisease?.name === disease.name ? "text-teal-700" : "text-gray-900"}`}>
                          {disease.name}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${disease.category === "Viral" ? "bg-red-100 text-red-700" :
                          disease.category === "Chronic" ? "bg-purple-100 text-purple-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                          {disease.category}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>



          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {selectedDisease ? (
              <motion.div
                key={selectedDisease.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
              >
                {/* Disease Header */}
                <div className="relative h-56 sm:h-72 lg:h-80 overflow-hidden">
                  <img
                    src={selectedDisease.image}
                    alt={selectedDisease.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${selectedDisease.category === "Viral" ? "bg-red-500 text-white" :
                      selectedDisease.category === "Chronic" ? "bg-purple-500 text-white" :
                        "bg-blue-500 text-white"
                      }`}>
                      {selectedDisease.category}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">{selectedDisease.name}</h1>
                  </div>
                </div>

                {/* Section Navigation */}
                <div className="border-b border-gray-200 overflow-x-auto">
                  <div className="flex p-2 gap-1 min-w-max">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${activeSection === section.id
                          ? "bg-teal-50 text-teal-700"
                          : "text-gray-600 hover:bg-gray-50"
                          }`}
                      >
                        <span>{section.icon}</span>
                        <span className="hidden sm:inline">{section.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Sections */}
                <div className="p-6 sm:p-8">
                  <AnimatePresence mode="wait">
                    {activeSection === "overview" && (
                      <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 mb-4">What is {selectedDisease.name}?</h2>
                          <p className="text-gray-600 leading-relaxed">{selectedDisease.description}</p>
                        </div>

                        {selectedDisease.overview && (
                          <div className="bg-teal-50 rounded-xl p-5 border border-teal-100">
                            <h3 className="font-semibold text-teal-900 mb-2">📖 Quick Overview</h3>
                            <p className="text-teal-800 text-sm leading-relaxed">{selectedDisease.overview}</p>
                          </div>
                        )}

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <h4 className="font-semibold text-blue-900 mb-1">🌍 Global Impact</h4>
                            <p className="text-blue-700 text-lg font-bold">{selectedDisease.affectedPeople}</p>
                          </div>
                          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                            <h4 className="font-semibold text-purple-900 mb-1">📁 Category</h4>
                            <p className="text-purple-700 text-lg font-bold">{selectedDisease.category} Condition</p>
                          </div>
                        </div>

                        {/* When to See Doctor */}
                        {selectedDisease.whenToSeeDoctor && (
                          <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                            <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                              <span>🚨</span> When to See a Doctor
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-2">
                              {selectedDisease.whenToSeeDoctor.map((item, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <span className="text-red-500 mt-1">•</span>
                                  <span className="text-red-700 text-sm">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeSection === "symptoms" && (
                      <motion.div
                        key="symptoms"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <h2 className="text-xl font-bold text-gray-900">Common Symptoms</h2>
                        <p className="text-gray-600">These symptoms may vary in severity. Not everyone experiences all symptoms.</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {selectedDisease.symptoms?.map((symptom, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100"
                            >
                              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-sm">{i + 1}</span>
                              <span className="text-gray-700">{symptom}</span>
                            </motion.div>
                          ))}
                        </div>
                        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                          <p className="text-yellow-800 text-sm">
                            <strong>⚠️ Note:</strong> If you experience severe symptoms, seek immediate medical attention.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {activeSection === "causes" && (
                      <motion.div
                        key="causes"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 mb-4">Causes</h2>
                          <div className="space-y-3">
                            {selectedDisease.causes?.map((cause, i) => (
                              <div key={i} className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <span className="text-blue-500 mt-0.5">🔬</span>
                                <span className="text-gray-700">{cause}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {selectedDisease.riskFactors && (
                          <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Risk Factors</h2>
                            <div className="grid sm:grid-cols-2 gap-3">
                              {selectedDisease.riskFactors.map((factor, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                  <span className="text-amber-500">⚡</span>
                                  <span className="text-gray-700 text-sm">{factor}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeSection === "diagnosis" && (
                      <motion.div
                        key="diagnosis"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <h2 className="text-xl font-bold text-gray-900">Diagnostic Tests</h2>
                        <p className="text-gray-600">Your doctor may recommend one or more of these tests to diagnose {selectedDisease.name}.</p>
                        <div className="space-y-3">
                          {selectedDisease.diagnosis?.map((test, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100"
                            >
                              <span className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">🧪</span>
                              <span className="text-gray-700 font-medium">{test}</span>
                            </motion.div>
                          ))}
                        </div>
                        <button
                          onClick={() => { navigate("/lab"); window.scrollTo(0, 0); }}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                          <span>🔬</span> Book Lab Test
                        </button>
                      </motion.div>
                    )}

                    {activeSection === "treatment" && (
                      <motion.div
                        key="treatment"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <h2 className="text-xl font-bold text-gray-900">Treatment Options</h2>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                          <p className="text-green-800">
                            <strong>⚕️ Important:</strong> Always consult a qualified healthcare professional for proper diagnosis and treatment. Treatment plans are individualized based on severity and patient condition.
                          </p>
                        </div>
                        <div className="space-y-3">
                          {selectedDisease.treatments?.map((treatment, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-start gap-3 p-4 bg-teal-50 rounded-xl border border-teal-100"
                            >
                              <span className="text-teal-500 mt-0.5">💊</span>
                              <span className="text-gray-700">{treatment}</span>
                            </motion.div>
                          ))}
                        </div>
                        <button
                          onClick={() => { navigate("/doctors"); window.scrollTo(0, 0); }}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors"
                        >
                          <span>👨‍⚕️</span> Consult a Doctor
                        </button>
                      </motion.div>
                    )}

                    {activeSection === "prevention" && (
                      <motion.div
                        key="prevention"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <h2 className="text-xl font-bold text-gray-900">Prevention Tips</h2>
                        <p className="text-gray-600">Following these preventive measures can significantly reduce your risk.</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {selectedDisease.prevention?.map((tip, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100"
                            >
                              <span className="text-emerald-500 mt-0.5">✅</span>
                              <span className="text-gray-700">{tip}</span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeSection === "faq" && (
                      <motion.div
                        key="faq"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <h2 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h2>
                        <div className="space-y-3">
                          {selectedDisease.faqs?.map((faq, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
                            >
                              <button
                                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 transition-colors"
                              >
                                <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
                                <svg
                                  className={`w-5 h-5 text-gray-500 transition-transform ${expandedFaq === i ? "rotate-180" : ""}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              <AnimatePresence>
                                {expandedFaq === i && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-gray-200"
                                  >
                                    <p className="p-4 text-gray-600 bg-white">{faq.a}</p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* CTA Section */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4">Need Help?</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => { navigate("/doctors"); window.scrollTo(0, 0); }}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                      >
                        <span>👨‍⚕️</span> Consult a Doctor
                      </button>
                      <button
                        onClick={() => { navigate("/lab"); window.scrollTo(0, 0); }}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-teal-600 text-teal-700 font-semibold rounded-xl hover:bg-teal-50 transition-all"
                      >
                        <span>🔬</span> Book Lab Test
                      </button>
                      <button
                        onClick={() => { navigate("/store"); window.scrollTo(0, 0); }}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-blue-600 text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all"
                      >
                        <span>💊</span> Order Medicines
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Welcome Screen */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center"
              >
                <div className="w-20 h-20 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📖</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Health Library</h2>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  Select a condition from the sidebar to learn about symptoms, causes, treatments, and prevention tips.
                </p>

                {/* Quick Access Cards */}
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { icon: "🩺", label: "Symptoms", desc: "Identify warning signs" },
                    { icon: "💊", label: "Treatments", desc: "Explore options" },
                    { icon: "🛡️", label: "Prevention", desc: "Stay protected" },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-xl">
                      <span className="text-2xl mb-2 block">{item.icon}</span>
                      <h4 className="font-semibold text-gray-900">{item.label}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Featured Conditions */}
                <h3 className="text-lg font-bold text-gray-900 mb-4">Featured Conditions</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {diseases.slice(0, 6).map((disease) => (
                    <button
                      key={disease.name}
                      onClick={() => {
                        setSelectedDisease(disease);
                        setActiveSection("overview");
                      }}
                      className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-teal-300 hover:shadow-md transition-all text-left"
                    >
                      <img
                        src={disease.image}
                        alt={disease.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{disease.name}</p>
                        <p className="text-sm text-gray-500">{disease.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Awareness;