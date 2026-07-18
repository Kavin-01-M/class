import React, { useState } from "react";
import { motion } from "motion/react";
import { Shield, BookOpen, GraduationCap, Mail, Lock, UserPlus, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { User } from "../types";

interface LoginProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState<"admin" | "teacher" | "student">("student");
  
  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Registration fields
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regParentName, setRegParentName] = useState("");
  const [regParentContact, setRegParentContact] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("c1");
  
  const [classes, setClasses] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch classes on mount for registration select dropdown
  React.useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => {
        setClasses(data);
        if (data.length > 0) setSelectedClassId(data[0].id);
      })
      .catch((err) => console.error("Error fetching classes:", err));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed.");
      }

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName || !regEmail || !regPassword) {
      setError("Please fill in required fields (Name, Email, Password).");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: regFullName,
          email: regEmail,
          password: regPassword,
          role,
          classId: role === "student" ? selectedClassId : undefined,
          parentName: role === "student" ? regParentName : undefined,
          parentContact: role === "student" ? regParentContact : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      setSuccessMsg("Account created successfully! Auto-logging in...");
      setTimeout(() => {
        onLoginSuccess(data.user, data.token);
      }, 1200);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (type: "admin" | "teacher" | "student") => {
    setError("");
    if (type === "admin") {
      setEmail("admin@slate.com");
      setPassword("admin");
    } else if (type === "teacher") {
      setEmail("teacher@slate.com");
      setPassword("teacher");
    } else {
      setEmail("student@slate.com");
      setPassword("student");
    }
  };

  return (
    <div id="login-container" className="relative min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 overflow-hidden font-sans text-slate-100">
      {/* Background ambient light effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-900/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-900/10 blur-[120px]" />

      <div className="w-full max-w-5xl grid md:grid-cols-12 bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl relative z-10">
        
        {/* Left Side: Dynamic Branding Context Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 md:p-12 flex flex-col justify-between border-r border-slate-800/80 relative">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-slate-950 font-bold text-xl shadow-lg shadow-cyan-500/20">
                S
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-tight text-white">SLATE</span>
                <span className="text-[10px] block text-cyan-400 font-mono tracking-widest font-bold -mt-1 uppercase">Smart OS</span>
              </div>
            </div>

            <div className="space-y-6 mt-12">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Empowering <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Classrooms with AI</span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                An advanced educational operating system linking administrators, educators, and pupils in a singular, intelligent workspace.
              </p>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Developed By KavinM</span>
            </div>
            
            {/* Quick-Select Seed Accounts for Easy Navigation */}
            <div className="bg-slate-950/60 border border-slate-800/50 p-4 rounded-2xl space-y-3">
              <span className="text-[11px] font-bold text-slate-400 font-mono tracking-wider block uppercase">Instant Credentials Setup</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="fill-admin-btn"
                  onClick={() => fillCredentials("admin")}
                  className="px-2 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-violet-500/40 text-xs rounded-xl font-medium transition-all text-slate-300 flex flex-col items-center gap-1 group active:scale-95 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-violet-400 group-hover:scale-110 transition-transform" />
                  <span>Admin</span>
                </button>
                <button
                  type="button"
                  id="fill-teacher-btn"
                  onClick={() => fillCredentials("teacher")}
                  className="px-2 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 text-xs rounded-xl font-medium transition-all text-slate-300 flex flex-col items-center gap-1 group active:scale-95 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Teacher</span>
                </button>
                <button
                  type="button"
                  id="fill-student-btn"
                  onClick={() => fillCredentials("student")}
                  className="px-2 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-xs rounded-xl font-medium transition-all text-slate-300 flex flex-col items-center gap-1 group active:scale-95 cursor-pointer"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span>Student</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Login / Register Panel */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-slate-900/20">
          
          <div className="mb-8">
            <div className="flex gap-4 border-b border-slate-800 pb-2 mb-6">
              <button
                type="button"
                id="toggle-login-view"
                onClick={() => { setIsRegistering(false); setError(""); setSuccessMsg(""); }}
                className={`pb-2 text-sm font-bold tracking-wide uppercase transition-all relative ${
                  !isRegistering ? "text-white" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Sign In
                {!isRegistering && (
                  <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
                )}
              </button>
              <button
                type="button"
                id="toggle-register-view"
                onClick={() => { setIsRegistering(true); setError(""); setSuccessMsg(""); }}
                className={`pb-2 text-sm font-bold tracking-wide uppercase transition-all relative ${
                  isRegistering ? "text-white" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Create Account
                {isRegistering && (
                  <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
                )}
              </button>
            </div>

            <p className="text-slate-400 text-xs">
              {isRegistering 
                ? "Register a new smart educational credential to join your active class." 
                : "Select or type credentials to securely access your workspace."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Area */}
          {!isRegistering ? (
            /* Sign In Form */
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    id="login-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. student@slate.com"
                    className="w-full bg-slate-950/60 border border-slate-800/80 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all font-sans"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    id="login-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your security password"
                    className="w-full bg-slate-950/60 border border-slate-800/80 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="login-submit-btn"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2 hover:shadow-cyan-500/20 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50 mt-8 text-sm uppercase tracking-wider"
              >
                {loading ? "Authenticating..." : "Access Workspace"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950/50 rounded-xl border border-slate-800/60 mb-2">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    role === "student" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole("teacher")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    role === "teacher" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Teacher
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    role === "admin" ? "bg-violet-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Full Name *</label>
                <input
                  type="text"
                  id="reg-name-input"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Sarah Jenkins"
                  className="w-full bg-slate-950/60 border border-slate-800/80 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 rounded-xl py-2.5 px-4 text-xs text-white placeholder-slate-600 outline-none transition-all"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Email Address *</label>
                  <input
                    type="email"
                    id="reg-email-input"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="student@slate.com"
                    className="w-full bg-slate-950/60 border border-slate-800/80 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 rounded-xl py-2.5 px-4 text-xs text-white placeholder-slate-600 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Security Password *</label>
                  <input
                    type="password"
                    id="reg-password-input"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a robust password"
                    className="w-full bg-slate-950/60 border border-slate-800/80 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 rounded-xl py-2.5 px-4 text-xs text-white placeholder-slate-600 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Conditional fields based on Student Role */}
              {role === "student" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 pt-2 border-t border-slate-800/60 mt-2"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Select Active Class *</label>
                    <select
                      id="reg-class-select"
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800/80 focus:border-cyan-500/60 rounded-xl py-2.5 px-4 text-xs text-slate-200 outline-none"
                    >
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id} className="bg-slate-950 text-white">
                          {cls.name} ({cls.subject})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Parent / Guardian Name</label>
                      <input
                        type="text"
                        id="reg-parent-name"
                        value={regParentName}
                        onChange={(e) => setRegParentName(e.target.value)}
                        placeholder="John Jenkins"
                        className="w-full bg-slate-950/60 border border-slate-800/80 focus:border-cyan-500/60 rounded-xl py-2.5 px-4 text-xs text-white placeholder-slate-600 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Parent Contact Number</label>
                      <input
                        type="text"
                        id="reg-parent-contact"
                        value={regParentContact}
                        onChange={(e) => setRegParentContact(e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="w-full bg-slate-950/60 border border-slate-800/80 focus:border-cyan-500/60 rounded-xl py-2.5 px-4 text-xs text-white placeholder-slate-600 outline-none transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <button
                type="submit"
                id="reg-submit-btn"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer mt-6 text-xs uppercase tracking-wider"
              >
                {loading ? "Creating Credentials..." : "Generate Account"}
                <UserPlus className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
