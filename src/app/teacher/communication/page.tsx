import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { notices, broadcasts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { PageHeader, Card, EmptyState, SectionTitle, Badge } from "@/components/ui";
import { createNoticeAction, broadcastAction } from "@/lib/actions";
import { teacherSubjects } from "@/lib/queries";

export default async function Communication() {
  const user = await requireUser("teacher");
  const p = user.permissions;
  const subs = await teacherSubjects(user.id);
  const [myNotices, myCasts] = await Promise.all([
    db.select().from(notices).where(eq(notices.createdByUserId, user.id)).orderBy(desc(notices.createdAt)).limit(20),
    db.select().from(broadcasts).where(eq(broadcasts.senderUserId, user.id)).orderBy(desc(broadcasts.createdAt)).limit(20),
  ]);

  return (
    <>
      <PageHeader title="Communication" subtitle="Announcements & broadcasts" back="/teacher" />

      <SectionTitle title="Announcement" />
      {p.announcement ? (
        <Card>
          <form action={createNoticeAction} className="space-y-3">
            <input name="title" className="input" placeholder="Title" required />
            <textarea name="message" className="input" rows={3} placeholder="Message" required />
            <div className="grid grid-cols-2 gap-3">
              <select name="category" className="input">
                {["Academic", "Examination", "Assignment", "Events", "General", "Urgent"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select name="priority" className="input">
                <option>Normal</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
              <input name="semester" type="number" className="input" placeholder="Semester" defaultValue={subs[0]?.semester ?? 4} />
              <input name="section" className="input" placeholder="Section" defaultValue={subs[0]?.section ?? "C"} />
            </div>
            <button className="btn btn-primary w-full">Publish Announcement</button>
          </form>
        </Card>
      ) : (
        <div className="card p-4 text-[13px] text-slate-600 border-l-4 border-l-gold">
          Announcement permission is not enabled for your account.
        </div>
      )}

      <SectionTitle title="Broadcast" />
      <div id="broadcast" />
      {p.broadcast ? (
        <Card>
          <form action={broadcastAction} className="space-y-3">
            <textarea name="message" className="input" rows={2} placeholder="e.g. Tomorrow's class will be held in Lab 2." required />
            <div className="grid grid-cols-2 gap-3">
              <input name="semester" type="number" className="input" defaultValue={subs[0]?.semester ?? 4} />
              <input name="section" className="input" defaultValue={subs[0]?.section ?? "C"} />
            </div>
            <button className="btn btn-gold w-full">Send Broadcast</button>
          </form>
        </Card>
      ) : (
        <div className="card p-4 text-[13px] text-slate-600 border-l-4 border-l-gold">
          Broadcast permission is not enabled for your account.
        </div>
      )}

      <SectionTitle title="Sent History" />
      {myNotices.length === 0 && myCasts.length === 0 ? (
        <EmptyState icon="megaphone" title="Nothing sent yet" message="Your announcements and broadcasts will be listed here." />
      ) : (
        <div className="space-y-2">
          {myNotices.map((n) => (
            <Card key={`n${n.id}`}>
              <div className="flex justify-between gap-2">
                <p className="font-semibold text-navy text-[14px]">{n.title}</p>
                <Badge text="Announcement" tone="navy" />
              </div>
              <p className="text-[12px] text-slate-600 mt-1">{n.message}</p>
            </Card>
          ))}
          {myCasts.map((b) => (
            <Card key={`b${b.id}`}>
              <div className="flex justify-between gap-2">
                <p className="text-[13px] text-slate-700">{b.message}</p>
                <Badge text={`${b.recipients} sent`} tone="gold" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Sem {b.semester} · Sec {b.section} · Delivered
              </p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
