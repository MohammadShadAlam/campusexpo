import { requireUser } from "@/lib/auth";
import { PageHeader, QuickAction, SectionTitle } from "@/components/ui";

export default async function TeacherTasks() {
  const user = await requireUser("teacher");
  const p = user.permissions;
  return (
    <>
      <PageHeader title="Tasks" subtitle="Everything you can act on" back="/teacher" />
      <SectionTitle title="Teaching" />
      <div className="grid grid-cols-4 gap-3">
        <QuickAction href="/teacher/attendance" icon="clipboard" label="Attendance" disabled={!p.attendance} />
        <QuickAction href="/teacher/marks" icon="chart" label="Enter Marks" disabled={!p.marks} />
        <QuickAction href="/teacher/assignments" icon="doc" label="Assignments" tone="purple" />
        <QuickAction href="/teacher/materials" icon="folder" label="Material" disabled={!p.study_material} />
      </div>
      <SectionTitle title="Student Management" />
      <div className="grid grid-cols-4 gap-3">
        <QuickAction href="/teacher/leaves" icon="check" label="Leaves" tone="gold" disabled={!p.approve_leave} />
        <QuickAction href="/teacher/doubts" icon="chat" label="Doubts" tone="rose" disabled={!p.doubts} />
        <QuickAction href="/teacher/classes" icon="users" label="Students" disabled={!p.student_data} />
        <QuickAction href="/teacher/performance" icon="pulse" label="Performance" tone="green" disabled={!p.performance} />
      </div>
      <SectionTitle title="Schedule" />
      <div className="grid grid-cols-4 gap-3">
        <QuickAction href="/teacher/timetable" icon="calendar" label="Timetable" tone="green" />
        <QuickAction href="/teacher/communication" icon="megaphone" label="Comms" tone="rose" />
        <QuickAction href="/notifications" icon="bell" label="Alerts" tone="gold" />
        <QuickAction href="/search" icon="search" label="Search" />
      </div>
    </>
  );
}
