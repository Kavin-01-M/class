import React, { useState, useEffect } from "react";
import { User, Lesson } from "../types";
import { Plus, Layers, CheckCircle2, Circle, Clock, Edit2 } from "lucide-react";

interface LessonManagerProps {
  user: User;
  activeClassId: string;
}

export default function LessonManager({ user, activeClassId }: LessonManagerProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"completed" | "in-progress" | "planned">("planned");
  const [date, setDate] = useState("");

  const isStudent = user.role === "student";

  const loadLessons = () => {
    if (!activeClassId) return;
    fetch(`/api/lessons?classId=${activeClassId}`)
      .then((res) => res.json())
      .then((data) => setLessons(data))
      .catch((err) => console.error("Error loading lessons:", err));
  };

  useEffect(() => {
    loadLessons();
  }, [activeClassId]);

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStudent) return;

    if (!title || !date) {
      setError("Title and release date are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId || undefined,
          title,
          description,
          classId: activeClassId,
          status,
          date,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to commit lesson target.");
      }

      setTitle("");
      setDescription("");
      setDate("");
      setStatus("planned");
      setEditingId(null);
      setShowAddForm(false);
      loadLessons();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (lesStatus: string) => {
    if (lesStatus === "completed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold rounded-lg uppercase tracking-wider font-mono">
          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
        </span>
      );
    }
    if (lesStatus === "in-progress") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-[10px] font-bold rounded-lg uppercase tracking-wider font-mono animate-pulse">
          <Clock className="w-3.5 h-3.5" /> Active Learning
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-bold rounded-lg uppercase tracking-wider font-mono">
        <Circle className="w-3 h-3" /> Planned Target
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight uppercase font-mono">Lesson Milestones & Plan</h2>
          <p className="text-slate-400 text-xs mt-1">
            {isStudent 
              ? "Track weekly academic progress milestones and target curriculum goals." 
              : "Formulate syllabus chapters, set learning targets, and mark chapter milestones."}
          </p>
        </div>

        {!isStudent && (
          <button
            onClick={() => {
              setEditingId(null);
              setTitle("");
              setDescription("");
              setDate("");
              setStatus("planned");
              setShowAddForm(!showAddForm);
              setError("");
            }}
            id="add-lesson-trigger"
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Plan Milestone</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Form Area */}
      {showAddForm && !isStudent && (
        <div id="add-lesson-form-panel" className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            {editingId ? "Modify Syllabus Milestone" : "Draft Course Syllabus Milestone"}
          </h3>
          <form onSubmit={handleSaveLesson} className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Milestone Title *</label>
              <input
                type="text"
                id="les-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 4: Special Relativity & Minkowski Spacetime"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-white outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Milestone Progress Status</label>
              <select
                id="les-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none"
              >
                <option value="planned">Planned Target</option>
                <option value="in-progress">Active learning</option>
                <option value="completed">Completed Target</option>
              </select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Milestone Date *</label>
              <input
                type="date"
                id="les-date-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-white outline-none"
                required
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Milestone Core Targets & Summary</label>
              <textarea
                id="les-desc-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summarize course targets, page guidelines, homework, or presentation materials..."
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2.5 px-3 text-xs text-white outline-none h-20 resize-none"
              />
            </div>
            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                id="les-submit-btn"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
              >
                {loading ? "Recording..." : editingId ? "Update Milestone" : "Commit Milestone Plan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Syllabus Roadmap Display */}
      {lessons.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/10 border border-slate-850 rounded-3xl text-slate-500">
          <span className="text-sm">No course milestones mapped for this class.</span>
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-800 ml-4 pl-8 space-y-6">
          {lessons.map((les) => (
            <div 
              key={les.id} 
              className="relative bg-slate-900/30 border border-slate-850 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-800 transition-all group"
            >
              {/* Timeline dot indicator */}
              <div className={`absolute -left-[41px] w-4 h-4 rounded-full border-2 bg-slate-950 z-10 transition-transform group-hover:scale-125 ${
                les.status === "completed" 
                  ? "border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                  : les.status === "in-progress"
                    ? "border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                    : "border-slate-600"
              }`} />

              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h4 className="font-extrabold text-sm text-white tracking-tight group-hover:text-cyan-400 transition-colors">
                    {les.title}
                  </h4>
                  {getStatusBadge(les.status)}
                </div>
                <p className="text-slate-400 text-xs leading-relaxed max-w-3xl">
                  {les.description || "No specific lesson sub-chapter details provided."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 shrink-0 text-xs text-slate-500 font-mono">
                <span>Planned: {les.date}</span>
                
                {!isStudent && (
                  <button
                    onClick={() => {
                      setEditingId(les.id);
                      setTitle(les.title);
                      setDescription(les.description || "");
                      setStatus(les.status);
                      setDate(les.date);
                      setShowAddForm(true);
                      setError("");
                    }}
                    id={`edit-les-btn-${les.id}`}
                    className="p-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 rounded-xl transition-all cursor-pointer active:scale-95"
                    title="Modify milestone"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
