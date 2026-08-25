import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { logoutAction } from "@/lib/actions";

export default async function PendingPage() {
  const user = await getSessionUser();
  const rejected = user?.status === "rejected";
  const suspended = user?.status === "suspended";
  return (
    <main className="min-h-dvh flex flex-col justify-center items-center px-6 text-center max-w-md mx-auto">
      <Logo size={56} />
      <h1 className="mt-4 text-xl font-extrabold text-navy">
        {rejected ? "Registration Rejected" : suspended ? "Account Suspended" : "Registration Submitted"}
      </h1>
      <p className="mt-3 text-[13px] text-slate-600 leading-relaxed">
        {rejected
          ? "Your registration request was not approved. Please contact the administration office for assistance."
          : suspended
            ? "Your account has been suspended by the administrator. Please contact the administration office."
            : "Your registration request has been submitted. Your account will become active after administrator approval."}
      </p>
      <div className="card p-4 mt-6 w-full text-left">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Status</p>
        <p className="font-semibold text-navy capitalize mt-1">
          {user ? user.status : "Pending"} → Under Review → Approved
        </p>
      </div>
      <div className="mt-6 w-full space-y-3">
        {user ? (
          <form action={logoutAction}>
            <button className="btn btn-primary w-full">Sign out</button>
          </form>
        ) : (
          <Link href="/login" className="btn btn-primary w-full">
            Go to Sign In
          </Link>
        )}
      </div>
    </main>
  );
}
