import React, { useState, useEffect } from "react";
import { User } from "./types";
import Login from "./components/Login";
import DashboardLayout from "./components/DashboardLayout";
import AttendanceManager from "./components/AttendanceManager";
import ClassroomManager from "./components/ClassroomManager";
import TimetableManager from "./components/TimetableManager";
import MaterialsManager from "./components/MaterialsManager";
import AssignmentManager from "./components/AssignmentManager";
import LessonManager from "./components/LessonManager";
import EngagementTracker from "./components/EngagementTracker";
import AIAnalyticsHub from "./components/AIAnalyticsHub";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("attendance");
  const [activeClassId, setActiveClassId] = useState("");

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem("slate_session");
    if (savedSession) {
      try {
        const { user: savedUser, token: savedToken } = JSON.parse(savedSession);
        setUser(savedUser);
        setToken(savedToken);
      } catch (e) {
        console.error("Error restoring session:", e);
        localStorage.removeItem("slate_session");
      }
    }
  }, []);

  const handleLoginSuccess = (loggedInUser: User, sessionToken: string) => {
    setUser(loggedInUser);
    setToken(sessionToken);
    localStorage.setItem("slate_session", JSON.stringify({ user: loggedInUser, token: sessionToken }));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("slate_session");
    setActiveTab("attendance");
    setActiveClassId("");
  };

  // Render workspace content based on activeTab
  const renderContent = () => {
    if (!user) return null;

    switch (activeTab) {
      case "attendance":
        return (
          <AttendanceManager 
            user={user} 
            activeClassId={activeClassId} 
            setActiveClassId={setActiveClassId} 
          />
        );
      case "classes":
        return (
          <ClassroomManager 
            user={user} 
            activeClassId={activeClassId} 
            setActiveClassId={setActiveClassId} 
          />
        );
      case "timetable":
        return (
          <TimetableManager 
            user={user} 
            activeClassId={activeClassId} 
          />
        );
      case "materials":
        return (
          <MaterialsManager 
            user={user} 
            activeClassId={activeClassId} 
          />
        );
      case "assignments":
        return (
          <AssignmentManager 
            user={user} 
            activeClassId={activeClassId} 
          />
        );
      case "lessons":
        return (
          <LessonManager 
            user={user} 
            activeClassId={activeClassId} 
          />
        );
      case "engagement":
        return (
          <EngagementTracker 
            user={user} 
            activeClassId={activeClassId} 
          />
        );
      case "ai-analytics":
        return (
          <AIAnalyticsHub 
            user={user} 
            activeClassId={activeClassId} 
          />
        );
      default:
        return (
          <AttendanceManager 
            user={user} 
            activeClassId={activeClassId} 
            setActiveClassId={setActiveClassId} 
          />
        );
    }
  };

  // If not logged in, show the elite login interface
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Wrapped inside the modern dashboard layout
  return (
    <DashboardLayout 
      user={user} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
