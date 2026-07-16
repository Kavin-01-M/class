import React, { useState, useEffect, useCallback } from "react";

/* ---------------------------------------------------------
   Slate — Smart Classroom OS (full-stack)
   Frontend wired to the Spring Boot backend via fetch().
   Run the backend locally (mvn spring-boot:run, default
   http://localhost:8080) — this UI talks to it directly.
--------------------------------------------------------- */

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
`;

const COLORS = {
  chalk: "#1F3B32",
  chalkDeep: "#162B24",
  paper: "#FAF6EC",
  paperDim: "#F1ECDD",
  yellow: "#F2C14B",
  coral: "#E2664C",
  ink: "#22302B",
  inkSoft: "#586B5F",
  sage: "#B9CCB9",
  line: "#DCD4BE",
  white: "#FFFFFF",
};

/* ---------------- API helper ---------------- */
async function apiRequest(apiBase, path, { method = "GET", token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${apiBase}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error(
      `Could not reach ${apiBase}. Is the Spring Boot backend running there? (${err.message})`
    );
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message = (data && data.message) || `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return data;
}

/* ---------------- shared UI bits ---------------- */
function Button({ children, variant = "primary", onClick, style, disabled, type = "button" }) {
  const base = {
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontWeight: 600,
    fontSize: 14,
    padding: "10px 18px",
    borderRadius: 8,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    opacity: disabled ? 0.6 : 1,
  };
  const variants = {
    primary: { background: COLORS.yellow, color: COLORS.chalkDeep },
    outline: { background: "transparent", color: COLORS.ink, border: `1.5px solid ${COLORS.line}` },
    dark: { background: COLORS.chalk, color: COLORS.paper },
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, color: COLORS.inkSoft, marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: 14,
  padding: "9px 12px",
  borderRadius: 7,
  border: `1px solid ${COLORS.line}`,
  background: COLORS.white,
  color: COLORS.ink,
};

function Banner({ kind = "error", children }) {
  const bg = kind === "error" ? "#FBEAE5" : "#EAF1E7";
  const fg = kind === "error" ? "#A8402A" : "#3E5C3F";
  return (
    <div style={{ background: bg, color: fg, borderRadius: 7, padding: "9px 12px", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, marginBottom: 14 }}>
      {children}
    </div>
  );
}

/* ---------------- Login / register screen ---------------- */
function AuthScreen({ apiBase, setApiBase, onAuthed, backToSite }) {
  const [mode, setMode] = useState("login"); // login | register
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("admin@slate.com");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login" ? { email, password } : { fullName, email, password, role };
      const data = await apiRequest(apiBase, path, { method: "POST", body });
      onAuthed(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${COLORS.chalk} 0%, ${COLORS.chalkDeep} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div
          onClick={backToSite}
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
            fontSize: 22,
            color: COLORS.paper,
            marginBottom: 26,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ width: 10, height: 10, background: COLORS.yellow, borderRadius: 2, display: "inline-block" }} />
          Slate
        </div>

        <div style={{ background: COLORS.paper, borderRadius: 14, padding: "28px 26px", border: `1px solid ${COLORS.line}` }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <button
              onClick={() => setMode("login")}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 7, border: "none", cursor: "pointer",
                fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 13.5,
                background: mode === "login" ? COLORS.chalk : "transparent",
                color: mode === "login" ? COLORS.paper : COLORS.inkSoft,
              }}
            >
              Log in
            </button>
            <button
              onClick={() => setMode("register")}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 7, border: "none", cursor: "pointer",
                fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 13.5,
                background: mode === "register" ? COLORS.chalk : "transparent",
                color: mode === "register" ? COLORS.paper : COLORS.inkSoft,
              }}
            >
              Create account
            </button>
          </div>

          {error && <Banner kind="error">{error}</Banner>}

          <form onSubmit={submit}>
            {mode === "register" && (
              <Field label="Full name">
                <input style={inputStyle} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </Field>
            )}
            <Field label="Email">
              <input type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
            <Field label="Password">
              <input type="password" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </Field>
            {mode === "register" && (
              <Field label="Role">
                <select style={inputStyle} value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="ADMIN">Admin</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="STUDENT">Student</option>
                </select>
              </Field>
            )}
            <Field label="Backend URL">
              <input style={inputStyle} value={apiBase} onChange={(e) => setApiBase(e.target.value)} />
            </Field>
            <Button type="submit" variant="primary" disabled={loading} style={{ width: "100%", marginTop: 4 }}>
              {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
            </Button>
          </form>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: COLORS.inkSoft, marginTop: 16, marginBottom: 0 }}>
            First time running this? Create an <strong>Admin</strong> account, then log in.
            Make sure the Spring Boot backend is running at the URL above.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Dashboard pieces ---------------- */
