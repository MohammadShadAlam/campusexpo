import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { leaveRequests } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { PageHeader, Card, EmptyState, Badge, SectionTitle } from "@/components/ui";
import { requestLeaveAction } from "@/lib/actions";

export default async function LeavePage() {
  const user = await requireUser("student");
  const rows = await db
    .select()
    .from(leaveRequests)
    .where(eq(leaveRequests.studentUserId, user.id))
    .orderBy(desc(leaveRequests.createdAt));

  return (
    <>
      <PageHeader title="Leave Requests" subtitle="Apply and track leave approvals" back="/student" />
      <Card>
        <form action={requestLeaveAction} className="space-y-3">
          <div>
            <label className="label">Leave Type</label>
            <select name="leaveType" className="input">
              {["Medical", "Personal", "Family Function", "Sports/Event", "Other"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">From</label>
              <input type="date" name="fromDate" className="input" required />
            </div>
            <div>
              <label className="label">To</label>
              <input type="date" name="toDate" className="input" required />
            </div>
          </div>
          <div>
            <label className="label">Reason</label>
            <textarea name="reason" rows={3} className="input" required />
          </div>
          <button className="btn btn-primary w-full">Submit Leave Request</button>
        </form>
      </Card>

      <SectionTitle title="History" />
      {rows.length === 0 ? (
        <EmptyState icon="calendar" title="No leave requests" message="Your submitted leave applications will be listed here." />
      ) : (
        <div className="space-y-2">
          {rows.map((l) => (
            <Card key={l.id}>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-navy text-[14px]">{l.leaveType}</p>
                <Badge
                  text={l.status}
                  tone={l.status === "approved" ? "green" : l.status === "rejected" ? "red" : "gold"}
                />
              </div>
              <p className="text-[12px] text-slate-500 mt-1">
                {l.fromDate} → {l.toDate}
              </p>
              <p className="text-[13px] text-slate-600 mt-1">{l.reason}</p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
