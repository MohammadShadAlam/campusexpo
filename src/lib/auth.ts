import "server-only";
import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { db } from "@/db";
import { users, students, teachers, sessions, activityLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export const SESSION_COOKIE = "campusexpo_session";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const original = Buffer.from(hash, "hex");
  if (candidate.length !== original.length) return false;
  return timingSafeEqual(candidate, original);
}

export async function createSession(userId: number) {
  const id = randomBytes(24).toString("hex");
  await db.insert(sessions).values({ id, userId });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const id = jar.get(SESSION_COOKIE)?.value;
  if (id) await db.delete(sessions).where(eq(sessions.id, id));
  jar.delete(SESSION_COOKIE);
}

export type SessionUser = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  department: string | null;
  photoUrl: string | null;
  student?: typeof students.$inferSelect;
  teacher?: typeof teachers.$inferSelect;
  permissions: Record<string, boolean>;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const id = jar.get(SESSION_COOKIE)?.value;
  if (!id) return null;
  const rows = await db
    .select()
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  const u = row.users;
  const base: SessionUser = {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    role: u.role,
    status: u.status,
    department: u.department,
    photoUrl: u.photoUrl,
    permissions: {},
  };
  if (u.role === "student") {
    const s = await db.select().from(students).where(eq(students.userId, u.id)).limit(1);
    base.student = s[0];
  } else if (u.role === "teacher") {
    const t = await db.select().from(teachers).where(eq(teachers.userId, u.id)).limit(1);
    base.teacher = t[0];
    base.permissions = (t[0]?.permissions as Record<string, boolean>) ?? {};
  } else if (u.role === "admin") {
    base.permissions = Object.fromEntries(ALL_PERMISSIONS.map((p) => [p.key, true]));
  }
  return base;
}

export async function requireUser(role?: "student" | "teacher" | "admin") {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.status !== "approved") redirect("/pending");
  if (role && user.role !== role) redirect(`/${user.role}`);
  return user;
}

export async function logActivity(
  actorUserId: number | null,
  actorName: string,
  action: string,
  target = "",
) {
  await db.insert(activityLogs).values({ actorUserId, actorName, action, target });
}

export const ALL_PERMISSIONS = [
  { key: "attendance", label: "Take Attendance", group: "Attendance" },
  { key: "view_attendance", label: "View Attendance", group: "Attendance" },
  { key: "approve_leave", label: "Approve Leave", group: "Leave" },
  { key: "create_assignment", label: "Create Assignment", group: "Assignment" },
  { key: "study_material", label: "Upload Study Material", group: "Study Material" },
  { key: "announcement", label: "Announcement", group: "Communication" },
  { key: "broadcast", label: "Broadcast", group: "Communication" },
  { key: "marks", label: "Enter Marks", group: "Marks" },
  { key: "performance", label: "View Student Performance", group: "Analytics" },
  { key: "doubts", label: "Answer Doubts", group: "Doubts" },
  { key: "timetable", label: "Manage Timetable", group: "Timetable" },
  { key: "student_data", label: "View Student Data", group: "Student Data" },
];

export const DEFAULT_TEACHER_PERMISSIONS: Record<string, boolean> = {
  attendance: true,
  view_attendance: true,
  doubts: true,
  student_data: true,
  performance: true,
  approve_leave: false,
  create_assignment: false,
  study_material: false,
  announcement: false,
  broadcast: false,
  marks: false,
  timetable: false,
};
