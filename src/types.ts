export type UserRole = "admin" | "teacher" | "student";

export interface User {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
  studentId?: string;
}

export interface Class {
  id: string;
  name: string;
  grade: string;
  room: string;
  subject: string;
  teacherId: string;
}

export interface Student {
  id: string;
  fullName: string;
  rollNumber: string;
  email: string;
  classId: string;
  parentName: string;
  parentContact: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: "present" | "absent" | "late";
  remarks?: string;
}

export interface Submission {
  studentId: string;
  studentName: string;
  fileName: string;
  content: string;
  submittedAt: string;
  grade: number | null;
  comments: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  classId: string;
  dueDate: string;
  maxPoints: number;
  submissions: Submission[];
}

export interface Timetable {
  id: string;
  classId: string;
  day: string;
  period: string;
  subject: string;
  room: string;
  teacherName: string;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  uploadedBy: string;
  classId: string;
  uploadedAt: string;
  type: "pdf" | "doc" | "link" | "video";
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  classId: string;
  status: "completed" | "in-progress" | "planned";
  date: string;
}

export interface Engagement {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  participationScore: number;
  quizScore: number;
  homeworkCompletion: number;
  engagementLevel: "high" | "medium" | "low";
  attendanceRate: number;
}
