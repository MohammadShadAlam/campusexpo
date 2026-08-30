import "server-only";
import { db } from "@/db";
import {
  attendance,
  subjects,
  timetable,
  assignments,
  submissions,
  notices,
  notifications,
  studyMaterials,
  results,
  doubts,
  syllabusUnits,
  students,
  users,
  communityMessages,
} from "@/db/schema";
import { and, desc, eq, sql, asc } from "drizzle-orm";

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export async function studentAttendanceStats(userId: number) {
  const rows = await db
    .select({
      subjectId: attendance.subjectId,
      name: subjects.name,
      code: subjects.code,
      total: sql<number>`count(*)::int`,
      present: sql<number>`sum(case when ${attendance.status} <> 'absent' then 1 else 0 end)::int`,
    })
    .from(attendance)
    .leftJoin(subjects, eq(subjects.id, attendance.subjectId))
    .where(eq(attendance.studentUserId, userId))
    .groupBy(attendance.subjectId, subjects.name, subjects.code);
  const total = rows.reduce((a, r) => a + Number(r.total), 0);
  const present = rows.reduce((a, r) => a + Number(r.present), 0);
  return {
    rows: rows.map((r) => ({
      ...r,
      total: Number(r.total),
      present: Number(r.present),
      percent: Number(r.total) ? Math.round((Number(r.present) / Number(r.total)) * 100) : 0,
    })),
    overall: total ? Math.round((present / total) * 100) : 0,
    total,
    present,
  };
}

export async function todayClasses(semester: number, section: string) {
  const day = new Date().getDay() === 0 ? 1 : new Date().getDay();
  return db
    .select({
      id: timetable.id,
      start: timetable.startTime,
      end: timetable.endTime,
      room: timetable.room,
      type: timetable.classType,
      subject: subjects.name,
      code: subjects.code,
      faculty: users.fullName,
    })
    .from(timetable)
    .leftJoin(subjects, eq(subjects.id, timetable.subjectId))
    .leftJoin(users, eq(users.id, subjects.teacherUserId))
    .where(
      and(
        eq(timetable.dayOfWeek, day),
        eq(timetable.semester, semester),
        eq(timetable.section, section),
      ),
    )
    .orderBy(timetable.startTime);
}

export async function weeklyTimetable(semester: number, section: string) {
  return db
    .select({
      id: timetable.id,
      day: timetable.dayOfWeek,
      start: timetable.startTime,
      end: timetable.endTime,
      room: timetable.room,
      type: timetable.classType,
      subject: subjects.name,
      faculty: users.fullName,
    })
    .from(timetable)
    .leftJoin(subjects, eq(subjects.id, timetable.subjectId))
    .leftJoin(users, eq(users.id, subjects.teacherUserId))
    .where(and(eq(timetable.semester, semester), eq(timetable.section, section)))
    .orderBy(timetable.dayOfWeek, timetable.startTime);
}

export async function studentAssignments(userId: number, semester: number, section: string) {
  return db
    .select({
      id: assignments.id,
      title: assignments.title,
      description: assignments.description,
      instructions: assignments.instructions,
      dueDate: assignments.dueDate,
      priority: assignments.priority,
      maxMarks: assignments.maxMarks,
      subject: subjects.name,
      submissionId: submissions.id,
      submissionStatus: submissions.status,
      marks: submissions.marks,
      feedback: submissions.feedback,
    })
    .from(assignments)
    .leftJoin(subjects, eq(subjects.id, assignments.subjectId))
    .leftJoin(
      submissions,
      and(eq(submissions.assignmentId, assignments.id), eq(submissions.studentUserId, userId)),
    )
    .where(and(eq(assignments.semester, semester), eq(assignments.section, section)))
    .orderBy(desc(assignments.dueDate));
}

export async function studentNotices(semester: number) {
  return db
    .select()
    .from(notices)
    .where(sql`${notices.semester} is null or ${notices.semester} = ${semester}`)
    .orderBy(desc(notices.createdAt))
    .limit(50);
}

export async function unreadCount(userId: number) {
  const r = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return Number(r[0]?.c ?? 0);
}

export async function userNotifications(userId: number) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(60);
}

export async function studentMaterials(semester: number, section: string) {
  return db
    .select({
      id: studyMaterials.id,
      title: studyMaterials.title,
      category: studyMaterials.category,
      fileName: studyMaterials.fileName,
      createdAt: studyMaterials.createdAt,
      subject: subjects.name,
    })
    .from(studyMaterials)
    .leftJoin(subjects, eq(subjects.id, studyMaterials.subjectId))
    .where(and(eq(studyMaterials.semester, semester), eq(studyMaterials.section, section)))
    .orderBy(desc(studyMaterials.createdAt));
}

export async function studentResults(userId: number) {
  return db
    .select()
    .from(results)
    .where(eq(results.studentUserId, userId))
    .orderBy(results.semester, results.subjectCode);
}

export async function studentDoubts(userId: number) {
  return db
    .select({
      id: doubts.id,
      question: doubts.question,
      answer: doubts.answer,
      status: doubts.status,
      createdAt: doubts.createdAt,
      subject: subjects.name,
    })
    .from(doubts)
    .leftJoin(subjects, eq(subjects.id, doubts.subjectId))
    .where(eq(doubts.studentUserId, userId))
    .orderBy(desc(doubts.createdAt));
}

export async function semesterSubjects(semester: number, section: string) {
  return db
    .select({
      id: subjects.id,
      code: subjects.code,
      name: subjects.name,
      credits: subjects.credits,
      faculty: users.fullName,
    })
    .from(subjects)
    .leftJoin(users, eq(users.id, subjects.teacherUserId))
    .where(and(eq(subjects.semester, semester), eq(subjects.section, section)));
}

export async function syllabusFor(semester: number, section: string) {
  return db
    .select({
      id: syllabusUnits.id,
      unitNumber: syllabusUnits.unitNumber,
      title: syllabusUnits.title,
      topics: syllabusUnits.topics,
      completion: syllabusUnits.completion,
      subject: subjects.name,
    })
    .from(syllabusUnits)
    .innerJoin(subjects, eq(subjects.id, syllabusUnits.subjectId))
    .where(and(eq(subjects.semester, semester), eq(subjects.section, section)))
    .orderBy(subjects.name, syllabusUnits.unitNumber);
}

export async function teacherSubjects(userId: number) {
  return db.select().from(subjects).where(eq(subjects.teacherUserId, userId));
}

export async function classStudents(semester: number, section: string) {
  return db
    .select({
      userId: students.userId,
      name: users.fullName,
      roll: students.rollNumber,
      email: users.email,
      section: students.section,
      semester: students.semester,
    })
    .from(students)
    .innerJoin(users, eq(users.id, students.userId))
    .where(
      and(
        eq(students.semester, semester),
        eq(students.section, section),
        eq(users.status, "approved"),
      ),
    )
    .orderBy(students.rollNumber);
}

// Community Messages Query
export async function getCommunityMessages(semester: number, section: string) {
  return await db
    .select({
      id: communityMessages.id,
      semester: communityMessages.semester,
      section: communityMessages.section,
      userId: communityMessages.userId,
      message: communityMessages.message,
      createdAt: communityMessages.createdAt,
      userName: users.fullName,
    })
    .from(communityMessages)
    .innerJoin(users, eq(communityMessages.userId, users.id))
    .where(and(eq(communityMessages.semester, semester), eq(communityMessages.section, section)))
    .orderBy(asc(communityMessages.createdAt));
}