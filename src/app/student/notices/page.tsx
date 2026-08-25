import { requireUser } from "@/lib/auth";
import { PageHeader, Card, EmptyState, Badge } from "@/components/ui";
import { studentNotices } from "@/lib/queries";

export default async function NoticesPage() {
  const user = await requireUser("student");
  const rows = await studentNotices(user.student!.semester);
  return (
    <>
      <PageHeader title="Notices" subtitle="Academic, exam, events & urgent notices" back="/student" />
      {rows.length === 0 ? (
        <EmptyState icon="megaphone" title="No notices yet" message="College announcements will appear here as soon as they are published." />
      ) : (
        <div className="space-y-2">
          {rows.map((n) => (
            <Card key={n.id}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-navy text-[14px]">{n.title}</p>
                <Badge text={n.category} tone={n.priority === "Urgent" ? "red" : "gold"} />
              </div>
              <p className="text-[13px] text-slate-600 mt-1">{n.message}</p>
              <p className="text-[11px] text-slate-400 mt-2">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
