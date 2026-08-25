import { requireUser } from "@/lib/auth";
import { PageHeader, Card, EmptyState, Badge, Icon } from "@/components/ui";
import { studentMaterials } from "@/lib/queries";

export default async function MaterialsPage() {
  const user = await requireUser("student");
  const st = user.student!;
  const rows = await studentMaterials(st.semester, st.section);
  const categories = [...new Set(rows.map((r) => r.category))];

  return (
    <>
      <PageHeader title="Study Materials" subtitle="Notes, PDFs, manuals & question banks" back="/student" />
      {rows.length === 0 ? (
        <EmptyState icon="folder" title="No study material" message="Your faculty hasn't uploaded any study material for this semester yet." />
      ) : (
        categories.map((cat) => (
          <div key={cat} className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-[15px] font-bold text-navy">{cat}</h2>
              <Badge text={`${rows.filter((r) => r.category === cat).length}`} tone="grey" />
            </div>
            <div className="space-y-2">
              {rows
                .filter((r) => r.category === cat)
                .map((r) => (
                  <Card key={r.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#eef2fb] text-navy grid place-items-center">
                      <Icon name="doc" className="w-[18px] h-[18px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy text-[14px] truncate">{r.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {r.subject} · {r.fileName}
                      </p>
                    </div>
                    <a
                      href={`data:text/plain;charset=utf-8,${encodeURIComponent(`${r.title}\nSubject: ${r.subject}\nCampusExpo study material.`)}`}
                      download={r.fileName ?? "material.txt"}
                      className="btn btn-ghost text-[12px] px-3 py-1.5"
                    >
                      Download
                    </a>
                  </Card>
                ))}
            </div>
          </div>
        ))
      )}
    </>
  );
}
