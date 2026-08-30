"use server";

import { db } from "@/db";
import {
  users,
  students,
  teachers,
  attendance,
  leaveRequests,
  assignments,
  submissions,
  studyMaterials,
  notices,
  notifications,
  doubts,
  marks,
  broadcasts,
  subjects,
  results,
} from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
  getSessionUser,
  logActivity,
  DEFAULT_TEACHER_PERMISSIONS,
} from "./auth";

function s(fd: FormData, k: string) {
  return String(fd.get(k) ?? "").trim();
}

async function notify(userIds: number[], title: string, body: string, kind = "general") {
  if (!userIds.length) return;
  await db.insert(notifications).values(
    userIds.map((userId) => ({ userId, title, body, kind })),
  );
}

async function studentsIn(semester: number, section: string) {
  const rows = await db
    .select({ userId: students.userId })
    .from(students)
    .where(and(eq(students.semester, semester), eq(students.section, section)));
  return rows.map((r) => r.userId);
}

/* ---------------- AUTH ---------------- */

export async function signupAction(_prev: unknown, fd: FormData) {
  const role = s(fd, "role") === "teacher" ? "teacher" : "student";
  const email = s(fd, "email").toLowerCase();
  const password = s(fd, "password");
  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };
  if (password !== s(fd, "confirmPassword")) return { error: "Passwords do not match." };
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return { error: "An account with this email already exists." };

  const [user] = await db
    .insert(users)
    .values({
      fullName: s(fd, "fullName"),
      email,
      phone: s(fd, "phone"),
      passwordHash: hashPassword(password),
      role,
      status: "pending",
      department: s(fd, "department") || "Computer Science & Engineering",
    })
    .returning();

  if (role === "student") {
    await db.insert(students).values({
      userId: user.id,
      rollNumber: s(fd, "rollNumber") || `CSE-${user.id}`,
      enrollmentNumber: s(fd, "enrollmentNumber") || `EN${2023000 + user.id}`,
      course: s(fd, "course") || "B.Tech CSE",
      year: Number(s(fd, "year") || 1),
      semester: Number(s(fd, "semester") || 1),
      section: s(fd, "section") || "A",
      batch: s(fd, "batch") || "2023-2027",
    });
  } else {
    await db.insert(teachers).values({
      userId: user.id,
      employeeId: s(fd, "employeeId") || `EMP-${user.id}`,
      designation: s(fd, "designation") || "Assistant Professor",
      subjects: s(fd, "subjects"),
      permissions: DEFAULT_TEACHER_PERMISSIONS,
    });
  }
  await logActivity(user.id, user.fullName, `${role} registration submitted`, email);
  redirect("/pending?new=1");
}

export async function loginAction(_prev: unknown, fd: FormData) {
  const email = s(fd, "email").toLowerCase();
  const password = s(fd, "password");
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  if (!user || !verifyPassword(password, user.passwordHash))
    return { error: "Invalid email or password." };
  await createSession(user.id);
  await logActivity(user.id, user.fullName, "signed in");
  if (user.status !== "approved") redirect("/pending");
  redirect(`/${user.role}`);
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function resetPasswordAction(_prev: unknown, fd: FormData) {
  const email = s(fd, "email").toLowerCase();
  const password = s(fd, "password");
  if (password.length < 6) return { error: "Password must be at least 6 characters." };
  if (password !== s(fd, "confirmPassword")) return { error: "Passwords do not match." };
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!rows.length) return { error: "No account found with that email." };
  await db
    .update(users)
    .set({ passwordHash: hashPassword(password) })
    .where(eq(users.id, rows[0].id));
  await logActivity(rows[0].id, rows[0].fullName, "password reset");
  return { ok: "Password updated. You can now sign in." };
}

/* ---------------- ADMIN ---------------- */

async function requireAdmin() {
  const u = await getSessionUser();
  if (!u || u.role !== "admin") throw new Error("Unauthorized");
  return u;
}

