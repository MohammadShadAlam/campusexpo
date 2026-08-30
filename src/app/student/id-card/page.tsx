import { requireUser } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { IdCardActions } from "@/components/IdCardActions";
import { createHash } from "crypto";
import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 font-sans flex flex-col -mx-3 sm:-mx-6 -mt-4">
      
      {/* 1. Header Section - Clean & Sticky */}
      <header className="pt-4 pb-3 px-3 bg-white border-b border-slate-100 sticky top-0 z-20 w-full shadow-sm">
        <div className="flex items-center gap-3 w-full">
          <Link href="/student" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 shadow-sm active:scale-95 transition-transform shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-600" /> Digital ID Card
            </h1>
            <p className="text-[12px] text-slate-500 font-medium truncate">
              Officially issued by CampusExpo
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 px-3 py-4 w-full flex flex-col gap-6 mt-2">
        <div className="rounded-[22px] overflow-hidden border border-slate-200 shadow-sm bg-navy text-white w-full">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
            <Logo size={38} dark />
            <div>
              <p className="font-extrabold tracking-tight">CampusExpo</p>
              <p className="text-[10px] text-white/60">Institute of Engineering & Technology</p>
            </div>
          </div>
          <div className="bg-white text-navy p-4.5">
            <div className="flex gap-3.5">
              <div className="w-24 h-28 rounded-xl bg-[#eef2fb] grid place-items-center text-3xl font-extrabold text-navy border border-slate-200 shrink-0">
                {user.fullName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-extrabold leading-tight truncate">{user.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.department}</p>
                <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                  <div><dt className="text-slate-400">Roll No.</dt><dd className="font-semibold">{st.rollNumber}</dd></div>
                  <div><dt className="text-slate-400">Enrollment</dt><dd className="font-semibold truncate">{st.enrollmentNumber}</dd></div>
                  <div><dt className="text-slate-400">Semester</dt><dd className="font-semibold">{st.semester}</dd></div>
                  <div><dt className="text-slate-400">Section</dt><dd className="font-semibold">{st.section}</dd></div>
                  <div><dt className="text-slate-400">Batch</dt><dd className="font-semibold">{st.batch}</dd></div>
                  <div><dt className="text-slate-400">Validity</dt><dd className="font-semibold">31 Jul 2027</dd></div>
                </dl>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3.5">
              <QrCode value={payload} />
              <div className="text-[11px] text-slate-500 min-w-0 flex-1">
                <p className="font-bold text-navy text-[12px]">Scan to verify</p>
                <p className="mt-1 leading-relaxed">This digital identity card is the property of the institute and must be produced on demand.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full">
          <IdCardActions payload={payload} />
        </div>
      </div>

    </div>
  );
}