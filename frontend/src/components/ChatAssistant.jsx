import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Bot, Send } from "lucide-react";

export default function ChatAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, from: "assistant", text: "Welcome to FundMate 👋" },
    {
      id: 2,
      from: "assistant",
      text: "Hello! I'm your AI assistant. Ask me anything about funding, investments, startups, mentorship, or your entrepreneurial journey.",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop =
        messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text) => {
    const messageText =
      typeof text === "string" && text.trim()
        ? text
        : input.trim();

    if (!messageText) return;

    const userMsg = {
      id: Date.now(),
      from: "you",
      text: messageText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const API_BASE =
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000";

      const res = await axios.post(
        `${API_BASE}/api/ai/chat`,
        {
          message: messageText,
        }
      );

      const botMsg = {
        id: Date.now() + 1,
        from: "assistant",
        text:
          res.data?.reply ||
          "Sorry, I couldn't get a response.",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          from: "assistant",
          text: `Error: ${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f7fbf5]">
      {/* Messages */}
      <div
        ref={messagesRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.from === "you"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div className="flex items-end gap-2 max-w-[80%]">
              {m.from !== "you" && (
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
                  <Bot size={18} />
                </div>
              )}

              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  m.from === "you"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md"
                    : "bg-white border border-slate-200 text-slate-700 rounded-bl-md"
                }`}
              >
                {m.text}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                <Bot size={18} />
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                  <span
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <span
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-3 border border-slate-200 rounded-2xl bg-[#f8fafc] px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Ask FundMate AI..."
            className="flex-1 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
          />

          <button
            onClick={() => sendMessage()}
            disabled={loading}
            className="w-11 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md hover:scale-105 transition-all disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}