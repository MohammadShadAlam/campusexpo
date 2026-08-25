import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { leaveRequests, students, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { PageHeader, Card, EmptyState, Badge } from "@/components/ui";
import { reviewLeaveAction } from "@/lib/actions";

export default async function TeacherLeaves() {
  const user = await requireUser("teacher");
  if (!user.permissions.approve_leave) redirect("/teacher");
  const rows = await db
    .select({
      id: leaveRequests.id,
      type: leaveRequests.leaveType,
      from: leaveRequests.fromDate,
      to: leaveRequests.toDate,
      reason: leaveRequests.reason,
      status: leaveRequests.status,
      name: users.fullName,
      roll: students.rollNumber,
    })
    .from(leaveRequests)
    .innerJoin(users, eq(users.id, leaveRequests.studentUserId))
    .leftJoin(students, eq(students.userId, leaveRequests.studentUserId))
    .orderBy(desc(leaveRequests.createdAt));

  return (
    <>
      <PageHeader title="Approve Leave" subtitle="Student leave requests" back="/teacher" />
      {rows.length === 0 ? (
        <EmptyState icon="calendar" title="No leave requests" message="Leave applications from your students will appear here." />
      ) : (
        <div className="space-y-2">
          {rows.map((l) => (
            <Card key={l.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-navy text-[14px]">{l.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {l.roll} · {l.type}
                  </p>
                </div>
                <Badge
                  text={l.status}
                  tone={l.status === "approved" ? "green" : l.status === "rejected" ? "red" : "gold"}
                />
              </div>
              <p className="text-[12px] text-slate-500 mt-2">
                {l.from} → {l.to}
              </p>
              <p className="text-[13px] text-slate-600 mt-1">{l.reason}</p>
              {l.status === "pending" && (
                <div className="flex gap-2 mt-3">
                  <form action={reviewLeaveAction} className="flex-1">
                    <input type="hidden" name="id" value={l.id} />
                    <input type="hidden" name="decision" value="approved" />
                    <button className="btn btn-primary w-full">Approve</button>
                  </form>
                  <form action={reviewLeaveAction} className="flex-1">
                    <input type="hidden" name="id" value={l.id} />
                    <input type="hidden" name="decision" value="rejected" />
                    <button className="btn btn-ghost w-full">Reject</button>
                  </form>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
