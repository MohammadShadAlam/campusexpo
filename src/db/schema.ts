import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  date,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("student"), // student | teacher | admin
  status: text("status").notNull().default("pending"), // pending | approved | rejected | suspended
  photoUrl: text("photo_url"),
  department: text("department"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  rollNumber: text("roll_number").notNull(),
  enrollmentNumber: text("enrollment_number").notNull(),
  course: text("course").notNull().default("B.Tech"),
  year: integer("year").notNull().default(1),
  semester: integer("semester").notNull().default(1),
  section: text("section").notNull().default("A"),
  batch: text("batch").notNull().default("2023-2027"),
  cgpa: text("cgpa").default("0.0"),
});

export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  employeeId: text("employee_id").notNull(),
  designation: text("designation").notNull().default("Assistant Professor"),
  subjects: text("subjects").default(""),
  permissions: jsonb("permissions").$type<Record<string, boolean>>().default({}),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  department: text("department").notNull(),
  semester: integer("semester").notNull(),
  section: text("section").notNull().default("C"),
  teacherUserId: integer("teacher_user_id"),
  credits: integer("credits").default(4),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentUserId: integer("student_user_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  markedByUserId: integer("marked_by_user_id").notNull(),
  onDate: date("on_date").notNull(),
  period: text("period").default("1"),
  status: text("status").notNull().default("present"), // present | absent | late
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  studentUserId: integer("student_user_id").notNull(),
  leaveType: text("leave_type").notNull().default("Medical"),
  fromDate: date("from_date").notNull(),
  toDate: date("to_date").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"),
  reviewedByUserId: integer("reviewed_by_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subjectId: integer("subject_id").notNull(),
  description: text("description").default(""),
  instructions: text("instructions").default(""),
  semester: integer("semester").notNull(),
  section: text("section").notNull(),
  dueDate: date("due_date").notNull(),
  priority: text("priority").default("Normal"),
  maxMarks: integer("max_marks").default(20),
  createdByUserId: integer("created_by_user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull(),
  studentUserId: integer("student_user_id").notNull(),
  content: text("content").default(""),
  fileName: text("file_name"),
  status: text("status").notNull().default("submitted"), // submitted | late | graded
  marks: integer("marks"),
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  studentUserId: integer("student_user_id").notNull(),
  semester: integer("semester").notNull(),
  subjectCode: text("subject_code").notNull(),
  subjectName: text("subject_name").notNull(),
  internal: integer("internal").default(0),
  external: integer("external").default(0),
  grade: text("grade").default("A"),
  gradePoint: text("grade_point").default("9"),
  published: boolean("published").default(true),
});

export const marks = pgTable("marks", {
  id: serial("id").primaryKey(),
  studentUserId: integer("student_user_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  category: text("category").notNull().default("Quiz"),
  score: integer("score").notNull().default(0),
  maxScore: integer("max_score").notNull().default(20),
  enteredByUserId: integer("entered_by_user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const syllabusUnits = pgTable("syllabus_units", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull(),
  unitNumber: integer("unit_number").notNull(),
  title: text("title").notNull(),
  topics: text("topics").default(""),
  completion: integer("completion").default(0),
});

export const studyMaterials = pgTable("study_materials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull().default("Notes"),
  subjectId: integer("subject_id").notNull(),
  semester: integer("semester").notNull(),
  section: text("section").notNull(),
  fileName: text("file_name").default("material.pdf"),
  uploadedByUserId: integer("uploaded_by_user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const timetable = pgTable("timetable", {
  id: serial("id").primaryKey(),
  dayOfWeek: integer("day_of_week").notNull(), // 1 Mon .. 6 Sat
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  subjectId: integer("subject_id").notNull(),
  room: text("room").notNull().default("A-101"),
  semester: integer("semester").notNull(),
  section: text("section").notNull(),
  classType: text("class_type").default("Lecture"),
});

export const notices = pgTable("notices", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  category: text("category").notNull().default("General"),
  priority: text("priority").default("Normal"),
  semester: integer("semester"),
  section: text("section"),
  createdByUserId: integer("created_by_user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  body: text("body").default(""),
  kind: text("kind").default("general"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const doubts = pgTable("doubts", {
  id: serial("id").primaryKey(),
  studentUserId: integer("student_user_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  question: text("question").notNull(),
  answer: text("answer"),
  answeredByUserId: integer("answered_by_user_id"),
  status: text("status").notNull().default("new"), // new | answered | resolved
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const academicCalendar = pgTable("academic_calendar", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  kind: text("kind").default("Event"),
  onDate: date("on_date").notNull(),
  endDate: date("end_date"),
});

export const broadcasts = pgTable("broadcasts", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  senderUserId: integer("sender_user_id").notNull(),
  semester: integer("semester"),
  section: text("section"),
  recipients: integer("recipients").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  actorUserId: integer("actor_user_id"),
  actorName: text("actor_name").default(""),
  action: text("action").notNull(),
  target: text("target").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityMessages = pgTable("community_messages", {
  id: serial("id").primaryKey(),
  semester: integer("semester").notNull(),
  section: text("section").notNull(),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});