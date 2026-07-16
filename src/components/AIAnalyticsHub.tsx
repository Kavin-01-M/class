import React, { useState, useEffect } from "react";
import { User } from "../types";
import { BrainCircuit, Sparkles, Send, GraduationCap, AlertTriangle, Lightbulb, FileText } from "lucide-react";

interface AIAnalyticsHubProps {
  user: User;
  activeClassId: string;
}

export default function AIAnalyticsHub({ user, activeClassId }: AIAnalyticsHubProps) {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState(activeClassId);
  const [analysisText, setAnalysisText] = useState("");
  const [chatPrompt, setChatPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string }>>([]);

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => {
        setClasses(data);
        if (data.length > 0 && !selectedClassId) {
          setSelectedClassId(data[0].id);
        }
      })
      .catch((err) => console.error("Error loading classes:", err));
  }, []);

  const triggerFullAnalysis = async () => {
    if (!selectedClassId) return;
    setLoading(true);
    setAnalysisText("");
    
    try {
      const res = await fetch("/api/ai/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: selectedClassId }),
      });

      if (!res.ok) {
        throw new Error("Failed to invoke classroom model.");
      }

      const data = await res.json();
      setAnalysisText(data.analysis);
    } catch (err: any) {
      console.error(err);
      setAnalysisText("Could not generate report. Fallback diagnostic generated below:\n\n* **Status Error**: Connection timed out. Ensure your GEMINI_API_KEY is correctly set in the secrets tab.");
    } finally {
      setLoading(false);
    }
  };

  const submitChatPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim() || !selectedClassId) return;

    const userMessage = chatPrompt;
    setChatHistory((prev) => [...prev, { sender: "user", text: userMessage }]);
    setChatPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: selectedClassId, prompt: userMessage }),
      });

      if (!res.ok) {
        throw new Error("Failed to call analytics.");
      }

      const data = await res.json();
      setChatHistory((prev) => [...prev, { sender: "ai", text: data.analysis }]);
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        { sender: "ai", text: "I'm sorry, I was unable to compile the dataset right now. Please verify your Express server logs." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-extrabold text-white tracking-tight uppercase font-mono">Gemini AI Academic Brain</h2>
          </div>
          <p className="text-slate-400 text-xs">
            Review predictive analytics, generate custom recovery schedules, and check class behavioral indexes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            id="ai-class-select"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-slate-950 border border-slate-800 focus:border-cyan-500/40 text-xs py-2 px-3 rounded-xl text-slate-100 outline-none"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.subject})
              </option>
            ))}
          </select>

          <button
            onClick={triggerFullAnalysis}
            id="trigger-full-ai-btn"
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
            <span>{loading ? "Analyzing..." : "Generate AI Review"}</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-start">
        
        {/* Left column: AI full reports and recommendations */}
        <div className="md:col-span-7 bg-slate-900/20 border border-slate-850 p-6 rounded-3xl min-h-[400px] flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Class Academic Profile Report</span>
            
            {loading && !analysisText && (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                <span className="text-slate-400 text-xs font-mono animate-pulse">Gemini compile-computing academic matrix...</span>
              </div>
            )}

            {!analysisText && !loading && (
              <div className="py-16 text-center space-y-4 max-w-md mx-auto">
                <BrainCircuit className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="text-slate-400 text-xs leading-relaxed">
                  No analytical assessment generated for this class yet. Click <strong>Generate AI Review</strong> to trigger a comprehensive educational diagnostic of rosters, attendance rate anomalies, and homework scores.
                </p>
              </div>
            )}

            {analysisText && (
              <div id="ai-report-body" className="prose prose-invert max-w-none text-xs leading-relaxed space-y-4 text-slate-300">
                {analysisText.split("\n").map((line, idx) => {
                  if (line.startsWith("###")) {
                    return <h3 key={idx} className="text-base font-extrabold text-white pt-2 uppercase font-mono tracking-tight">{line.replace("###", "")}</h3>;
                  }
                  if (line.startsWith("####")) {
                    return <h4 key={idx} className="text-sm font-extrabold text-cyan-400 pt-1 uppercase font-mono tracking-wider">{line.replace("####", "")}</h4>;
                  }
                  if (line.startsWith("*")) {
                    return <li key={idx} className="list-disc ml-4 text-slate-300">{line.replace("*", "").trim()}</li>;
                  }
                  if (line.trim() === "---") {
                    return <hr key={idx} className="border-slate-850/80 my-3" />;
                  }
                  return <p key={idx} className="text-slate-300 leading-relaxed font-medium">{line}</p>;
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Interactive AI Copilot chat */}
        <div className="md:col-span-5 bg-slate-900/30 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between h-[500px]">
          <div className="flex flex-col space-y-4 h-full overflow-hidden">
            <div className="border-b border-slate-850 pb-2 flex justify-between items-center shrink-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block">AI Academic Copilot</span>
              <span className="text-[9px] text-cyan-400 font-mono tracking-wider">ACTIVE CONVERSATION</span>
            </div>

            {/* Chat message display area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
              {chatHistory.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <span className="text-[11px] font-mono text-slate-500 block">Ask questions like:</span>
                  <div className="space-y-1.5 max-w-xs mx-auto">
                    <button 
                      onClick={() => setChatPrompt("Which students fall beneath 80% attendance rate limits?")}
                      className="w-full text-left p-2.5 bg-slate-950/60 hover:bg-slate-950 border border-slate-850/60 rounded-xl text-[10px] text-slate-400 transition-all block cursor-pointer"
                    >
                      "Which students fall beneath 80% attendance limits?"
                    </button>
                    <button 
                      onClick={() => setChatPrompt("Draft an email warning parent Helen about Lucas's homework marks.")}
                      className="w-full text-left p-2.5 bg-slate-950/60 hover:bg-slate-950 border border-slate-850/60 rounded-xl text-[10px] text-slate-400 transition-all block cursor-pointer"
                    >
                      "Draft an email to parent Helen about Lucas's homework."
                    </button>
                  </div>
                </div>
              ) : (
                chatHistory.map((chat, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col space-y-1 ${
                      chat.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                      {chat.sender === "user" ? "Teacher Prompt" : "Gemini Analyst"}
                    </span>
                    <div 
                      className={`p-3 rounded-2xl text-[11px] font-medium leading-relaxed max-w-[85%] ${
                        chat.sender === "user" 
                          ? "bg-cyan-500 text-slate-950 font-bold" 
                          : "bg-slate-950/80 border border-slate-850 text-slate-300"
                      }`}
                    >
                      {chat.text.split("\n").map((l, i) => <p key={i} className="mb-1">{l}</p>)}
                    </div>
                  </div>
                ))
              )}

              {loading && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].sender === "user" && (
                <div className="flex flex-col space-y-1 items-start">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">Gemini Analyst</span>
                  <div className="p-3 bg-slate-950/80 border border-slate-850 rounded-2xl flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input Submission Bar */}
            <form onSubmit={submitChatPrompt} className="relative shrink-0 pt-2 border-t border-slate-850">
              <input
                type="text"
                id="ai-chat-prompt"
                value={chatPrompt}
                onChange={(e) => setChatPrompt(e.target.value)}
                placeholder="Ask details (e.g. Draft study syllabus plans...)"
                className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500/60 rounded-xl py-3 pl-4 pr-12 text-xs text-white outline-none"
              />
              <button
                type="submit"
                id="ai-chat-submit-btn"
                className="absolute right-2 top-4 p-1.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 rounded-lg text-slate-950 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
