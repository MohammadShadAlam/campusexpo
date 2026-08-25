import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { Logo } from "@/components/Logo";
import { IdCardActions } from "@/components/IdCardActions";
import { createHash } from "crypto";

function QrCode({ value }: { value: string }) {
  const hash = createHash("sha256").update(value).digest();
  const size = 21;
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) cells.push(((hash[i % hash.length] >> i % 8) & 1) === 1);
  const finder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-28 h-28 bg-white rounded-lg p-1">
      {cells.map((on, i) => {
        const x = i % size;
        const y = Math.floor(i / size);
        if (finder(x, y)) return null;
        return on ? <rect key={i} x={x} y={y} width="1" height="1" fill="#0f2352" /> : null;
      })}
      {[
        [0, 0],
        [size - 7, 0],
        [0, size - 7],
      ].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width="7" height="7" fill="none" stroke="#0f2352" strokeWidth="1" />
          <rect x={x + 2} y={y + 2} width="3" height="3" fill="#0f2352" />
        </g>
      ))}
    </svg>
  );
}

export default async function IdCardPage() {
  const user = await requireUser("student");
  const st = user.student!;
  const payload = `CAMPUSEXPO|${st.enrollmentNumber}|${st.rollNumber}|${user.fullName}`;

  return (
    <>
      <PageHeader title="Digital ID Card" subtitle="Officially issued by CampusExpo" back="/student" />
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-navy text-white">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <Logo size={38} dark />
          <div>
            <p className="font-extrabold tracking-tight">CampusExpo</p>
            <p className="text-[10px] text-white/60">Institute of Engineering & Technology</p>
          </div>
        </div>
        <div className="bg-white text-navy p-5">
          <div className="flex gap-4">
            <div className="w-24 h-28 rounded-xl bg-[#eef2fb] grid place-items-center text-3xl font-extrabold text-navy border border-slate-200">
              {user.fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-extrabold leading-tight">{user.fullName}</p>
              <p className="text-[12px] text-slate-500">{user.department}</p>
              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                <div><dt className="text-slate-400">Roll No.</dt><dd className="font-semibold">{st.rollNumber}</dd></div>
                <div><dt className="text-slate-400">Enrollment</dt><dd className="font-semibold">{st.enrollmentNumber}</dd></div>
                <div><dt className="text-slate-400">Semester</dt><dd className="font-semibold">{st.semester}</dd></div>
                <div><dt className="text-slate-400">Section</dt><dd className="font-semibold">{st.section}</dd></div>
                <div><dt className="text-slate-400">Batch</dt><dd className="font-semibold">{st.batch}</dd></div>
                <div><dt className="text-slate-400">Validity</dt><dd className="font-semibold">31 Jul 2027</dd></div>
              </dl>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4">
            <QrCode value={payload} />
            <div className="text-[11px] text-slate-500">
              <p className="font-bold text-navy text-[12px]">Scan to verify</p>
              <p className="mt-1">This digital identity card is the property of the institute and must be produced on demand.</p>
            </div>
          </div>
        </div>
      </div>
      <IdCardActions payload={payload} />
    </>
  );
}
