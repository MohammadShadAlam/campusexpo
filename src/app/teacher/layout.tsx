import { requireUser } from "@/lib/auth";
import { BottomNav } from "@/components/Shell";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  await requireUser("teacher");
  return (
    <div className="min-h-dvh pb-24">
      <div className="max-w-2xl mx-auto px-4">{children}</div>
      <BottomNav role="teacher" />
    </div>
  );
}