function KpiCard({ label, value, sub }) {
  return (
    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: "16px 18px", flex: "1 1 160px" }}>
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, color: COLORS.inkSoft, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 24, color: COLORS.ink, fontWeight: 500 }}>{value}</div>
      {sub && <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: COLORS.coral, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 16.5, color: COLORS.ink, margin: 0 }}>{children}</h3>
      {right}
    </div>
  );
}

function Panel({ children, style }) {
  return (
    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: "18px 20px", ...style }}>
      {children}
    </div>
  );
}

function ComingSoon({ title }) {
  return (
    <Panel>
      <SectionTitle>{title}</SectionTitle>
      <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13.5, color: COLORS.inkSoft, lineHeight: 1.6 }}>
        This module isn't part of the backend yet — only Classes, Students and Attendance are live right now.
        It'll light up here once those endpoints are added on the server.
      </p>
    </Panel>
  );
}

/* ---- Classes tab ---- */
function ClassesTab({ apiBase, token, canWrite, refreshKey, bumpRefresh }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", section: "", academicYear: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest(apiBase, "/api/classes", { token });
      setClasses(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiBase, token]);

  useEffect(() => { load(); }, [load, refreshKey]);

  const createClass = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await apiRequest(apiBase, "/api/classes", { method: "POST", token, body: form });
      setForm({ name: "", section: "", academicYear: "" });
      load();
      bumpRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: canWrite ? "1fr 300px" : "1fr", gap: 20 }}>
      <Panel>
        <SectionTitle>Classes {loading && "— loading…"}</SectionTitle>
        {error && <Banner kind="error">{error}</Banner>}
        {classes.length === 0 && !loading && (
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13.5, color: COLORS.inkSoft }}>No classes yet.</p>
        )}
        {classes.map((c) => (
          <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${COLORS.line}`, fontSize: 13.5 }}>
            <span style={{ color: COLORS.ink }}>
              {c.name}-{c.section} <span style={{ color: COLORS.inkSoft, fontSize: 12 }}>· {c.academicYear || "—"}</span>
            </span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.inkSoft }}>{c.studentCount} students</span>
          </div>
        ))}
      </Panel>
      {canWrite && (
        <Panel>
          <SectionTitle>Add class</SectionTitle>
          <form onSubmit={createClass}>
            <Field label="Name (e.g. 10)">
              <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="Section (e.g. B)">
              <input style={inputStyle} value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} required />
            </Field>
            <Field label="Academic year">
              <input style={inputStyle} value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} placeholder="2026-27" />
            </Field>
            <Button type="submit" variant="primary" disabled={saving} style={{ width: "100%" }}>
              {saving ? "Saving…" : "Create class"}
            </Button>
          </form>
        </Panel>
      )}
    </div>
  );
}

/* ---- Students tab ---- */
function StudentsTab({ apiBase, token, canWrite, classes, refreshKey, bumpRefresh }) {
  const [students, setStudents] = useState([]);
  const [filterClass, setFilterClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ fullName: "", rollNumber: "", email: "", classId: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const path = filterClass ? `/api/students?classId=${filterClass}` : "/api/students";
      const data = await apiRequest(apiBase, path, { token });
      setStudents(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiBase, token, filterClass]);

  useEffect(() => { load(); }, [load, refreshKey]);

  const createStudent = async (e) => {
    e.preventDefault();
    if (!form.classId) { setError("Pick a class first"); return; }
    setSaving(true);
    setError("");
    try {
      await apiRequest(apiBase, "/api/students", {
        method: "POST", token,
        body: { ...form, classId: Number(form.classId) },
      });
      setForm({ fullName: "", rollNumber: "", email: "", classId: form.classId });
      load();
      bumpRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: canWrite ? "1fr 300px" : "1fr", gap: 20 }}>
      <Panel>
        <SectionTitle
          right={
            <select style={{ ...inputStyle, width: 160 }} value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
              <option value="">All classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}-{c.section}</option>
              ))}
            </select>
          }
        >
          Students {loading && "— loading…"}
        </SectionTitle>
        {error && <Banner kind="error">{error}</Banner>}
        {students.length === 0 && !loading && (
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13.5, color: COLORS.inkSoft }}>No students yet.</p>
        )}
        {students.map((s) => (
          <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${COLORS.line}`, fontSize: 13.5 }}>
            <span style={{ color: COLORS.ink }}>
              {s.fullName} <span style={{ color: COLORS.inkSoft, fontSize: 12 }}>· roll {s.rollNumber}</span>
            </span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.inkSoft }}>{s.className || "—"}</span>
          </div>
        ))}
      </Panel>
      {canWrite && (
        <Panel>
          <SectionTitle>Add student</SectionTitle>
          <form onSubmit={createStudent}>
            <Field label="Full name">
              <input style={inputStyle} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </Field>
            <Field label="Roll number">
              <input style={inputStyle} value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} required />
            </Field>
            <Field label="Email (optional)">
              <input style={inputStyle} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Class">
              <select style={inputStyle} value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} required>
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}-{c.section}</option>
                ))}
              </select>
            </Field>
            <Button type="submit" variant="primary" disabled={saving} style={{ width: "100%" }}>
              {saving ? "Saving…" : "Add student"}
            </Button>
          </form>
        </Panel>
      )}
    </div>
  );
}

