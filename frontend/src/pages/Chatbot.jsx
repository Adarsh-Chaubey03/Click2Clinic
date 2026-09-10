import { useState, useEffect, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Chatbot() {
  const [messages, setMessages] = useState(() => {
    return JSON.parse(localStorage.getItem("chatHistory")) || [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        role: "bot",
        content: "Hello! 👋 I'm your AI Health Assistant.\n\nDescribe your symptoms and I'll help identify possible conditions and recommend specialists.\n\n💡 Tip: Click the camera icon to analyze skin conditions!"
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("chatHistory");
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    setTimeout(async () => {
      try {
        const { data } = await axios.post(`${backendUrl}/api/user/chatbot-response`, { message: input });

        if (data.success) {
          const botResponse = {
            role: "bot",
            content: `🔬 **Possible Condition:**\n${data.response.disease}\n\n⚠️ **Precautions:**\n${data.response.precaution.map(p => `• ${p}`).join('\n')}\n\n💊 **Recommended Treatment:**\n${data.response.cure.map(c => `• ${c}`).join('\n')}\n\n👨‍⚕️ **See a:** ${data.response.recommendedDoctor}`,
          };
          setMessages((prev) => [...prev, botResponse]);
        } else {
          setMessages((prev) => [...prev, { role: "bot", content: data.message }]);
        }
      } catch (error) {
        console.error("Error fetching diagnosis:", error);
        setMessages((prev) => [...prev, { role: "bot", content: "❌ Sorry, I couldn't process that. Please try again." }]);
      }
      setLoading(false);
    }, 1000);
  };

  const handleAnalyzeImage = () => {
    window.scrollTo(0, 0);
    navigate('/ai-skin');
    setIsOpen(false);
  };

  const quickPrompts = [
    "I have a headache",
    "Feeling feverish",
    "Skin rash",
  ];

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
            {/* Pulse Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full animate-ping opacity-25" />

            <div className="relative w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full shadow-2xl shadow-teal-500/40 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>

            {/* Tooltip */}
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
            className="flex h-[min(550px,calc(100vh-2rem))] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl sm:w-[400px]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 p-4 relative overflow-hidden">
              {/* Decorative circles */}
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
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-white/80 text-xs">Online • Ready to help</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleAnalyzeImage}
                    className="p-2.5 hover:bg-white/20 rounded-xl transition-colors"
                    title="Analyze Skin Image"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={clearChat}
                    className="p-2.5 hover:bg-white/20 rounded-xl transition-colors"
                    title="Clear Chat"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "bot" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center mr-2 flex-shrink-0">
                      <span className="text-sm">🤖</span>
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] break-words px-4 py-3 rounded-2xl text-sm leading-relaxed
                              ${msg.role === "user"
                        ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-br-md"
                        : "bg-white text-gray-700 shadow-md border border-gray-100 rounded-bl-md"
                      }`}
                  >
                    {msg.content.split("\n").map((line, index) => (
                      <p key={index} className={`${line.startsWith("**") || line.startsWith("🔬") || line.startsWith("⚠️") || line.startsWith("💊") || line.startsWith("👨") ? "font-semibold mt-2 first:mt-0" : ""}`}>
                        {line.replace(/\*\*/g, '')}
                      </p>
                    ))}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-8 h-8 bg-gray-200 rounded-xl flex items-center justify-center ml-2 flex-shrink-0">
                      <span className="text-sm">👤</span>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
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
                    onClick={() => { setInput(prompt); }}
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
                  className={`p-3 rounded-xl transition-all
                            ${input.trim() && !loading
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
