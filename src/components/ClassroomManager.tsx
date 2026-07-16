import React, { useState, useEffect } from "react";
import { User, Student } from "../types";
import { Plus, GraduationCap, Shield, UserPlus, BookOpen, Layers, CheckCircle2 } from "lucide-react";

interface ClassroomManagerProps {
  user: User;
  activeClassId: string;
  setActiveClassId: (id: string) => void;
}

export default function ClassroomManager({ user, activeClassId, setActiveClassId }: ClassroomManagerProps) {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Modals / Panels toggles
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);

  // Form Fields for new class
  const [className, setClassName] = useState("");
  const [classGrade, setClassGrade] = useState("Grade 10");
  const [classRoom, setClassRoom] = useState("");
  const [classSubject, setClassSubject] = useState("");

  // Form Fields for new student
  const [studentName, setStudentName] = useState("");
  const [studentRoll, setStudentRoll] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentParentName, setStudentParentName] = useState("");
  const [studentParentContact, setStudentParentContact] = useState("");

  const isStudent = user.role === "student";

  const fetchClassesAndRosters = () => {
    setLoading(true);
    fetch("/api/classes")
      .then((res) => res.json())
      .then((classesList) => {
        setClasses(classesList);
        if (classesList.length > 0 && !activeClassId) {
          setActiveClassId(classesList[0].id);
        }
      })
      .catch((err) => console.error("Error loading classes:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClassesAndRosters();
  }, []);

  useEffect(() => {
    if (!activeClassId) return;
    fetch(`/api/students?classId=${activeClassId}`)
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error("Error loading students:", err));
  }, [activeClassId]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStudent) return;

    if (!className || !classSubject) {
      setError("Class name and subject are required.");
      return;
    }

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: className,
          grade: classGrade,
          room: classRoom,
          subject: classSubject,
          teacherId: user.id,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to create class.");
      }

      setClassName("");
      setClassRoom("");
      setClassSubject("");
      setShowAddClass(false);
      setError("");
      fetchClassesAndRosters();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStudent) return;

    if (!studentName || !studentEmail) {
      setError("Student name and email are required.");
      return;
    }

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: studentName,
          rollNumber: studentRoll,
          email: studentEmail,
          classId: activeClassId,
          parentName: studentParentName,
          parentContact: studentParentContact,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to insert student.");
      }

      setStudentName("");
      setStudentRoll("");
      setStudentEmail("");
      setStudentParentName("");
      setStudentParentContact("");
      setShowAddStudent(false);
      setError("");
      
      // Reload current roster
      fetch(`/api/students?classId=${activeClassId}`)
        .then((res) => res.json())
        .then((data) => setStudents(data));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const selectedClass = classes.find((c) => c.id === activeClassId);

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight uppercase font-mono">Classes & Student Rosters</h2>
          <p className="text-slate-400 text-xs mt-1">
            {isStudent 
              ? "View registered peer directories and classroom channels." 
              : "Manage active academic streams, assign modules, and enroll students."}
          </p>
        </div>

        {/* Create Classroom buttons for non-students */}
        {!isStudent && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setShowAddClass(true); setShowAddStudent(false); setError(""); }}
              id="add-class-trigger"
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Class</span>
            </button>
            <button
              onClick={() => { setShowAddStudent(true); setShowAddClass(false); setError(""); }}
              id="add-student-trigger"
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Grid Layout containing Class Selection List and active Roster */}
      <div className="grid md:grid-cols-12 gap-6 items-start">
        
        {/* Classes Side Panel */}
        <div className="md:col-span-4 bg-slate-900/30 border border-slate-850 p-4 rounded-3xl space-y-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Academic Classrooms</span>
          
          <div className="space-y-2">
            {classes.map((cls) => {
              const isSelected = cls.id === activeClassId;
              return (
                <button
                  key={cls.id}
                  id={`class-card-${cls.id}`}
                  onClick={() => setActiveClassId(cls.id)}
                  className={`w-full text-left p-4 rounded-2xl transition-all border cursor-pointer ${
                    isSelected 
                      ? "bg-slate-900 border-cyan-500/40 shadow-lg shadow-cyan-500/5 text-white" 
                      : "bg-slate-950/40 hover:bg-slate-950/80 border-slate-850 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm">{cls.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">{cls.room}</span>
                  </div>
                  <span className="text-xs block mt-1 text-slate-400 font-medium truncate">{cls.subject}</span>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[9px] font-bold font-mono tracking-wide text-slate-500 uppercase">
                      {cls.grade}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Roster & Forms Workspace */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Create Class Panel */}
          {showAddClass && (
            <div id="add-class-form-panel" className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4 relative">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Layers className="w-4 h-4 text-violet-400" />
                  Configure New Classroom Stream
                </h3>
                <button 
                  onClick={() => setShowAddClass(false)}
                  className="text-slate-500 hover:text-white text-xs font-mono"
                >
                  [Cancel]
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Classroom Code *</label>
                  <input
                    type="text"
                    id="new-class-name"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="e.g. Class 10-A"
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Subject / Course *</label>
                  <input
                    type="text"
                    id="new-class-subject"
                    value={classSubject}
                    onChange={(e) => setClassSubject(e.target.value)}
                    placeholder="e.g. Advanced Quantum Mechanics"
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Grade Level</label>
                  <select
                    id="new-class-grade"
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none"
                  >
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Assigned Room</label>
                  <input
                    type="text"
                    id="new-class-room"
                    value={classRoom}
                    onChange={(e) => setClassRoom(e.target.value)}
                    placeholder="e.g. Lab 402"
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    id="new-class-submit-btn"
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Provision Class
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Create Student Panel */}
          {showAddStudent && (
            <div id="add-student-form-panel" className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4 relative">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-cyan-400" />
                  Enroll Student to {selectedClass ? selectedClass.name : ""}
                </h3>
                <button 
                  onClick={() => setShowAddStudent(false)}
                  className="text-slate-500 hover:text-white text-xs font-mono"
                >
                  [Cancel]
                </button>
              </div>

              <form onSubmit={handleAddStudent} className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Student Name *</label>
                  <input
                    type="text"
                    id="new-stud-name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Lucas Thorne"
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Roll Number / ID</label>
                  <input
                    type="text"
                    id="new-stud-roll"
                    value={studentRoll}
                    onChange={(e) => setStudentRoll(e.target.value)}
                    placeholder="e.g. 10A-04 (Optional)"
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Email Address *</label>
                  <input
                    type="email"
                    id="new-stud-email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="e.g. lucas@slate.com"
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 outline-none transition-all"
                    required
                  />
                  <span className="text-[9px] text-slate-500 font-mono italic">
                    Note: A secure account with password 'student' will automatically generate for student login.
                  </span>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Parent / Guardian Full Name</label>
                  <input
                    type="text"
                    id="new-stud-parent-name"
                    value={studentParentName}
                    onChange={(e) => setStudentParentName(e.target.value)}
                    placeholder="e.g. Helen Thorne"
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Parent Contact Number</label>
                  <input
                    type="text"
                    id="new-stud-parent-contact"
                    value={studentParentContact}
                    onChange={(e) => setStudentParentContact(e.target.value)}
                    placeholder="e.g. +1 (555) 019-3945"
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    id="new-stud-submit-btn"
                    className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Enroll Student
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Roster Listing */}
          <div className="bg-slate-900/20 border border-slate-850 rounded-3xl overflow-hidden">
            <div className="bg-slate-950/60 border-b border-slate-850 p-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Roster Directory</span>
                <h3 className="font-extrabold text-white text-base mt-0.5">
                  {selectedClass ? selectedClass.name : "Select a Classroom"}
                </h3>
              </div>
              <span className="px-3 py-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-slate-400">
                {students.length} Enrolled
              </span>
            </div>

            {students.length === 0 ? (
              <div className="py-20 text-center text-slate-500">
                <span className="text-sm">No students currently registered in this classroom stream.</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-850/50">
                {students.map((student) => (
                  <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-slate-400 font-bold font-mono text-sm">
                        {student.fullName.split(" ").map(w => w[0]).join("")}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-white block">{student.fullName}</span>
                        <span className="text-slate-500 text-xs block">{student.email}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:flex items-center gap-4 sm:gap-8">
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Roll #</span>
                        <span className="text-xs font-mono text-slate-300 font-bold">{student.rollNumber}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Parent / Guardian</span>
                        <span className="text-xs text-slate-400 block truncate max-w-[120px]">{student.parentName}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Parent Contact</span>
                        <span className="text-xs text-slate-400 block font-mono">{student.parentContact}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
