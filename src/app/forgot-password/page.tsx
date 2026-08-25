"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "@/lib/actions";
import { Logo } from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(
    resetPasswordAction,
    null as { error?: string; ok?: string } | null,
  );
  return (
    <main className="min-h-dvh flex flex-col justify-center px-6 max-w-md mx-auto w-full">
      <div className="flex flex-col items-center">
        <Logo size={48} />
        <h1 className="mt-3 text-xl font-extrabold text-navy">Reset password</h1>
        <p className="text-[12px] text-slate-500">Verify your registered email to set a new password.</p>
      </div>
      <form action={action} className="card p-5 mt-6 space-y-3">
        <div>
          <label className="label">Registered Email</label>
          <input name="email" type="email" required className="input" />
        </div>
        <div>
          <label className="label">New Password</label>
          <input name="password" type="password" required className="input" />
        </div>
        <div>
          <label className="label">Confirm New Password</label>
          <input name="confirmPassword" type="password" required className="input" />
        </div>
        {state?.error && <p className="text-[12px] text-rose-600 font-medium">{state.error}</p>}
        {state?.ok && <p className="text-[12px] text-emerald-600 font-medium">{state.ok}</p>}
        <button disabled={pending} className="btn btn-primary w-full">
          {pending ? "Updating…" : "Reset Password"}
        </button>
        <Link href="/login" className="block text-center text-[12px] font-semibold text-navy">
          Back to sign in
        </Link>
      </form>
    </main>
  );
}