/* ---- Attendance tab ---- */
const STATUS_OPTIONS = ["PRESENT", "ABSENT", "LATE"];

function AttendanceTab({ apiBase, token, canWrite, classes }) {
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRoster = useCallback(async () => {
    if (!classId) { setStudents([]); return; }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const roster = await apiRequest(apiBase, `/api/students?classId=${classId}`, { token });
      const existing = await apiRequest(apiBase, `/api/attendance/class/${classId}?date=${date}`, { token });
      const map = {};
      (existing || []).forEach((a) => { map[a.studentId] = a.status; });
      (roster || []).forEach((s) => { if (!map[s.id]) map[s.id] = "PRESENT"; });
      setStudents(roster || []);
      setStatuses(map);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiBase, token, classId, date]);

  useEffect(() => { loadRoster(); }, [loadRoster]);

  const submit = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const records = students.map((s) => ({ studentId: s.id, status: statuses[s.id] || "PRESENT" }));
      await apiRequest(apiBase, "/api/attendance/mark", {
        method: "POST", token,
        body: { classId: Number(classId), date, records },
      });
      setMessage("Attendance saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel>
      <SectionTitle
        right={
          <div style={{ display: "flex", gap: 10 }}>
            <select style={{ ...inputStyle, width: 140 }} value={classId} onChange={(e) => setClassId(e.target.value)}>
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}-{c.section}</option>
              ))}
            </select>
            <input type="date" style={{ ...inputStyle, width: 150 }} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        }
      >
        Mark attendance
      </SectionTitle>

      {error && <Banner kind="error">{error}</Banner>}
      {message && <Banner kind="success">{message}</Banner>}
      {!classId && (
        <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13.5, color: COLORS.inkSoft }}>
          Pick a class and date to load the roster.
        </p>
      )}
      {loading && <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13.5, color: COLORS.inkSoft }}>Loading roster…</p>}

      {students.map((s) => (
        <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${COLORS.line}` }}>
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13.5, color: COLORS.ink }}>
            {s.fullName} <span style={{ color: COLORS.inkSoft, fontSize: 12 }}>· roll {s.rollNumber}</span>
          </span>
          <select
            disabled={!canWrite}
            style={{ ...inputStyle, width: 130 }}
            value={statuses[s.id] || "PRESENT"}
            onChange={(e) => setStatuses({ ...statuses, [s.id]: e.target.value })}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ))}

      {canWrite && students.length > 0 && (
        <Button variant="primary" onClick={submit} disabled={saving} style={{ marginTop: 16 }}>
          {saving ? "Saving…" : "Save attendance"}
        </Button>
      )}
    </Panel>
  );
}

/* ---- Overview tab ---- */
function OverviewTab({ apiBase, token, classes, refreshKey }) {
  const [studentCount, setStudentCount] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest(apiBase, "/api/students", { token })
      .then((d) => setStudentCount((d || []).length))
      .catch((err) => setError(err.message));
  }, [apiBase, token, refreshKey]);

  return (
    <>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
        <KpiCard label="Total classes" value={classes.length} />
        <KpiCard label="Total students" value={studentCount === null ? "…" : studentCount} />
        <KpiCard label="Backend" value="Connected" sub="live data" />
      </div>
      {error && <Banner kind="error">{error}</Banner>}
      <Panel>
        <SectionTitle>Getting started</SectionTitle>
        <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13.5, color: COLORS.inkSoft, lineHeight: 1.7 }}>
          Head to <strong>Classes</strong> to add your first class, then <strong>Students</strong> to enrol students
          into it, then <strong>Attendance</strong> to mark roll call for any date. Everything here reads and writes
          straight to your Spring Boot + MySQL backend.
        </p>
      </Panel>
    </>
  );
}

/* ---------------- Dashboard shell ---------------- */
function Dashboard({ apiBase, session, onLogout }) {
  const [tab, setTab] = useState("overview");
  const [classes, setClasses] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const bumpRefresh = () => setRefreshKey((k) => k + 1);

  const canWrite = session.role === "ADMIN" || session.role === "TEACHER";

  useEffect(() => {
    apiRequest(apiBase, "/api/classes", { token: session.token })
      .then(setClasses)
      .catch(() => {});
  }, [apiBase, session.token, refreshKey]);

  const tabs = [
    ["overview", "Overview"],
    ["classes", "Classes"],
    ["students", "Students"],
    ["attendance", "Attendance"],
    ["engagement", "Engagement"],
    ["analytics", "AI analytics"],
    ["lessons", "Lessons"],
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: COLORS.paperDim, fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <div style={{ width: 210, background: COLORS.chalk, padding: "22px 16px", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 20, color: COLORS.paper, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 9, height: 9, background: COLORS.yellow, borderRadius: 2, display: "inline-block" }} />
          Slate
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.sage, marginBottom: 26 }}>
          {session.fullName} · {session.role}
        </div>
        {tabs.map(([key, label]) => (
          <div
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: "10px 12px", borderRadius: 7, marginBottom: 4, cursor: "pointer", fontSize: 13.5,
              color: tab === key ? COLORS.chalkDeep : COLORS.sage,
              background: tab === key ? COLORS.yellow : "transparent",
              fontWeight: tab === key ? 600 : 400,
            }}
          >
            {label}
          </div>
        ))}
        <div onClick={onLogout} style={{ marginTop: 30, fontSize: 12.5, color: COLORS.sage, cursor: "pointer", borderTop: "1px solid #2C4A3E", paddingTop: 16 }}>
          ← Log out
        </div>
      </div>

      <div style={{ flex: 1, padding: "26px 32px", minWidth: 0 }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22, color: COLORS.ink }}>Live dashboard</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: COLORS.inkSoft }}>{apiBase}</div>
        </div>

        {tab === "overview" && <OverviewTab apiBase={apiBase} token={session.token} classes={classes} refreshKey={refreshKey} />}
        {tab === "classes" && <ClassesTab apiBase={apiBase} token={session.token} canWrite={canWrite} refreshKey={refreshKey} bumpRefresh={bumpRefresh} />}
        {tab === "students" && <StudentsTab apiBase={apiBase} token={session.token} canWrite={canWrite} classes={classes} refreshKey={refreshKey} bumpRefresh={bumpRefresh} />}
        {tab === "attendance" && <AttendanceTab apiBase={apiBase} token={session.token} canWrite={canWrite} classes={classes} />}
        {tab === "engagement" && <ComingSoon title="Engagement tracking" />}
        {tab === "analytics" && <ComingSoon title="AI analytics" />}
        {tab === "lessons" && <ComingSoon title="Lessons" />}
      </div>
    </div>
  );
}

/* ---------------- Marketing landing (unauthenticated) ---------------- */
function Landing({ goAuth }) {
  return (
    <div style={{ background: COLORS.paper }}>
      <div style={{ background: COLORS.chalk, padding: "18px 6%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22, color: COLORS.paper, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 10, height: 10, background: COLORS.yellow, borderRadius: 2, display: "inline-block" }} />
          Slate
        </div>
        <Button variant="primary" onClick={goAuth} style={{ padding: "9px 16px", fontSize: 13.5 }}>
          Log in to dashboard
        </Button>
      </div>

      <div style={{ background: `linear-gradient(180deg, ${COLORS.chalk} 0%, ${COLORS.chalkDeep} 100%)`, padding: "80px 6%", textAlign: "center" }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.coral, marginBottom: 14 }}>
          Smart classroom management
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontWeight: 600, fontSize: "clamp(32px, 4.6vw, 52px)", color: COLORS.paper, margin: "0 0 20px" }}>
          Every classroom, wide awake.
        </h1>
        <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 16.5, color: COLORS.sage, maxWidth: 560, margin: "0 auto 34px", lineHeight: 1.6 }}>
          This build is wired to a real Spring Boot + MySQL backend — attendance, students, and classes
          are live data, not mock data. Log in to try it.
        </p>
        <Button variant="primary" onClick={goAuth}>Open the live dashboard →</Button>
      </div>

      <div style={{ padding: "60px 6%", maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.7 }}>
          Run the backend locally with <code>mvn spring-boot:run</code> (defaults to{" "}
          <code>http://localhost:8080</code>), then log in — the dashboard's Backend URL field lets you
          point at any host. Register the first account as <strong>Admin</strong> to get started.
        </p>
      </div>
    </div>
  );
}

/* ---------------- App root ---------------- */
export default function App() {
  const [view, setView] = useState("landing"); // landing | auth | dashboard
  const [apiBase, setApiBase] = useState("https://slate-backend-shzp.onrender.com");
  const [session, setSession] = useState(null);

  const handleAuthed = (data) => {
    setSession({
      token: data.token,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
    });
    setView("dashboard");
  };

  const handleLogout = () => {
    setSession(null);
    setView("landing");
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <style>{FONT_IMPORT}</style>
      {view === "landing" && <Landing goAuth={() => setView("auth")} />}
      {view === "auth" && (
        <AuthScreen apiBase={apiBase} setApiBase={setApiBase} onAuthed={handleAuthed} backToSite={() => setView("landing")} />
      )}
      {view === "dashboard" && session && (
        <Dashboard apiBase={apiBase} session={session} onLogout={handleLogout} />
      )}
    </div>
  );
}
