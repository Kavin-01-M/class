import React, { useState, useEffect } from "react";
import { User, Engagement } from "../types";
import { Activity, ShieldAlert, Award, Star, Compass, Save, CheckCircle2 } from "lucide-react";

interface EngagementTrackerProps {
  user: User;
  activeClassId: string;
}

export default function EngagementTracker({ user, activeClassId }: EngagementTrackerProps) {
  const [engagement, setEngagement] = useState<Engagement[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit fields for non-students
  const [participation, setParticipation] = useState(80);
  const [quizScore, setQuizScore] = useState(80);
  const [homework, setHomework] = useState(80);

  const isStudent = user.role === "student";

  const loadEngagement = () => {
    if (!activeClassId) return;
    fetch(`/api/engagement?classId=${activeClassId}`)
      .then((res) => res.json())
      .then((data) => setEngagement(data))
      .catch((err) => console.error("Error loading engagement:", err));
  };

  useEffect(() => {
    loadEngagement();
  }, [activeClassId]);

  const handleUpdateEngagement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStudent || !selectedStudentId) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/engagement/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          participationScore: participation,
          quizScore,
          homeworkCompletion: homework,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to commit engagement values.");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      setSelectedStudentId(null);
      loadEngagement();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getEngagementBadge = (level: string) => {
    if (level === "high") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          High Level
        </span>
      );
    }
    if (level === "medium") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
          Optimal Level
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse">
        Needs Action
      </span>
    );
  };

  // Student specific engagement info
  const myEng = engagement.find((e) => e.studentId === user.studentId);

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight uppercase font-mono">Cognitive Engagement Indexes</h2>
          <p className="text-slate-400 text-xs mt-1">
            {isStudent 
              ? "Monitor your class participation scores, home milestones, and general attendance indexes." 
              : "Review metrics reflecting student attentiveness, homework integrity, and attendance ratios."}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Engagement index logged and synced!</span>
        </div>
      )}

      {/* STUDENT INDIVIDUAL BENTO BOX LAYOUT */}
      {isStudent && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {myEng ? (
            <>
              {/* Card 1: Attendance Ratios */}
              <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Attendance Index</span>
                  <h4 className="text-3xl font-extrabold text-white mt-1">{myEng.attendanceRate}%</h4>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full mt-6 overflow-hidden">
                  <div 
                    className="bg-cyan-400 h-full rounded-full" 
                    style={{ width: `${myEng.attendanceRate}%` }} 
                  />
                </div>
              </div>

              {/* Card 2: Classroom Participation */}
              <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Attentiveness & Participation</span>
                  <h4 className="text-3xl font-extrabold text-indigo-400 mt-1">{myEng.participationScore}/100</h4>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full mt-6 overflow-hidden">
                  <div 
                    className="bg-indigo-400 h-full rounded-full" 
                    style={{ width: `${myEng.participationScore}%` }} 
                  />
                </div>
              </div>

              {/* Card 3: Quiz/Grade Averages */}
              <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Quiz & Graded Homeworks</span>
                  <h4 className="text-3xl font-extrabold text-emerald-400 mt-1">{myEng.quizScore}/100</h4>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full mt-6 overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full rounded-full" 
                    style={{ width: `${myEng.quizScore}%` }} 
                  />
                </div>
              </div>

              {/* Card 4: Homework Integrity */}
              <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Homework Completion Integrity</span>
                  <h4 className="text-3xl font-extrabold text-violet-400 mt-1">{myEng.homeworkCompletion}%</h4>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full mt-6 overflow-hidden">
                  <div 
                    className="bg-violet-400 h-full rounded-full" 
                    style={{ width: `${myEng.homeworkCompletion}%` }} 
                  />
                </div>
              </div>

              {/* Main Overall Summary Bento card */}
              <div className="sm:col-span-2 lg:col-span-4 bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">Analytical Level Breakdown</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
                    Your cognitive and behavioral participation rate ranks at <strong className="text-cyan-400">{myEng.engagementLevel.toUpperCase()}</strong>. Keep submitting assignments on time and actively responding during live question sessions to maintain or boost your academic tier.
                  </p>
                </div>
                <div className="shrink-0">
                  {getEngagementBadge(myEng.engagementLevel)}
                </div>
              </div>
            </>
          ) : (
            <div className="sm:col-span-2 lg:col-span-4 py-20 text-center text-slate-500 border border-slate-850 rounded-2xl bg-slate-900/10">
              <span className="text-sm font-mono italic">No custom engagement logs synced for your profile yet.</span>
            </div>
          )}
        </div>
      )}

      {/* TEACHER/ADMIN MANAGEMENT WORKSPACE */}
      {!isStudent && (
        <div className="grid md:grid-cols-12 gap-6 items-start">
          
          {/* Edit Panel (Conditional) */}
          {selectedStudentId && (
            <div id="edit-engagement-panel" className="md:col-span-4 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Modify Student Engagement Values
                </h3>
                <button 
                  onClick={() => setSelectedStudentId(null)}
                  className="text-slate-500 hover:text-white text-xs font-mono"
                >
                  [Cancel]
                </button>
              </div>

              <form onSubmit={handleUpdateEngagement} className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono uppercase">
                    <span>Attentiveness / Participation</span>
                    <span className="text-cyan-400">{participation}/100</span>
                  </div>
                  <input
                    type="range"
                    id="slider-participation"
                    value={participation}
                    onChange={(e) => setParticipation(Number(e.target.value))}
                    min="10"
                    max="100"
                    className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono uppercase">
                    <span>Quiz & Assignment Average</span>
                    <span className="text-emerald-400">{quizScore}/100</span>
                  </div>
                  <input
                    type="range"
                    id="slider-quiz"
                    value={quizScore}
                    onChange={(e) => setQuizScore(Number(e.target.value))}
                    min="10"
                    max="100"
                    className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono uppercase">
                    <span>Homework Integrity Rate</span>
                    <span className="text-violet-400">{homework}%</span>
                  </div>
                  <input
                    type="range"
                    id="slider-homework"
                    value={homework}
                    onChange={(e) => setHomework(Number(e.target.value))}
                    min="10"
                    max="100"
                    className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-violet-400"
                  />
                </div>

                <button
                  type="submit"
                  id="submit-engagement-btn"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? "Saving..." : "Commit Metrics"}</span>
                </button>
              </form>
            </div>
          )}

          {/* Roster list table */}
          <div className={`${selectedStudentId ? "md:col-span-8" : "md:col-span-12"} bg-slate-900/20 border border-slate-850 rounded-3xl overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-850">
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Student Name</th>
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono text-center">Attendance</th>
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono text-center">Participation</th>
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono text-center">Quiz Avg</th>
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono text-center">Homework</th>
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono text-center">Tier level</th>
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/50">
                  {engagement.map((eng) => (
                    <tr key={eng.id} className="hover:bg-slate-900/10 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-xs text-white block">{eng.studentName}</span>
                      </td>
                      <td className="p-4 text-center text-xs font-mono font-bold text-cyan-400">{eng.attendanceRate}%</td>
                      <td className="p-4 text-center text-xs font-mono text-slate-300">{eng.participationScore}/100</td>
                      <td className="p-4 text-center text-xs font-mono text-slate-300">{eng.quizScore}/100</td>
                      <td className="p-4 text-center text-xs font-mono text-slate-300">{eng.homeworkCompletion}%</td>
                      <td className="p-4 text-center">
                        {getEngagementBadge(eng.engagementLevel)}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          id={`edit-eng-trigger-${eng.studentId}`}
                          onClick={() => {
                            setSelectedStudentId(eng.studentId);
                            setParticipation(eng.participationScore);
                            setQuizScore(eng.quizScore);
                            setHomework(eng.homeworkCompletion);
                            setError("");
                          }}
                          className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-[10px] font-bold rounded-lg uppercase tracking-wider text-slate-300 hover:border-cyan-500/30 hover:text-cyan-400 transition-all cursor-pointer"
                        >
                          Modify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
