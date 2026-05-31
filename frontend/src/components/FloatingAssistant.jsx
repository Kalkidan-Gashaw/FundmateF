import { useState } from "react";
import {
  MessageSquare,
  X,
  Sparkles,
} from "lucide-react";
import ChatAssistant from "./ChatAssistant";

export default function FloatingAssistant() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Assistant"
          className="relative w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_10px_35px_rgba(37,99,235,.35)] flex items-center justify-center hover:scale-110 transition-all duration-300"
        >
          <MessageSquare size={28} />

          <span className="absolute top-1 right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[9999]">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Chat Window */}
          <div className="absolute bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[430px] h-full md:h-[750px] md:max-h-[85vh] bg-[#f5f7fb] rounded-none md:rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles
                    size={18}
                    className="text-white"
                  />

                  <h3 className="text-white font-bold text-lg">
                    FundMate AI
                  </h3>
                </div>

                <p className="text-blue-100 text-xs mt-1">
                  Online • Ready to help
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat */}
            <div className="h-[calc(100%-76px)]">
              <ChatAssistant />
            </div>
          </div>
        </div>
      )}
    </>
  );
}