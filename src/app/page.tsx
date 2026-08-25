import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { Logo } from "@/components/Logo";

export default async function SplashPage() {
  const user = await getSessionUser();
  if (user) redirect(user.status === "approved" ? `/${user.role}` : "/pending");

  return (
    <main className="min-h-dvh bg-navy text-white flex flex-col items-center justify-center px-8 text-center">
      <Logo size={76} />
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">CampusExpo</h1>
      <div className="mt-2 h-[3px] w-14 bg-gold rounded-full" />
      <p className="mt-4 text-[13px] text-white/70 max-w-xs">
        Your Campus. Your Academics. Your Future.
      </p>
      <div className="mt-10 w-full max-w-xs space-y-3">
        <Link href="/login" className="btn btn-gold w-full">
          Sign In
        </Link>
        <Link
          href="/signup"
          className="btn w-full border border-white/25 text-white hover:bg-white/10"
        >
          Create Account
        </Link>
      </div>
      <p className="mt-10 text-[11px] text-white/40">
        Official digital campus platform · Est. 2026
      </p>
    </main>
  );
}
