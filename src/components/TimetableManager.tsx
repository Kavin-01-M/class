import React, { useState, useEffect } from "react";
import { User, Timetable } from "../types";
import { Plus, Calendar, Clock, MapPin, UserCheck, Save } from "lucide-react";

interface TimetableManagerProps {
  user: User;
  activeClassId: string;
}

export default function TimetableManager({ user, activeClassId }: TimetableManagerProps) {
  const [timetable, setTimetable] = useState<Timetable[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [day, setDay] = useState("Monday");
  const [period, setPeriod] = useState("09:00 AM - 10:30 AM");
  const [subject, setSubject] = useState("");
  const [room, setRoom] = useState("");
  const [teacherName, setTeacherName] = useState("");

  const isStudent = user.role === "student";
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const loadTimetable = () => {
    if (!activeClassId) return;
    fetch(`/api/timetable?classId=${activeClassId}`)
      .then((res) => res.json())
      .then((data) => setTimetable(data))
      .catch((err) => console.error("Error fetching timetable:", err));
  };

  useEffect(() => {
    loadTimetable();
  }, [activeClassId]);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStudent) return;

    if (!subject || !period || !teacherName) {
      setError("Subject, period, and teacher name are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: activeClassId,
          day,
          period,
          subject,
          room: room || "TBD",
          teacherName,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to create timetable slot.");
      }

      setSubject("");
      setRoom("");
      setTeacherName("");
      setShowAddForm(false);
      loadTimetable();
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
          <h2 className="text-xl font-extrabold text-white tracking-tight uppercase font-mono">Academic Timetable Schedule</h2>
          <p className="text-slate-400 text-xs mt-1">
            {isStudent 
              ? "View your weekly subject schedule and assigned classrooms." 
              : "Manage, schedule, and align classroom timetables and teachers."}
          </p>
        </div>

        {!isStudent && (
          <button
            onClick={() => { setShowAddForm(!showAddForm); setError(""); }}
            id="add-timetable-trigger"
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Slot</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Add Slot Form Panel */}
      {showAddForm && !isStudent && (
        <div id="add-timetable-panel" className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            Schedule Timetable Slot
          </h3>
          <form onSubmit={handleAddEntry} className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Day of Week</label>
              <select
                id="tt-day-select"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none"
              >
                {daysOfWeek.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Period / Time Slot *</label>
              <input
                type="text"
                id="tt-period-input"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="e.g. 09:00 AM - 10:30 AM"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-white outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Subject Name *</label>
              <input
                type="text"
                id="tt-subject-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Organic Biochemistry"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-white outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Assigned Room</label>
              <input
                type="text"
                id="tt-room-input"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. Lab 402"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-white outline-none transition-all"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Instructor Name *</label>
              <input
                type="text"
                id="tt-teacher-input"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="e.g. Marcus Brody"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-white outline-none transition-all"
                required
              />
            </div>
            <div className="sm:col-span-2 md:col-span-3 pt-2">
              <button
                type="submit"
                id="tt-submit-btn"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
              >
                {loading ? "Scheduling..." : "Save Timetable Slot"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Timetable Agenda Layout */}
      <div className="grid md:grid-cols-5 gap-4">
        {daysOfWeek.map((currentDay) => {
          const slots = timetable.filter((t) => t.day.toLowerCase() === currentDay.toLowerCase());
          return (
            <div 
              key={currentDay} 
              className="bg-slate-900/20 border border-slate-850 rounded-2xl p-4 flex flex-col space-y-4"
            >
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">{currentDay}</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-950 text-[9px] font-bold font-mono text-slate-500">
                  {slots.length} Slots
                </span>
              </div>

              <div className="flex-1 space-y-3">
                {slots.length === 0 ? (
                  <div className="py-8 text-center text-slate-600 text-[11px] font-mono italic">
                    Free Day
                  </div>
                ) : (
                  slots.map((slot) => (
                    <div 
                      key={slot.id} 
                      className="bg-slate-950/60 border border-slate-900 rounded-xl p-3 space-y-2 hover:border-cyan-500/20 transition-all group"
                    >
                      <div className="flex items-center gap-1.5 text-[9px] text-cyan-400 font-mono">
                        <Clock className="w-3 h-3 text-cyan-500" />
                        <span>{slot.period}</span>
                      </div>
                      <h4 className="font-bold text-xs text-white tracking-tight">{slot.subject}</h4>
                      
                      <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500">
                        <span className="flex items-center gap-1 font-mono">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {slot.room}
                        </span>
                        <span className="font-medium flex items-center gap-1 text-slate-400">
                          <UserCheck className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span className="truncate max-w-[80px]">{slot.teacherName.split(" ").pop()}</span>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