export async function reviewUserAction(fd: FormData) {
  const admin = await requireAdmin();
  const userId = Number(s(fd, "userId"));
  const decision = s(fd, "decision");
  await db.update(users).set({ status: decision }).where(eq(users.id, userId));
  const target = (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0];
  await notify(
    [userId],
    decision === "approved" ? "Account approved" : `Account ${decision}`,
    decision === "approved"
      ? "Welcome to CampusExpo. Your account is now active."
      : `Your account was ${decision} by the administrator.`,
    "account",
  );
  await logActivity(admin.id, admin.fullName, `${decision} account`, target?.email ?? "");
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function updateStudentAssignmentAction(fd: FormData) {
  const admin = await requireAdmin();
  const userId = Number(s(fd, "userId"));
  await db
    .update(students)
    .set({
      semester: Number(s(fd, "semester")),
      section: s(fd, "section"),
    })
    .where(eq(students.userId, userId));
  await db.update(users).set({ department: s(fd, "department") }).where(eq(users.id, userId));
  await logActivity(admin.id, admin.fullName, "updated student assignment", `user#${userId}`);
  revalidatePath("/admin/users");
}

export async function updatePermissionsAction(fd: FormData) {
  const admin = await requireAdmin();
  const userId = Number(s(fd, "userId"));
  const keys = s(fd, "keys").split(",").filter(Boolean);
  const perms: Record<string, boolean> = {};
  for (const k of keys) perms[k] = s(fd, `perm_${k}`) === "on";
  await db.update(teachers).set({ permissions: perms }).where(eq(teachers.userId, userId));
  await notify([userId], "Permissions updated", "Your available actions have been updated by the administrator.", "permission");
  await logActivity(admin.id, admin.fullName, "changed teacher permissions", `user#${userId}`);
  revalidatePath("/admin/permissions");
  revalidatePath("/teacher");
}

export async function createSubjectAction(fd: FormData) {
  const admin = await requireAdmin();
  await db.insert(subjects).values({
    code: s(fd, "code"),
    name: s(fd, "name"),
    department: s(fd, "department") || "Computer Science & Engineering",
    semester: Number(s(fd, "semester") || 4),
    section: s(fd, "section") || "C",
    teacherUserId: Number(s(fd, "teacherUserId")) || null,
  });
  await logActivity(admin.id, admin.fullName, "created subject", s(fd, "code"));
  revalidatePath("/admin/academics");
}

export async function publishResultAction(fd: FormData) {
  const admin = await requireAdmin();
  const studentUserId = Number(s(fd, "studentUserId"));
  await db.insert(results).values({
    studentUserId,
    semester: Number(s(fd, "semester") || 4),
    subjectCode: s(fd, "subjectCode"),
    subjectName: s(fd, "subjectName"),
    internal: Number(s(fd, "internal") || 0),
    external: Number(s(fd, "external") || 0),
    grade: s(fd, "grade") || "A",
    gradePoint: s(fd, "gradePoint") || "9",
  });
  await notify([studentUserId], "Result published", `${s(fd, "subjectName")} result is now available.`, "result");
  await logActivity(admin.id, admin.fullName, "published result", s(fd, "subjectCode"));
  revalidatePath("/admin/management");
}

/* ---------------- TEACHER ---------------- */

async function requireTeacherPerm(perm: string) {
  const u = await getSessionUser();
  if (!u || (u.role !== "teacher" && u.role !== "admin")) throw new Error("Unauthorized");
  if (u.role === "teacher" && !u.permissions[perm]) throw new Error("Permission denied");
  return u;
}

export async function submitAttendanceAction(fd: FormData) {
  const u = await requireTeacherPerm("attendance");
  const subjectId = Number(s(fd, "subjectId"));
  const onDate = s(fd, "onDate");
  const period = s(fd, "period") || "1";
  const ids = s(fd, "studentIds").split(",").filter(Boolean).map(Number);
  await db
    .delete(attendance)
    .where(
      and(
        eq(attendance.subjectId, subjectId),
        eq(attendance.onDate, onDate),
        eq(attendance.period, period),
        inArray(attendance.studentUserId, ids.length ? ids : [-1]),
      ),
    );
  if (ids.length) {
    await db.insert(attendance).values(
      ids.map((id) => ({
        studentUserId: id,
        subjectId,
        markedByUserId: u.id,
        onDate,
        period,
        status: s(fd, `status_${id}`) || "present",
      })),
    );
    const absent = ids.filter((id) => s(fd, `status_${id}`) === "absent");
    await notify(absent, "Marked absent", `You were marked absent on ${onDate}.`, "attendance");
  }
  await logActivity(u.id, u.fullName, "submitted attendance", `subject#${subjectId} ${onDate}`);
  revalidatePath("/teacher/attendance");
  redirect("/teacher/attendance?done=1");
}

export async function reviewLeaveAction(fd: FormData) {
  const u = await requireTeacherPerm("approve_leave");
  const id = Number(s(fd, "id"));
  const decision = s(fd, "decision");
  const [row] = await db
    .update(leaveRequests)
    .set({ status: decision, reviewedByUserId: u.id })
    .where(eq(leaveRequests.id, id))
    .returning();
  if (row)
    await notify([row.studentUserId], `Leave ${decision}`, `Your leave request was ${decision}.`, "leave");
  await logActivity(u.id, u.fullName, `${decision} leave request`, `leave#${id}`);
  revalidatePath("/teacher/leaves");
}

export async function createAssignmentAction(fd: FormData) {
  const u = await requireTeacherPerm("create_assignment");
  const semester = Number(s(fd, "semester") || 4);
  const section = s(fd, "section") || "C";
  await db.insert(assignments).values({
    title: s(fd, "title"),
    subjectId: Number(s(fd, "subjectId")),
    description: s(fd, "description"),
    instructions: s(fd, "instructions"),
    semester,
    section,
    dueDate: s(fd, "dueDate"),
    priority: s(fd, "priority") || "Normal",
    maxMarks: Number(s(fd, "maxMarks") || 20),
    createdByUserId: u.id,
  });
  await notify(await studentsIn(semester, section), "New assignment uploaded", s(fd, "title"), "assignment");
  await logActivity(u.id, u.fullName, "created assignment", s(fd, "title"));
  revalidatePath("/teacher/assignments");
  revalidatePath("/student/assignments");
}

export async function gradeSubmissionAction(fd: FormData) {
  const u = await requireTeacherPerm("create_assignment");
  const id = Number(s(fd, "id"));
  const [row] = await db
    .update(submissions)
    .set({ marks: Number(s(fd, "marks")), feedback: s(fd, "feedback"), status: "graded" })
    .where(eq(submissions.id, id))
    .returning();
  if (row)
    await notify([row.studentUserId], "Assignment graded", `You scored ${row.marks} marks.`, "assignment");
  await logActivity(u.id, u.fullName, "graded submission", `submission#${id}`);
  revalidatePath("/teacher/assignments");
}

export async function uploadMaterialAction(fd: FormData) {
  const u = await requireTeacherPerm("study_material");
  const semester = Number(s(fd, "semester") || 4);
  const section = s(fd, "section") || "C";
  await db.insert(studyMaterials).values({
    title: s(fd, "title"),
    category: s(fd, "category") || "Notes",
    subjectId: Number(s(fd, "subjectId")),
    semester,
    section,
    fileName: s(fd, "fileName") || "material.pdf",
    uploadedByUserId: u.id,
  });
  await notify(await studentsIn(semester, section), "New study material uploaded", s(fd, "title"), "material");
  await logActivity(u.id, u.fullName, "uploaded study material", s(fd, "title"));
  revalidatePath("/teacher/materials");
  revalidatePath("/student/materials");
}

export async function createNoticeAction(fd: FormData) {
  const u = await getSessionUser();
  if (!u) throw new Error("Unauthorized");
  if (u.role === "teacher" && !u.permissions.announcement) throw new Error("Permission denied");
  const semester = s(fd, "semester") ? Number(s(fd, "semester")) : null;
  const section = s(fd, "section") || null;
  await db.insert(notices).values({
    title: s(fd, "title"),
    message: s(fd, "message"),
    category: s(fd, "category") || "General",
    priority: s(fd, "priority") || "Normal",
    semester,
    section,
    createdByUserId: u.id,
  });
  const targets =
    semester && section
      ? await studentsIn(semester, section)
      : (await db.select({ id: users.id }).from(users).where(eq(users.role, "student"))).map((r) => r.id);
  await notify(targets, "New college announcement", s(fd, "title"), "notice");
  await logActivity(u.id, u.fullName, "published notice", s(fd, "title"));
  revalidatePath("/student/notices");
  revalidatePath("/teacher/communication");
  revalidatePath("/admin/management");
}

export async function broadcastAction(fd: FormData) {
  const u = await requireTeacherPerm("broadcast");
  const semester = Number(s(fd, "semester") || 4);
  const section = s(fd, "section") || "C";
  const targets = await studentsIn(semester, section);
  await db.insert(broadcasts).values({
    message: s(fd, "message"),
    senderUserId: u.id,
    semester,
    section,
    recipients: targets.length,
  });
  await notify(targets, "Message from faculty", s(fd, "message"), "broadcast");
  await logActivity(u.id, u.fullName, "sent broadcast", `${targets.length} recipients`);
  revalidatePath("/teacher/communication");
}

export async function answerDoubtAction(fd: FormData) {
  const u = await requireTeacherPerm("doubts");
  const id = Number(s(fd, "id"));
  const [row] = await db
    .update(doubts)
    .set({ answer: s(fd, "answer"), answeredByUserId: u.id, status: "answered" })
    .where(eq(doubts.id, id))
    .returning();
  if (row) await notify([row.studentUserId], "Your doubt was answered", s(fd, "answer"), "doubt");
  await logActivity(u.id, u.fullName, "answered doubt", `doubt#${id}`);
  revalidatePath("/teacher/doubts");
  revalidatePath("/student/doubts");
}

export async function enterMarksAction(fd: FormData) {
  const u = await requireTeacherPerm("marks");
  const subjectId = Number(s(fd, "subjectId"));
  const category = s(fd, "category") || "Quiz";
  const maxScore = Number(s(fd, "maxScore") || 20);
  const ids = s(fd, "studentIds").split(",").filter(Boolean).map(Number);
  if (ids.length) {
    await db.insert(marks).values(
      ids.map((id) => ({
        studentUserId: id,
        subjectId,
        category,
        score: Number(s(fd, `score_${id}`) || 0),
        maxScore,
        enteredByUserId: u.id,
      })),
    );
    await notify(ids, "Marks updated", `${category} marks have been entered.`, "marks");
  }
  await logActivity(u.id, u.fullName, "entered marks", `${category} subject#${subjectId}`);
  revalidatePath("/teacher/marks");
}

/* ---------------- STUDENT ---------------- */

async function requireStudent() {
  const u = await getSessionUser();
  if (!u || u.role !== "student") throw new Error("Unauthorized");
  return u;
}

export async function submitAssignmentAction(fd: FormData) {
  const u = await requireStudent();
  const assignmentId = Number(s(fd, "assignmentId"));
  const [a] = await db.select().from(assignments).where(eq(assignments.id, assignmentId)).limit(1);
  const late = a ? new Date(a.dueDate) < new Date() : false;
  const existing = await db
    .select()
    .from(submissions)
    .where(and(eq(submissions.assignmentId, assignmentId), eq(submissions.studentUserId, u.id)))
    .limit(1);
  if (existing.length) {
    await db
      .update(submissions)
      .set({ content: s(fd, "content"), fileName: s(fd, "fileName") || null })
      .where(eq(submissions.id, existing[0].id));
  } else {
    await db.insert(submissions).values({
      assignmentId,
      studentUserId: u.id,
      content: s(fd, "content"),
      fileName: s(fd, "fileName") || null,
      status: late ? "late" : "submitted",
    });
  }
  if (a) await notify([a.createdByUserId], "New submission", `${u.fullName} submitted "${a.title}".`, "assignment");
  await logActivity(u.id, u.fullName, "submitted assignment", a?.title ?? "");
  revalidatePath("/student/assignments");
}

export async function requestLeaveAction(fd: FormData) {
  const u = await requireStudent();
  await db.insert(leaveRequests).values({
    studentUserId: u.id,
    leaveType: s(fd, "leaveType") || "Medical",
    fromDate: s(fd, "fromDate"),
    toDate: s(fd, "toDate"),
    reason: s(fd, "reason"),
  });
  const faculty = await db.select({ id: users.id }).from(users).where(eq(users.role, "teacher"));
  await notify(faculty.map((f) => f.id), "New leave request", `${u.fullName} requested leave.`, "leave");
  await logActivity(u.id, u.fullName, "requested leave");
  revalidatePath("/student/leave");
  revalidatePath("/teacher/leaves");
}

export async function askDoubtAction(fd: FormData) {
  const u = await requireStudent();
  const subjectId = Number(s(fd, "subjectId"));
  await db.insert(doubts).values({ studentUserId: u.id, subjectId, question: s(fd, "question") });
  const [subj] = await db.select().from(subjects).where(eq(subjects.id, subjectId)).limit(1);
  if (subj?.teacherUserId)
    await notify([subj.teacherUserId], "New doubt received", s(fd, "question"), "doubt");
  await logActivity(u.id, u.fullName, "asked a doubt", subj?.name ?? "");
  revalidatePath("/student/doubts");
  revalidatePath("/teacher/doubts");
}

export async function resolveDoubtAction(fd: FormData) {
  const u = await requireStudent();
  await db
    .update(doubts)
    .set({ status: "resolved" })
    .where(and(eq(doubts.id, Number(s(fd, "id"))), eq(doubts.studentUserId, u.id)));
  revalidatePath("/student/doubts");
}

export async function markNotificationsReadAction() {
  const u = await getSessionUser();
  if (!u) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, u.id));
  revalidatePath("/notifications");
}

import { requireUser } from "@/lib/auth";
import { communityMessages } from "@/db/schema";

export async function sendCommunityMessageAction(formData: FormData) {
  const user = await requireUser("student");
  const message = formData.get("message")?.toString();
  if (!message || !user.student) return;

  await db.insert(communityMessages).values({
    semester: user.student.semester,
    section: user.student.section,
    userId: user.id,
    message,
  });

  revalidatePath("/student/community");
}
export async function updateStudentProfile(formData: FormData) {
  const user = await requireUser("student");
  const phone = s(formData, "phone");

  await db
    .update(users)
    .set({ phone })
    .where(eq(users.id, user.id));

  await logActivity(user.id, user.fullName, "updated profile details");
  revalidatePath("/student/profile");
  redirect("/student/profile");
}