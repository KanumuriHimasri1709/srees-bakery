import React, { useState, useEffect, useRef } from "react";
import { Sparkles, X, Send, Bot, User as UserIcon, RefreshCw, AlertCircle } from "lucide-react";
import { api } from "../services/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  grounded?: boolean;
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am Sree's Bakery AI Assistant. Ask me anything about our freshly baked cakes, verified menu prices, operating timings, Rapido delivery, or custom orders!",
      grounded: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "What cakes are available?",
    "What is the price of chocolate cake?",
    "What are your timings?",
    "Do you provide delivery?",
    "How can I pay?",
    "Do you make custom cakes?",
    "Can I upload a cake design?",
    "What eggless options are available?",
    "Where are you located?",
    "What is the first-order offer?",
  ];

  // Listen for external open events (e.g. from navbar or product cards)
  useEffect(() => {
    const handleOpen = (e: any) => {
      setIsOpen(true);
      if (e.detail?.initialQuery) {
        sendMessage(e.detail.initialQuery);
      }
    };
    window.addEventListener("open-bakery-ai", handleOpen);
    return () => window.removeEventListener("open-bakery-ai", handleOpen);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setIsLoading(true);

    try {
      const res = await api.chatWithAssistant(query);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.answer,
          grounded: res.grounded,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I don't have that information in Sree's Home Bakery's verified details. Please contact the bakery at 7981468535 or 8801121818 for confirmation.",
          grounded: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-5 bottom-5 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#8B263E] text-white shadow-xl hover:bg-[#721E31] transition-all duration-300 hover:scale-105 border border-white/20"
        aria-label="Open Sree's Bakery AI Assistant"
      >
        <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#E0A952]" />
        </span>
        <span className="text-xs font-bold tracking-wide hidden sm:inline">Ask Bakery AI</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed right-5 bottom-20 z-40 w-[92vw] sm:w-[420px] h-[580px] max-h-[82vh] bg-[#FDFBF7] rounded-3xl border border-[#EADED3] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-[#2B1810] text-white flex items-center justify-between border-b border-[#3D2314]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#8B263E] flex items-center justify-center text-[#E0A952]">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-white leading-none">
                  Sree's Bakery AI
                </h4>
                <p className="text-[11px] text-[#E0A952] mt-0.5 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Grounded in Verified Bakery Details
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF5EC]/40">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-[#8B263E] text-white flex-none flex items-center justify-center text-[10px] font-bold mt-1">
                    S
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#8B263E] text-white rounded-br-none"
                      : "bg-white text-[#2B1810] border border-[#EADED3] rounded-bl-none shadow-xs"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <div className="w-6 h-6 rounded-full bg-stone-300 text-stone-700 flex-none flex items-center justify-center mt-1">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-stone-500 text-xs pl-8">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#8B263E]" />
                Searching verified bakery knowledge...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Carousel */}
          <div className="p-2.5 bg-white border-t border-[#EADED3] overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
            {suggestedQuestions.map((sq, i) => (
              <button
                key={i}
                onClick={() => sendMessage(sq)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FCECE9] text-[#8B263E] hover:bg-[#8B263E] hover:text-white transition-colors flex-none"
              >
                {sq}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-[#EADED3] flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about cakes, prices, timings..."
              className="flex-1 bg-[#FDFBF7] border border-[#EADED3] rounded-full px-4 py-2 text-xs text-[#2B1810] outline-none focus:border-[#8B263E]"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="w-8 h-8 rounded-full bg-[#8B263E] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#721E31] transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
export default Chatbot;
