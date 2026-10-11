import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";

/**
 * RAG-Powered Healthcare Chatbot
 *
 * Features:
 * - Requires authentication (login gate)
 * - Adaptive symptom collection with follow-up questions
 * - Doctor recommendations via RAG vector search
 * - Emergency screening
 * - Links to existing booking page
 * - Chat history in localStorage (hybrid storage)
 */
export default function Chatbot() {
  const { backendUrl, token, userData } = useContext(AppContext);
  const navigate = useNavigate();

  // Chat state
  const [messages, setMessages] = useState(() => {
    if (!token) return [];
    try {
      return JSON.parse(localStorage.getItem("ragChatHistory")) || [];
    } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem("ragChatSessionId") || null);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);

  const chatEndRef = useRef(null);

  // Persist chat history to localStorage
  useEffect(() => {
    if (token && messages.length > 0) {
      localStorage.setItem("ragChatHistory", JSON.stringify(messages));
    }
  }, [messages, token]);

  // Persist sessionId
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem("ragChatSessionId", sessionId);
    }
  }, [sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Welcome message when opening
  useEffect(() => {
    if (isOpen && token && messages.length === 0) {
      startNewSession();
    }
  }, [isOpen, token]);

  // Clear state on logout
  useEffect(() => {
    if (!token) {
      setMessages([]);
      setSessionId(null);
      setRecommendedDoctors([]);
      localStorage.removeItem("ragChatHistory");
      localStorage.removeItem("ragChatSessionId");
    }
  }, [token]);

  const startNewSession = useCallback(async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/chatbot/session/new`,
        {},
        { headers: { token } }
      );
      if (data.success) {
        setSessionId(data.session._id);
        setMessages([{ role: "bot", content: data.message, type: "greeting" }]);
        setRecommendedDoctors([]);
        localStorage.removeItem("ragChatHistory");
      }
    } catch (err) {
      console.error("Failed to start session:", err);
      setMessages([{
        role: "bot",
        content: "Hello! 👋 I'm your AI Health Assistant. Please describe your symptoms and I'll help you.\n\n⚠️ *Suggestions are for reference only — always consult a doctor.*",
        type: "greeting"
      }]);
    }
  }, [backendUrl, token]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setRecommendedDoctors([]);
    localStorage.removeItem("ragChatHistory");
    localStorage.removeItem("ragChatSessionId");
    setSessionId(null);
    startNewSession();
  }, [startNewSession]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    if (!token) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/chatbot/message`,
        { message: currentInput, sessionId },
        { headers: { token } }
      );

      if (data.success) {
        // Update sessionId if returned
        if (data.sessionId) setSessionId(data.sessionId);

        // Build bot message
        const botMessage = {
          role: "bot",
          content: data.message,
          type: data.type,
          analysis: data.analysis || null,
          doctors: data.doctors || null,
          emergencyDetected: data.emergencyDetected || false,
        };

        setMessages(prev => [...prev, botMessage]);

        // Store recommended doctors for display
        if (data.doctors?.length > 0) {
          setRecommendedDoctors(data.doctors);
        }
      } else {
        setMessages(prev => [...prev, {
          role: "bot",
          content: data.message || "Sorry, I couldn't process that. Please try again.",
          type: "error"
        }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errMsg = error.response?.status === 429
        ? "⏳ AI service is busy. Please wait a moment and try again."
        : "❌ Sorry, something went wrong. Please try again.";
      setMessages(prev => [...prev, { role: "bot", content: errMsg, type: "error" }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, token, backendUrl, sessionId]);

  const quickPrompts = [
    "I have a headache and fever",
    "Stomach pain after eating",
    "Skin rash that won't go away",
    "Find me a doctor",
  ];

  // ─── Login gate ───────────────────────────────────────────────────
  const renderLoginGate = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-4">
        <span className="text-3xl">🔒</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Login Required</h3>
      <p className="text-sm text-gray-500 mb-4">
        Please log in to access the AI Health Assistant. Your session data is kept secure and private.
      </p>
      <button
        onClick={() => { setIsOpen(false); navigate("/login"); }}
        className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
      >
        Log In
      </button>
    </div>
  );

  // ─── Doctor recommendation card ───────────────────────────────────
  const DoctorCard = ({ doctor }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-start gap-3 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-teal-50 flex-shrink-0 overflow-hidden">
        {doctor.image ? (
          <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover rounded-xl" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl">👨‍⚕️</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-gray-800 truncate">Dr. {doctor.name}</h4>
        <p className="text-xs text-teal-600 font-medium">{doctor.speciality}</p>
        {doctor.degree && <p className="text-xs text-gray-500">{doctor.degree}</p>}
        {doctor.experience && <p className="text-xs text-gray-500">{doctor.experience} experience</p>}
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs font-medium text-gray-700">${doctor.fees}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${doctor.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {doctor.available ? '● Available' : '○ Unavailable'}
          </span>
        </div>
        {doctor.available && (
          <button
            onClick={() => { setIsOpen(false); navigate(`/appointment/${doctor._id}`); }}
            className="mt-2 w-full px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium hover:bg-teal-100 transition-colors"
          >
            Book Appointment →
          </button>
        )}
      </div>
    </div>
  );

  // ─── Message renderer ─────────────────────────────────────────────
  const renderMessage = (msg, i) => {
    const isUser = msg.role === "user";

    return (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      >
        {!isUser && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-2 flex-shrink-0 ${
            msg.emergencyDetected
              ? "bg-gradient-to-br from-red-500 to-red-600"
              : "bg-gradient-to-br from-teal-500 to-emerald-500"
          }`}>
            <span className="text-sm">{msg.emergencyDetected ? "🚨" : "🤖"}</span>
          </div>
        )}

        <div className="max-w-[85%]">
          <div
            className={`break-words px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              isUser
                ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-br-md"
                : msg.emergencyDetected
                  ? "bg-red-50 text-red-800 border border-red-200 rounded-bl-md"
                  : "bg-white text-gray-700 shadow-md border border-gray-100 rounded-bl-md"
            }`}
          >
            {msg.content.split("\n").map((line, index) => {
              // Handle markdown-like formatting
              const isHeader = line.startsWith("## ") || line.startsWith("**");
              const isBullet = line.startsWith("• ") || line.startsWith("- ");
              const isQuote = line.startsWith("> ");
              const isEmoji = /^[🔬⚠️💊👨🚨🔴🟡📋]/.test(line);

              let content = line.replace(/\*\*/g, "").replace(/^## /, "").replace(/^> /, "").replace(/^\* /, "• ");
              // Handle italic markers
              if (content.startsWith("*") && content.endsWith("*")) {
                content = content.slice(1, -1);
                return <p key={index} className="italic text-gray-500 mt-1">{content}</p>;
              }

              return (
                <p
                  key={index}
                  className={`${
                    isHeader || isEmoji ? "font-semibold mt-2 first:mt-0" : ""
                  } ${isBullet ? "ml-2" : ""} ${isQuote ? "border-l-2 border-teal-300 pl-2 italic text-gray-600" : ""}`}
                >
                  {content}
                </p>
              );
            })}
          </div>

          {/* Doctor recommendations inline */}
          {msg.doctors?.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-semibold text-gray-600 px-1">👨‍⚕️ Recommended Doctors:</p>
              {msg.doctors.map((doc, j) => (
                <DoctorCard key={doc._id || j} doctor={doc} />
              ))}
            </div>
          )}
        </div>

        {isUser && (
          <div className="w-8 h-8 bg-gray-200 rounded-xl flex items-center justify-center ml-2 flex-shrink-0">
            <span className="text-sm">👤</span>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)]">
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full animate-ping opacity-25" />
            <div className="relative w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full shadow-2xl shadow-teal-500/40 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              AI Health Assistant
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="flex h-[min(600px,calc(100vh-2rem))] w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl sm:w-[420px]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 p-4 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />

              <div className="relative flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-white sm:text-lg">AI Health Assistant</h2>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full animate-pulse ${token ? 'bg-green-400' : 'bg-yellow-400'}`} />
                      <span className="text-white/80 text-xs">
                        {token ? 'Online • Ready to help' : 'Login required'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {token && (
                    <button
                      onClick={clearChat}
                      className="p-2.5 hover:bg-white/20 rounded-xl transition-colors"
                      title="New conversation"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2.5 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            {!token ? (
              renderLoginGate()
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                  {messages.map((msg, i) => renderMessage(msg, i))}

                  {/* Typing Indicator */}
                  {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
                        <span className="text-sm">🤖</span>
                      </div>
                      <div className="bg-white px-4 py-3 rounded-2xl shadow-md border border-gray-100 flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </motion.div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Quick Prompts */}
                {messages.length <= 1 && (
                  <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
                    {quickPrompts.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(prompt)}
                        className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full text-xs font-medium whitespace-nowrap hover:bg-teal-100 transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-2xl p-1.5">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
                      placeholder="Describe your symptoms..."
                      className="flex-1 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                      disabled={loading}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendMessage}
                      disabled={loading || !input.trim()}
                      className={`p-3 rounded-xl transition-all ${
                        input.trim() && !loading
                          ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </motion.button>
                  </div>

                  <p className="text-center text-xs text-gray-400 mt-2">
                    AI suggestions are for reference only. Consult a doctor for medical advice.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
