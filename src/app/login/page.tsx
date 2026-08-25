"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/actions";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, null as { error?: string } | null);
  return (
    <main className="min-h-dvh flex flex-col justify-center px-6 py-10 max-w-md mx-auto w-full">
      <div className="flex flex-col items-center">
        <Logo size={56} />
        <h1 className="mt-3 text-2xl font-extrabold text-navy">CampusExpo</h1>
        <p className="text-[12px] text-slate-500">Your Campus. Your Academics. Your Future.</p>
      </div>

      <div className="card p-6 mt-8">
        <h2 className="font-bold text-navy text-lg">Sign in</h2>
        <p className="text-[12px] text-slate-500 mb-4">One account for students, faculty & admin.</p>
        <form action={action} className="space-y-3">
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" required className="input" placeholder="you@college.edu" />
          </div>
          <div>
            <label className="label">Password</label>
            <input name="password" type="password" required className="input" placeholder="••••••••" />
          </div>
          {state?.error && (
            <p className="text-[12px] text-rose-600 font-medium">{state.error}</p>
          )}
          <button disabled={pending} className="btn btn-primary w-full">
            {pending ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <div className="flex justify-between mt-4 text-[12px]">
          <Link href="/forgot-password" className="text-navy font-semibold">
            Forgot password?
          </Link>
          <Link href="/signup" className="text-navy font-semibold">
            Create account
          </Link>
        </div>
      </div>

      <div className="card p-4 mt-4 text-[11px] text-slate-500 leading-relaxed">
        <p className="font-bold text-navy mb-1 text-[12px]">Demo accounts (password: password123)</p>
        admin@campusexpo.edu · faculty@campusexpo.edu · student@campusexpo.edu
      </div>
    </main>
  );
}
