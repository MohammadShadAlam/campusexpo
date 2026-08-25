import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { subjects, assignments, studyMaterials, notices, users } from "@/db/schema";
import { ilike, or, eq, and } from "drizzle-orm";
import { PageHeader, Card, EmptyState, Badge } from "@/components/ui";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q } = await searchParams;
  const term = (q ?? "").trim();
  const like = `%${term}%`;

  const [subs, asg, mats, nts, ppl] = term
    ? await Promise.all([
        db.select().from(subjects).where(or(ilike(subjects.name, like), ilike(subjects.code, like))).limit(10),
        db.select().from(assignments).where(ilike(assignments.title, like)).limit(10),
        db.select().from(studyMaterials).where(ilike(studyMaterials.title, like)).limit(10),
        db.select().from(notices).where(or(ilike(notices.title, like), ilike(notices.message, like))).limit(10),
        user.role === "student"
          ? db.select().from(users).where(and(eq(users.role, "teacher"), ilike(users.fullName, like))).limit(10)
          : db.select().from(users).where(ilike(users.fullName, like)).limit(10),
      ])
    : [[], [], [], [], []];

  const groups = [
    { title: "Subjects", items: subs.map((s) => ({ id: s.id, a: s.name, b: `${s.code} · Sem ${s.semester}` })) },
    { title: "Assignments", items: asg.map((s) => ({ id: s.id, a: s.title, b: `Due ${s.dueDate}` })) },
    { title: "Study Materials", items: mats.map((s) => ({ id: s.id, a: s.title, b: s.category })) },
    { title: "Notices", items: nts.map((s) => ({ id: s.id, a: s.title, b: s.category })) },
    { title: "People", items: ppl.map((s) => ({ id: s.id, a: s.fullName, b: `${s.role} · ${s.department ?? ""}` })) },
  ].filter((g) => g.items.length);

  return (
    <main className="min-h-dvh max-w-2xl mx-auto px-4 py-6">
      <PageHeader title="Search" subtitle="Find anything across CampusExpo" back={`/${user.role}`} />
      <form className="flex gap-2">
        <input name="q" defaultValue={term} className="input" placeholder="Search subjects, assignments, notices, people…" />
        <button className="btn btn-primary">Search</button>
      </form>
      <div className="mt-4 space-y-4">
        {term && groups.length === 0 && (
          <EmptyState icon="search" title="No search results" message={`Nothing matched "${term}". Try a different keyword.`} />
        )}
        {groups.map((g) => (
          <div key={g.title}>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="font-bold text-navy text-[15px]">{g.title}</h2>
              <Badge text={`${g.items.length}`} tone="grey" />
            </div>
            <div className="space-y-2">
              {g.items.map((i) => (
                <Card key={`${g.title}-${i.id}`}>
                  <p className="font-semibold text-navy text-[14px]">{i.a}</p>
                  <p className="text-[12px] text-slate-500">{i.b}</p>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
