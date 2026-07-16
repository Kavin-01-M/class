import React, { useState, useEffect } from "react";
import { User } from "../types";
import { 
  LogOut, 
  Calendar, 
  GraduationCap, 
  BookOpen, 
  Layers, 
  Activity, 
  BrainCircuit, 
  FolderDown, 
  ClipboardCheck, 
  Menu, 
  X, 
  UserCircle2, 
  Clock 
} from "lucide-react";

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export default function DashboardLayout({ 
  user, 
  onLogout, 
  activeTab, 
  setActiveTab, 
  children 
}: DashboardLayoutProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getRoleColor = (role: string) => {
    if (role === "admin") return "from-violet-500/10 to-purple-500/10 text-purple-400 border-purple-500/20";
    if (role === "teacher") return "from-emerald-500/10 to-teal-500/10 text-emerald-400 border-emerald-500/20";
    return "from-cyan-500/10 to-indigo-500/10 text-cyan-400 border-cyan-500/20";
  };

  const navItems = [
    { id: "attendance", name: "Attendance Logs", icon: ClipboardCheck, roles: ["admin", "teacher", "student"] },
    { id: "classes", name: "Classes & Rosters", icon: GraduationCap, roles: ["admin", "teacher", "student"] },
    { id: "timetable", name: "Timetable Schedule", icon: Calendar, roles: ["admin", "teacher", "student"] },
    { id: "materials", name: "Materials Hub", icon: FolderDown, roles: ["admin", "teacher", "student"] },
    { id: "assignments", name: "Homework Assignments", icon: BookOpen, roles: ["admin", "teacher", "student"] },
    { id: "lessons", name: "Lesson Milestone", icon: Layers, roles: ["admin", "teacher", "student"] },
    { id: "engagement", name: "Engagement Level", icon: Activity, roles: ["admin", "teacher", "student"] },
    { id: "ai-analytics", name: "AI Analytics Hub", icon: BrainCircuit, roles: ["admin", "teacher", "student"] },
  ];

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col md:flex-row overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-slate-950 font-bold text-lg">
            S
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">SLATE</span>
        </div>
        <button 
          id="mobile-sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 text-slate-400 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar - responsive drawers */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800/80 p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex-shrink-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div>
          {/* Header Branding */}
          <div className="hidden md:flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-slate-950 font-bold text-lg shadow-lg shadow-cyan-500/10">
              S
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">SLATE</span>
              <span className="text-[9px] block text-cyan-400 font-mono tracking-widest font-bold -mt-1 uppercase">Smart OS</span>
            </div>
          </div>

          {/* User Profile Summary */}
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <UserCircle2 className="w-10 h-10 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-white truncate">{user.fullName}</h3>
                <p className="text-slate-500 text-[11px] truncate">{user.email}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/50 flex justify-between items-center">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-gradient-to-r ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer group uppercase tracking-wider
                    ${isActive 
                      ? "bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 text-cyan-400 border border-cyan-500/20" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-950/35 border border-transparent"}
                  `}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout Action */}
        <div className="pt-4 border-t border-slate-800/60">
          <button
            onClick={onLogout}
            id="sidebar-logout-btn"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/15 text-rose-400 hover:text-rose-300 text-xs font-bold rounded-xl transition-all uppercase tracking-wider cursor-pointer active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Container Workspace */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
      
    </div>
  );
}
