import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { PageHeader, Card, SectionTitle } from "@/components/ui";
import { logoutAction } from "@/lib/actions";

function Row({ k, v }: { k: string; v: string | number | null | undefined }) {
  return (
    <div className="flex justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-[12px] text-slate-500">{k}</span>
      <span className="text-[13px] font-semibold text-navy text-right">{v ?? "—"}</span>
    </div>
  );
}

export default async function StudentProfile() {
  const user = await requireUser("student");
  const st = user.student!;
  return (
    <>
      <PageHeader title="Profile" subtitle="Your academic identity" back="/student" />
      <Card className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-navy text-white grid place-items-center text-2xl font-extrabold">
          {user.fullName.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="font-extrabold text-navy text-lg leading-tight">{user.fullName}</p>
          <p className="text-[12px] text-slate-500 truncate">{user.email}</p>
          <p className="text-[12px] text-gold font-semibold">{st.rollNumber}</p>
        </div>
      </Card>

      <SectionTitle title="Academic Details" />
      <Card>
        <Row k="Enrollment Number" v={st.enrollmentNumber} />
        <Row k="Department" v={user.department} />
        <Row k="Course" v={st.course} />
        <Row k="Year" v={st.year} />
        <Row k="Semester" v={st.semester} />
        <Row k="Section" v={st.section} />
        <Row k="Batch" v={st.batch} />
        <Row k="CGPA" v={st.cgpa} />
      </Card>

      <SectionTitle title="Contact" />
      <Card>
        <Row k="Email" v={user.email} />
        <Row k="Phone" v={user.phone} />
        <Row k="Account Status" v={user.status} />
      </Card>

      <SectionTitle title="More" />
      <div className="grid grid-cols-2 gap-3">
        <Link href="/student/id-card" className="btn btn-ghost">Digital ID</Link>
        <Link href="/student/leave" className="btn btn-ghost">Leave Requests</Link>
        <Link href="/student/calendar" className="btn btn-ghost">Academic Calendar</Link>
        <Link href="/notifications" className="btn btn-ghost">Notifications</Link>
      </div>
      <form action={logoutAction} className="mt-4">
        <button className="btn btn-primary w-full">Sign out</button>
      </form>
    </>
  );
}
