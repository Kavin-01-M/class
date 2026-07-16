import React, { useState, useEffect } from "react";
import { User, Student, Attendance } from "../types";
import { Check, X, AlertTriangle, Save, Calendar, Users, ClipboardCheck, ArrowUpRight } from "lucide-react";

interface AttendanceManagerProps {
  user: User;
  activeClassId: string;
  setActiveClassId: (id: string) => void;
}

export default function AttendanceManager({ user, activeClassId, setActiveClassId }: AttendanceManagerProps) {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<any>({});
  const [remarks, setRemarks] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  const isStudent = user.role === "student";

  // Fetch classes on mount
  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => {
        setClasses(data);
        if (data.length > 0 && !activeClassId) {
          // If student, let's auto-find their assigned class
          if (user.role === "student") {
            // we will fetch student info and get their classId
            fetch(`/api/students`)
              .then((r) => r.json())
              .then((studs) => {
                const me = studs.find((s: any) => s.id === user.studentId);
                if (me) {
                  setActiveClassId(me.classId);
                } else {
                  setActiveClassId(data[0].id);
                }
              });
          } else {
            setActiveClassId(data[0].id);
          }
        }
      })
      .catch((err) => console.error("Error fetching classes:", err));
  }, [activeClassId]);

  // Fetch students & attendance records whenever class or date changes
  useEffect(() => {
    if (!activeClassId) return;

    setLoading(true);
    setError("");

    // Fetch students of selected class
    const fetchStudents = fetch(`/api/students?classId=${activeClassId}`).then((res) => res.json());
    // Fetch attendance logs of selected class and date
    const fetchAttendance = fetch(`/api/attendance?classId=${activeClassId}&date=${selectedDate}`).then((res) => res.json());

    Promise.all([fetchStudents, fetchAttendance])
      .then(([studentsList, attendanceList]) => {
        setStudents(studentsList);

        // Build records map: studentId -> status ("present" | "absent" | "late")
        const recordsMap: any = {};
        const remarksMap: any = {};

        // Default all active class students to "present"
        studentsList.forEach((stud: Student) => {
          recordsMap[stud.id] = "present";
          remarksMap[stud.id] = "";
        });

        // Apply loaded attendance values
        attendanceList.forEach((att: Attendance) => {
          recordsMap[att.studentId] = att.status;
          remarksMap[att.studentId] = att.remarks || "";
        });

        setAttendanceRecords(recordsMap);
        setRemarks(remarksMap);
      })
      .catch((err) => {
        console.error("Error loading attendance records:", err);
        setError("Could not load rosters. Please verify database connection.");
      })
      .finally(() => setLoading(false));
  }, [activeClassId, selectedDate]);

  const handleStatusChange = (studentId: string, status: "present" | "absent" | "late") => {
    if (isStudent) return; // Strict lock for student login
    setAttendanceRecords((prev: any) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleRemarkChange = (studentId: string, value: string) => {
    if (isStudent) return; // Strict lock for student login
    setRemarks((prev: any) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleSaveAttendance = async () => {
    if (isStudent) return; // Guard clause

    setLoading(true);
    setSaveSuccess(false);
    setError("");

    const recordsArray = Object.keys(attendanceRecords).map((studentId) => ({
      studentId,
      status: attendanceRecords[studentId],
      remarks: remarks[studentId] || "",
    }));

    try {
      const res = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: activeClassId,
          date: selectedDate,
          records: recordsArray,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to submit attendance logs.");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Metrics calculations
  const totalRosterCount = students.length;
  const presentCount = Object.values(attendanceRecords).filter((s) => s === "present").length;
  const lateCount = Object.values(attendanceRecords).filter((s) => s === "late").length;
  const absentCount = Object.values(attendanceRecords).filter((s) => s === "absent").length;
  const presentRate = totalRosterCount > 0 ? Math.round(((presentCount + lateCount) / totalRosterCount) * 100) : 0;

  const activeClass = classes.find((c) => c.id === activeClassId);

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight uppercase font-mono">Attendance Roster Manager</h2>
          <p className="text-slate-400 text-xs mt-1">
            {isStudent 
              ? "View attendance logs and class statistics." 
              : "Mark, edit, and audit daily student attendance logs."}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1">Select Classroom</span>
            <select
              id="attendance-class-select"
              value={activeClassId}
              onChange={(e) => setActiveClassId(e.target.value)}
              className="bg-slate-950 border border-slate-800 focus:border-cyan-500/40 text-xs py-2 px-3 rounded-xl text-slate-100 outline-none"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.subject})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1">Target Date</span>
            <div className="relative">
              <input
                type="date"
                id="attendance-date-select"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-950 border border-slate-800 focus:border-cyan-500/40 text-xs py-2 px-3 rounded-xl text-slate-100 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Class Size</span>
            <h4 className="text-2xl font-extrabold text-white mt-1">{totalRosterCount}</h4>
          </div>
          <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Attendance Rate</span>
            <h4 className="text-2xl font-extrabold text-emerald-400 mt-1">{presentRate}%</h4>
          </div>
          <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
            <ClipboardCheck className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Late Cohort</span>
            <h4 className="text-2xl font-extrabold text-amber-400 mt-1">{lateCount}</h4>
          </div>
          <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Absentees</span>
            <h4 className="text-2xl font-extrabold text-rose-400 mt-1">{absentCount}</h4>
          </div>
          <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
            <X className="w-5 h-5 text-rose-400" />
          </div>
        </div>
      </div>

      {/* Roster Table List */}
      <div className="bg-slate-900/20 border border-slate-850 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
            <span className="text-slate-500 text-xs font-mono">Loading class logs...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <span className="text-sm">No student rosters linked to this class.</span>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-850">
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Student Profile</th>
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Roll #</th>
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Status Selection</th>
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Remarks / Explanations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60">
                  {students.map((student) => {
                    const status = attendanceRecords[student.id] || "present";
                    const isMyRow = isStudent && student.id === user.studentId;

                    return (
                      <tr 
                        key={student.id} 
                        className={`hover:bg-slate-900/10 transition-colors ${
                          isMyRow ? "bg-cyan-500/5 border-l-2 border-l-cyan-500" : ""
                        }`}
                      >
                        <td className="p-4">
                          <div>
                            <span className="font-bold text-sm text-white flex items-center gap-1.5">
                              {student.fullName}
                              {isMyRow && (
                                <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[9px] text-cyan-400 uppercase tracking-wider font-mono">
                                  You
                                </span>
                              )}
                            </span>
                            <span className="text-slate-500 text-xs block">{student.email}</span>
                          </div>
                        </td>
                        <td className="p-4 text-xs font-mono text-slate-400">{student.rollNumber}</td>
                        <td className="p-4">
                          {isStudent ? (
                            /* Student View - Read Only */
                            <div className="flex gap-2">
                              {status === "present" && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg uppercase tracking-wider">
                                  <Check className="w-3.5 h-3.5" /> Present
                                </span>
                              )}
                              {status === "absent" && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-lg uppercase tracking-wider">
                                  <X className="w-3.5 h-3.5" /> Absent
                                </span>
                              )}
                              {status === "late" && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-lg uppercase tracking-wider">
                                  <AlertTriangle className="w-3.5 h-3.5" /> Tardy / Late
                                </span>
                              )}
                            </div>
                          ) : (
                            /* Teacher/Admin View - Fully Interactive */
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                id={`status-p-${student.id}`}
                                onClick={() => handleStatusChange(student.id, "present")}
                                className={`px-3 py-1.5 text-xs font-extrabold uppercase rounded-xl border transition-all cursor-pointer ${
                                  status === "present"
                                    ? "bg-emerald-500 text-slate-950 border-emerald-500"
                                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
                                }`}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                id={`status-l-${student.id}`}
                                onClick={() => handleStatusChange(student.id, "late")}
                                className={`px-3 py-1.5 text-xs font-extrabold uppercase rounded-xl border transition-all cursor-pointer ${
                                  status === "late"
                                    ? "bg-amber-500 text-slate-950 border-amber-500"
                                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
                                }`}
                              >
                                Late
                              </button>
                              <button
                                type="button"
                                id={`status-a-${student.id}`}
                                onClick={() => handleStatusChange(student.id, "absent")}
                                className={`px-3 py-1.5 text-xs font-extrabold uppercase rounded-xl border transition-all cursor-pointer ${
                                  status === "absent"
                                    ? "bg-rose-500 text-slate-950 border-rose-500"
                                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
                                }`}
                              >
                                Absent
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <input
                            type="text"
                            id={`remarks-${student.id}`}
                            value={remarks[student.id] || ""}
                            onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                            disabled={isStudent}
                            placeholder={isStudent ? "No logged reason" : "Add remark/reason..."}
                            className={`w-full max-w-xs bg-slate-950/50 border border-slate-800 text-xs py-2 px-3 rounded-xl text-white outline-none placeholder-slate-600 transition-all ${
                              isStudent ? "border-transparent text-slate-400 bg-transparent px-0 py-0" : "focus:border-cyan-500/40"
                            }`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Save Section (Hidden for Students) */}
            {!isStudent && (
              <div className="p-4 bg-slate-950/60 border-t border-slate-850 flex justify-between items-center flex-wrap gap-3">
                <span className="text-xs text-slate-400">
                  Carefully audit records before committing. Updates will affect active engagement levels.
                </span>
                
                <div className="flex items-center gap-3">
                  {saveSuccess && (
                    <span className="text-xs text-emerald-400 font-bold font-mono">
                      Attendance saved successfully!
                    </span>
                  )}
                  {error && (
                    <span className="text-xs text-rose-400 font-bold font-mono">
                      {error}
                    </span>
                  )}
                  <button
                    onClick={handleSaveAttendance}
                    id="save-attendance-btn"
                    disabled={loading}
                    className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? "Saving..." : "Commit Attendance"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
