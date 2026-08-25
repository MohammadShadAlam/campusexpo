import { requireUser } from "@/lib/auth";
import { userNotifications } from "@/lib/queries";
import { PageHeader, Card, EmptyState, Badge } from "@/components/ui";
import { markNotificationsReadAction } from "@/lib/actions";

export default async function NotificationsPage() {
  const user = await requireUser();
  const rows = await userNotifications(user.id);
  return (
    <main className="min-h-dvh max-w-2xl mx-auto px-4 py-6">
      <PageHeader title="Notifications" subtitle="Everything that needs your attention" back={`/${user.role}`} />
      {rows.length ? (
        <form action={markNotificationsReadAction} className="mb-3">
          <button className="btn btn-ghost text-[12px] py-1.5">Mark all as read</button>
        </form>
      ) : null}
      {rows.length === 0 ? (
        <EmptyState icon="bell" title="No notifications" message="You're all caught up. New updates will appear here." />
      ) : (
        <div className="space-y-2">
          {rows.map((n) => (
            <Card key={n.id} className={n.isRead ? "" : "border-l-4 border-l-gold"}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-navy text-[14px]">{n.title}</p>
                <Badge text={n.kind ?? "general"} tone="grey" />
              </div>
              <p className="text-[13px] text-slate-600 mt-1">{n.body}</p>
              <p className="text-[11px] text-slate-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
