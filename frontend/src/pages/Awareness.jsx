import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { diseases } from "../assets/assets.js";
import { useNavigate, useLocation } from "react-router-dom";
import quickHealthBg from "../assets/quickhealth.png";

const Awareness = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDisease, setSelectedDisease] = useState(() => diseases[0] || null); // default: Diabetes
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const categories = ["All", "Viral", "Chronic", "Common"];

  // Auto-select disease passed via navigation state (from home page cards)
  useEffect(() => {
    if (location.state?.disease) {
      const match = diseases.find(
        (d) => d.name.toLowerCase() === location.state.disease.toLowerCase()
      );
      if (match) {
        setSelectedDisease(match);
        setActiveSection("overview");
      }
      // Clear state so back-navigation doesn't re-trigger
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  // Filter diseases
  const filteredDiseases = diseases.filter(
    (disease) =>
      (selectedCategory === "All" || disease.category === selectedCategory) &&
      disease.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="min-h-screen" style={{ background:"linear-gradient(110deg,#effcfb 0%,#f2fbfa 50%,#e9f8f8 100%)" }}>

      {/* ── HERO ── */}
      <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden"
        style={{ backgroundImage:`url(${quickHealthBg})`, backgroundSize:"cover", backgroundPosition:"center" }}>
        <div className="absolute inset-0 bg-[#009f9a]/80" />
        <div className="relative z-10 h-48 sm:h-56 lg:h-64 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 w-full">

            {/* Left */}
            <div className="max-w-xl">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-2">
                Knowledge for a <span className="text-[#c9ffef]">Healthier</span> You
              </h1>
              <p className="text-white/80 text-sm sm:text-base max-w-md mb-6 leading-relaxed">
                Explore trusted information about diseases, symptoms,
                treatments, and healthy living to make better health decisions.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ── CATEGORY FILTER BAR ── */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#dceeed] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 py-3">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  selectedCategory === cat
                    ? "text-white shadow"
                    : "bg-white text-[#5f7185] hover:bg-[#effcfb] border border-[#dceeed]"
                }`}
                style={selectedCategory === cat ? { background:"linear-gradient(135deg,#04a99d,#008eaa)" } : {}}>
                {cat}
              </button>
            ))}
            {/* Search */}
            <div className="relative ml-2 flex-1 max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b0bec5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input type="text" placeholder="Search conditions, symptoms..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[#dceeed] rounded-xl text-sm text-[#10233f] placeholder-[#b0bec5] focus:outline-none focus:border-[#009f9a] bg-white"/>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6" style={{ alignItems:"flex-start" }}>
          {/* Sidebar - Disease List */}
          <div className="hidden lg:block w-64 flex-shrink-0" style={{ position:"sticky", top:"108px", alignSelf:"flex-start" }}>
            <div className="bg-white rounded-2xl border border-[#dceeed] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[#dceeed]">
                <h3 className="font-bold text-[#10233f] text-sm">Health Conditions</h3>
                <p className="text-xs text-[#718398]">{filteredDiseases.length} articles</p>
              </div>
              <div className="p-2">
                {filteredDiseases.map((disease) => (
                  <button
                    key={disease.name}
                    onClick={() => {
                      setSelectedDisease(disease);
                      setActiveSection("overview");
                    }}
                    className={`w-full text-left p-2.5 rounded-xl mb-0.5 transition-all duration-200 ${
                      selectedDisease?.name === disease.name
                        ? "bg-[#effcfb] border-l-4 border-[#009f9a]"
                        : "hover:bg-[#f5fdfc] border-l-4 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={disease.image} alt={disease.name}
                        className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                        onError={e => e.target.src="https://via.placeholder.com/40"}/>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold leading-tight ${selectedDisease?.name === disease.name ? "text-[#009f9a]" : "text-[#10233f]"}`}>
                          {disease.name}
                        </p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          disease.category === "Viral" ? "bg-red-100 text-red-600" :
                          disease.category === "Chronic" ? "bg-[#ddf8f2] text-[#009f9a]" :
                          "bg-blue-100 text-blue-600"
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
                className="bg-white rounded-2xl border border-[#dceeed] overflow-hidden"
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
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${selectedDisease.category === "Viral" ? "bg-[#009f9a] text-white" :
                      selectedDisease.category === "Chronic" ? "bg-[#009f9a] text-white" :
                        "bg-[#009f9a] text-white"
                      }`}>
                      {selectedDisease.category}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">{selectedDisease.name}</h1>
                  </div>
                </div>

                {/* Section Navigation */}
                <div className="border-b border-[#dceeed] overflow-x-auto">
                  <div className="flex p-2 gap-1 min-w-max">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${activeSection === section.id
                          ? "bg-[#effcfb] text-[#009f9a]"
                          : "text-[#5f7185] hover:bg-[#effcfb]"
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
                          <h2 className="text-xl font-bold text-[#10233f] mb-4">What is {selectedDisease.name}?</h2>
                          <p className="text-[#5f7185] leading-relaxed">{selectedDisease.description}</p>
                        </div>

                        {selectedDisease.overview && (
                          <div className="bg-[#effcfb] rounded-xl p-5 border border-[#dceeed]">
                            <h3 className="font-semibold text-[#10233f] mb-2">📖 Quick Overview</h3>
                            <p className="text-[#5f7185] text-sm leading-relaxed">{selectedDisease.overview}</p>
                          </div>
                        )}

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="bg-[#effcfb] rounded-xl p-4 border border-[#dceeed]">
                            <h4 className="font-semibold text-[#10233f] mb-1">🌍 Global Impact</h4>
                            <p className="text-[#009f9a] text-lg font-bold">{selectedDisease.affectedPeople}</p>
                          </div>
                          <div className="bg-[#effcfb] rounded-xl p-4 border border-[#dceeed]">
                            <h4 className="font-semibold text-[#10233f] mb-1">📁 Category</h4>
                            <p className="text-[#009f9a] text-lg font-bold">{selectedDisease.category} Condition</p>
                          </div>
                        </div>

                        {/* When to See Doctor */}
                        {selectedDisease.whenToSeeDoctor && (
                          <div className="bg-[#effcfb] rounded-xl p-5 border border-[#dceeed]">
                            <h3 className="font-bold text-[#10233f] mb-3 flex items-center gap-2">
                              <span>🚨</span> When to See a Doctor
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-2">
                              {selectedDisease.whenToSeeDoctor.map((item, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <span className="text-[#009f9a] mt-1">•</span>
                                  <span className="text-[#5f7185] text-sm">{item}</span>
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
                        <h2 className="text-xl font-bold text-[#10233f]">Common Symptoms</h2>
                        <p className="text-[#5f7185]">These symptoms may vary in severity. Not everyone experiences all symptoms.</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {selectedDisease.symptoms?.map((symptom, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center gap-3 p-4 bg-[#effcfb] rounded-xl border border-[#dceeed]"
                            >
                              <span className="w-8 h-8 bg-[#ddf8f2] rounded-lg flex items-center justify-center text-[#009f9a] font-bold text-sm">{i + 1}</span>
                              <span className="text-[#10233f]">{symptom}</span>
                            </motion.div>
                          ))}
                        </div>
                        <div className="bg-[#effcfb] rounded-xl p-4 border border-[#dceeed]">
                          <p className="text-[#5f7185] text-sm">
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
                          <h2 className="text-xl font-bold text-[#10233f] mb-4">Causes</h2>
                          <div className="space-y-3">
                            {selectedDisease.causes?.map((cause, i) => (
                              <div key={i} className="flex items-start gap-3 p-4 bg-[#effcfb] rounded-xl border border-[#dceeed]">
                                <span className="text-[#009f9a] mt-0.5">🔬</span>
                                <span className="text-[#10233f]">{cause}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {selectedDisease.riskFactors && (
                          <div>
                            <h2 className="text-xl font-bold text-[#10233f] mb-4">Risk Factors</h2>
                            <div className="grid sm:grid-cols-2 gap-3">
                              {selectedDisease.riskFactors.map((factor, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-[#effcfb] rounded-xl border border-[#dceeed]">
                                  <span className="text-[#009f9a]">⚡</span>
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
                        <h2 className="text-xl font-bold text-[#10233f]">Diagnostic Tests</h2>
                        <p className="text-[#5f7185]">Your doctor may recommend one or more of these tests to diagnose {selectedDisease.name}.</p>
                        <div className="space-y-3">
                          {selectedDisease.diagnosis?.map((test, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center gap-4 p-4 bg-[#effcfb] rounded-xl border border-[#dceeed]"
                            >
                              <span className="w-10 h-10 bg-[#ddf8f2] rounded-xl flex items-center justify-center text-[#009f9a]">🧪</span>
                              <span className="text-gray-700 font-medium">{test}</span>
                            </motion.div>
                          ))}
                        </div>
                        <button
                          onClick={() => { navigate("/lab"); window.scrollTo(0, 0); }}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#009f9a] text-white font-semibold rounded-xl hover:bg-[#008eaa] transition-colors"
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
                        <h2 className="text-xl font-bold text-[#10233f]">Treatment Options</h2>
                        <div className="bg-[#effcfb] border border-[#dceeed] rounded-xl p-5">
                          <p className="text-[#5f7185]">
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
                              className="flex items-start gap-3 p-4 bg-[#effcfb] rounded-xl border border-[#dceeed]"
                            >
                              <span className="text-[#009f9a] mt-0.5">💊</span>
                              <span className="text-[#10233f]">{treatment}</span>
                            </motion.div>
                          ))}
                        </div>
                        <button
                          onClick={() => { navigate("/doctors"); window.scrollTo(0, 0); }}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#009f9a] text-white font-semibold rounded-xl hover:bg-[#008eaa] transition-colors"
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
                        <h2 className="text-xl font-bold text-[#10233f]">Prevention Tips</h2>
                        <p className="text-[#5f7185]">Following these preventive measures can significantly reduce your risk.</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {selectedDisease.prevention?.map((tip, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-start gap-3 p-4 bg-[#effcfb] rounded-xl border border-[#dceeed]"
                            >
                              <span className="text-[#009f9a] mt-0.5">✅</span>
                              <span className="text-[#10233f]">{tip}</span>
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
                        <h2 className="text-xl font-bold text-[#10233f]">Frequently Asked Questions</h2>
                        <div className="space-y-3">
                          {selectedDisease.faqs?.map((faq, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="bg-white rounded-xl border border-[#dceeed] overflow-hidden"
                            >
                              <button
                                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-[#effcfb] transition-colors"
                              >
                                <span className="font-medium text-[#10233f] pr-4">{faq.q}</span>
                                <svg
                                  className={`w-5 h-5 text-[#718398] transition-transform ${expandedFaq === i ? "rotate-180" : ""}`}
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
                                    className="border-t border-[#dceeed]"
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
                  <div className="mt-8 pt-6 border-t border-[#dceeed]">
                    <h3 className="font-bold text-[#10233f] mb-4">Need Help?</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => { navigate("/doctors"); window.scrollTo(0, 0); }}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r bg-[#009f9a] text-white font-semibold rounded-xl hover:bg-[#008eaa] hover:shadow-lg transition-all"
                      >
                        <span>👨‍⚕️</span> Consult a Doctor
                      </button>
                      <button
                        onClick={() => { navigate("/lab"); window.scrollTo(0, 0); }}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-[#009f9a] text-[#009f9a] font-semibold rounded-xl hover:bg-[#effcfb] transition-all"
                      >
                        <span>🔬</span> Book Lab Test
                      </button>
                      <button
                        onClick={() => { navigate("/store"); window.scrollTo(0, 0); }}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-[#009f9a] text-[#009f9a] font-semibold rounded-xl hover:bg-[#effcfb] transition-all"
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
                      <p className="text-sm text-[#718398]">{item.desc}</p>
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
                        <p className="text-sm text-[#718398]">{disease.category}</p>
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