import React, { useState, useEffect } from "react";
import { User, Assignment, Submission } from "../types";
import { Plus, BookOpen, Clock, CheckCircle2, UserCheck, Edit3, Send, ShieldAlert, Award } from "lucide-react";

interface AssignmentManagerProps {
  user: User;
  activeClassId: string;
}

export default function AssignmentManager({ user, activeClassId }: AssignmentManagerProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Assignment Creation Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxPoints, setMaxPoints] = useState(100);

  // Student Submission Form
  const [selectedAsmId, setSelectedAsmId] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [essayContent, setEssayContent] = useState("");

  // Teacher Grading Form
  const [gradingAsmId, setGradingAsmId] = useState<string | null>(null);
  const [gradingStudentId, setGradingStudentId] = useState<string | null>(null);
  const [gradeValue, setGradeValue] = useState("");
  const [commentsValue, setCommentsValue] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNote, setAiNote] = useState("");

  const isStudent = user.role === "student";

  const handleAiGradeEvaluate = async () => {
    if (!gradingAsmId || !gradingStudentId) return;
    setAiLoading(true);
    setAiNote("");
    setError("");

    try {
      const res = await fetch(`/api/assignments/${gradingAsmId}/ai-grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: gradingStudentId }),
      });

      if (!res.ok) {
        throw new Error("Could not fetch automated AI grading assessment.");
      }

      const data = await res.json();
      if (data.success) {
        setGradeValue(String(data.recommendedScore));
        setCommentsValue(data.comments);
        setAiNote(`AI Assistant successfully analyzed the homework. Recommended score: ${data.recommendedScore} points.`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to scan submission with AI.");
    } finally {
      setAiLoading(false);
    }
  };

  const loadAssignments = () => {
    fetch("/api/assignments")
      .then((res) => res.json())
      .then((data) => {
        // Filter by current active class
        const filtered = data.filter((a: any) => a.classId === activeClassId);
        setAssignments(filtered);
      })
      .catch((err) => console.error("Error loading assignments:", err));
  };

  useEffect(() => {
    loadAssignments();
  }, [activeClassId]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStudent) return;

    if (!title || !dueDate) {
      setError("Title and due date are required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          classId: activeClassId,
          dueDate,
          maxPoints,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to catalog homework assignment.");
      }

      setTitle("");
      setDescription("");
      setDueDate("");
      setMaxPoints(100);
      setShowAddForm(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      loadAssignments();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStudent || !selectedAsmId) return;

    if (!fileName || !essayContent) {
      setError("Please input a file name and paste your essay contents.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`/api/assignments/${selectedAsmId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user.studentId,
          studentName: user.fullName,
          fileName,
          content: essayContent,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to upload submission.");
      }

      setFileName("");
      setEssayContent("");
      setSelectedAsmId(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      loadAssignments();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStudent || !gradingAsmId || !gradingStudentId) return;

    if (gradeValue === "") {
      setError("Please input a valid score.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/assignments/${gradingAsmId}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: gradingStudentId,
          grade: Number(gradeValue),
          comments: commentsValue,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to submit student grade.");
      }

      setGradeValue("");
      setCommentsValue("");
      setGradingAsmId(null);
      setGradingStudentId(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      loadAssignments();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight uppercase font-mono">Homework Assignments Panel</h2>
          <p className="text-slate-400 text-xs mt-1">
            {isStudent 
              ? "Submit homework files, monitor deadlines, and view graded score returns." 
              : "Review rosters, provision weekly quizzes, and evaluate submitted homework."}
          </p>
        </div>

        {!isStudent && (
          <button
            onClick={() => { setShowAddForm(!showAddForm); setError(""); }}
            id="add-assignment-trigger"
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Homework</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Action completed successfully!</span>
        </div>
      )}

      {/* 1. Create Assignment Form (Teachers/Admins) */}
      {showAddForm && !isStudent && (
        <div id="create-assignment-panel" className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            Provision Homework Assignment
          </h3>
          <form onSubmit={handleCreateAssignment} className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Assignment Title *</label>
              <input
                type="text"
                id="asm-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Double-Slit Quantum Physics Essay"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-white outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Maximum Points</label>
              <input
                type="number"
                id="asm-points-input"
                value={maxPoints}
                onChange={(e) => setMaxPoints(Number(e.target.value))}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-white outline-none"
                min="10"
                max="500"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Due Date *</label>
              <input
                type="date"
                id="asm-due-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-white outline-none"
                required
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Task Description & Instructions</label>
              <textarea
                id="asm-desc-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste homework questions, rubrics, and submission guidelines..."
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2.5 px-3 text-xs text-white outline-none h-24 resize-none"
              />
            </div>
            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                id="asm-submit-btn"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
              >
                {loading ? "Cataloging..." : "Release Homework Assignment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Student Submission Form Modal/Panel */}
      {selectedAsmId && isStudent && (
        <div id="student-submission-panel" className="bg-slate-900 border border-cyan-500/20 p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Send className="w-4 h-4 text-cyan-400 animate-bounce" />
              Upload Assignment Worksheets
            </h3>
            <button 
              onClick={() => setSelectedAsmId(null)}
              className="text-slate-500 hover:text-white text-xs font-mono"
            >
              [Cancel]
            </button>
          </div>

          <form onSubmit={handleSubmitAssignment} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">File Name *</label>
              <input
                type="text"
                id="sub-filename-input"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. Sarah_Quantum_Essay_v1.pdf"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-white outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Essay Content / Solution Text *</label>
              <textarea
                id="sub-content-input"
                value={essayContent}
                onChange={(e) => setEssayContent(e.target.value)}
                placeholder="Type your essay summary, solve equations, or paste homework markdown solutions here..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2.5 px-3 text-xs text-white outline-none h-32 resize-none"
                required
              />
            </div>
            <button
              type="submit"
              id="sub-submit-btn"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
            >
              {loading ? "Uploading..." : "Transmit Solution to Teacher"}
            </button>
          </form>
        </div>
      )}

      {/* 3. Teacher Grading Form Modal/Panel */}
      {gradingAsmId && gradingStudentId && !isStudent && (() => {
        const selectedAsm = assignments.find(a => a.id === gradingAsmId);
        const selectedSub = selectedAsm?.submissions.find(s => s.studentId === gradingStudentId);

        return (
          <div id="teacher-grading-panel" className="bg-slate-900 border border-violet-500/20 p-6 rounded-3xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Award className="w-4 h-4 text-violet-400" />
                Evaluate & Grade Student Homework
              </h3>
              <button 
                onClick={() => { setGradingAsmId(null); setGradingStudentId(null); setAiNote(""); }}
                className="text-slate-500 hover:text-white text-xs font-mono"
              >
                [Cancel]
              </button>
            </div>

            {/* Display Full Submission Details */}
            {selectedSub && (
              <div className="space-y-2 bg-slate-950/70 p-4 rounded-2xl border border-slate-850">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 text-[11px] font-mono border-b border-slate-900 pb-2">
                  <div>
                    <span className="text-slate-500">Student: </span>
                    <strong className="text-white">{selectedSub.studentName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Submitted: </span>
                    <span className="text-slate-300">{new Date(selectedSub.submittedAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  <span>File Name: </span>
                  <span className="text-cyan-400">{selectedSub.fileName}</span>
                </div>
                <div className="mt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block mb-1">Student Answer / Essay Contents:</span>
                  <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl max-h-60 overflow-y-auto text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {selectedSub.content}
                  </div>
                </div>
              </div>
            )}

            {/* AI Smart Grader Helper Row */}
            <div className="bg-gradient-to-r from-violet-950/20 to-indigo-950/20 border border-violet-500/10 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                  ✨ AI Grading Assistant
                </span>
                <p className="text-slate-400 text-[10px]">
                  Use Slate's Gemini Smart-Grader to assess homework content, draft comments, and suggest a rubric score.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAiGradeEvaluate}
                disabled={aiLoading}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shrink-0 transition-all active:scale-95"
              >
                {aiLoading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </span>
                ) : (
                  <span>Scan with AI Smart-Grader</span>
                )}
              </button>
            </div>

            {aiNote && (
              <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs rounded-xl flex items-center gap-2">
                <span>💡 {aiNote}</span>
              </div>
            )}

            <form onSubmit={handleGradeSubmission} className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Assigned Score * (Out of {selectedAsm?.maxPoints || 100})</label>
                <input
                  type="number"
                  id="grade-score-input"
                  value={gradeValue}
                  onChange={(e) => setGradeValue(e.target.value)}
                  placeholder={`e.g. 90`}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-white outline-none font-mono"
                  required
                  min="0"
                  max={selectedAsm?.maxPoints || 100}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Pedagogical Feedback & Comments</label>
                <textarea
                  id="grade-comment-input"
                  value={commentsValue}
                  onChange={(e) => setCommentsValue(e.target.value)}
                  placeholder="Write constructive advice, pointing out highlights or parts needing revision..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2.5 px-3 text-xs text-white outline-none h-24 resize-none"
                />
              </div>
              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  id="grade-submit-btn"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
                >
                  {loading ? "Recording Score..." : "Commit Grade Record"}
                </button>
              </div>
            </form>
          </div>
        );
      })()}

      {/* Assignment List */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="py-20 text-center bg-slate-900/10 border border-slate-850 rounded-3xl text-slate-500">
            <span className="text-sm">No assignments posted for this classroom stream.</span>
          </div>
        ) : (
          assignments.map((asm) => {
            const studentSub = asm.submissions.find((s) => s.studentId === user.studentId);
            
            return (
              <div 
                key={asm.id} 
                className="bg-slate-900/30 border border-slate-850 rounded-2xl p-6 space-y-4 hover:border-slate-800 transition-all"
              >
                {/* Header Information */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-4">
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-white text-base tracking-tight">{asm.title}</h4>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-2xl">{asm.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400">
                      <Clock className="w-4 h-4" />
                      <span>Due: {asm.dueDate}</span>
                    </div>
                    <div className="px-2.5 py-1 bg-slate-950 rounded-xl border border-slate-850 text-xs font-mono text-slate-300">
                      Max: {asm.maxPoints} Points
                    </div>
                  </div>
                </div>

                {/* Submissions Section */}
                <div>
                  {isStudent ? (
                    /* STUDENT STATUS BLOCK */
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-950/60 border border-slate-850/60 rounded-xl">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Submission Status</span>
                        {studentSub ? (
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Transmitted
                            </span>
                            <span className="text-slate-500 text-[10px] font-mono">({new Date(studentSub.submittedAt).toLocaleDateString()})</span>
                          </div>
                        ) : (
                          <span className="text-xs text-rose-400 font-bold block mt-1">Pending Solution Upload</span>
                        )}
                      </div>

                      {studentSub && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Grade Outcome</span>
                          <span className="text-sm font-bold block mt-0.5">
                            {studentSub.grade !== null ? (
                              <span className="text-cyan-400">{studentSub.grade} / {asm.maxPoints}</span>
                            ) : (
                              <span className="text-slate-500 italic">Awaiting teacher audit</span>
                            )}
                          </span>
                        </div>
                      )}

                      {studentSub?.comments && (
                        <div className="max-w-xs">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Pedagogical Advice</span>
                          <span className="text-xs text-slate-400 block mt-0.5 leading-relaxed truncate">{studentSub.comments}</span>
                        </div>
                      )}

                      {!studentSub && (
                        <button
                          onClick={() => { setSelectedAsmId(asm.id); setError(""); }}
                          id={`submit-trigger-${asm.id}`}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Submit Assignment</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    /* TEACHER ACTIVE AUDIT AREA */
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block">
                        Student Submissions ({asm.submissions.length})
                      </span>

                      {asm.submissions.length === 0 ? (
                        <div className="p-4 text-center bg-slate-950/20 rounded-xl border border-slate-850/40 text-slate-500 text-xs font-mono italic">
                          No solutions uploaded yet by student rosters.
                        </div>
                      ) : (
                        <div className="grid gap-2">
                          {asm.submissions.map((sub) => (
                            <div 
                              key={sub.studentId} 
                              className="p-4 bg-slate-950/40 border border-slate-850/60 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                              <div>
                                <span className="font-bold text-xs text-white block">{sub.studentName}</span>
                                <span className="text-slate-500 text-[10px] block font-mono">File: {sub.fileName} | Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                                <div className="mt-2 p-2 bg-slate-950 rounded-lg text-[11px] text-slate-400 font-mono italic max-w-xl truncate">
                                  "{sub.content}"
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 shrink-0">
                                <div>
                                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Grade</span>
                                  {sub.grade !== null ? (
                                    <span className="text-xs font-extrabold text-cyan-400 font-mono">{sub.grade} / {asm.maxPoints}</span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-rose-400 uppercase font-mono tracking-wider">[Ungraded]</span>
                                  )}
                                </div>

                                <button
                                  onClick={() => {
                                    setGradingAsmId(asm.id);
                                    setGradingStudentId(sub.studentId);
                                    setGradeValue(sub.grade !== null ? String(sub.grade) : "");
                                    setCommentsValue(sub.comments || "");
                                    setError("");
                                  }}
                                  id={`grade-trigger-${asm.id}-${sub.studentId}`}
                                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-violet-500/40 hover:bg-slate-850 text-[10px] font-bold rounded-lg uppercase tracking-wider text-slate-300 transition-all cursor-pointer"
                                >
                                  {sub.grade !== null ? "Re-evaluate" : "Grade Task"}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
