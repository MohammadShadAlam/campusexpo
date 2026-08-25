"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signupAction } from "@/lib/actions";
import { Logo } from "@/components/Logo";

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
];

function Field({
  label,
  name,
  type = "text",
  required = true,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input name={name} type={type} required={required} className="input" placeholder={placeholder} />
    </div>
  );
}

export default function SignupPage() {
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [state, action, pending] = useActionState(signupAction, null as { error?: string } | null);

  return (
    <main className="min-h-dvh px-5 py-8 max-w-md mx-auto w-full">
      <div className="flex flex-col items-center">
        <Logo size={48} />
        <h1 className="mt-2 text-xl font-extrabold text-navy">Create your account</h1>
        <p className="text-[12px] text-slate-500 text-center mt-1">
          Registration requires administrator approval.
        </p>
      </div>

      <div className="card p-1 mt-5 grid grid-cols-2 gap-1">
        {(["student", "teacher"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`rounded-xl py-2 text-[13px] font-semibold capitalize ${
              role === r ? "bg-navy text-white" : "text-slate-500"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <form action={action} className="card p-5 mt-4 space-y-3">
        <input type="hidden" name="role" value={role} />
        <Field label="Full Name" name="fullName" placeholder="Arjun Kumar" />
        <Field label="Email" name="email" type="email" placeholder="arjun@college.edu" />
        <Field label="Phone Number" name="phone" placeholder="+91 98765 43210" />

        <div>
          <label className="label">Department</label>
          <select name="department" className="input">
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>

        {role === "student" ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Roll Number" name="rollNumber" placeholder="CSE21-045" />
              <Field label="Enrollment No." name="enrollmentNumber" placeholder="EN2021045" />
            </div>
            <Field label="Course" name="course" placeholder="B.Tech CSE" />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Year</label>
                <select name="year" className="input">
                  {[1, 2, 3, 4].map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Sem</label>
                <select name="semester" className="input">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Section</label>
                <select name="section" className="input">
                  {["A", "B", "C", "D"].map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <Field label="Batch" name="batch" placeholder="2023-2027" />
          </>
        ) : (
          <>
            <Field label="Employee ID" name="employeeId" placeholder="EMP-2041" />
            <Field label="Designation" name="designation" placeholder="Assistant Professor" />
            <Field label="Subjects" name="subjects" placeholder="Data Structures, DBMS" required={false} />
          </>
        )}

        <Field label="Profile Photo URL" name="photoUrl" required={false} placeholder="Optional" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Password" name="password" type="password" />
          <Field label="Confirm" name="confirmPassword" type="password" />
        </div>

        {state?.error && <p className="text-[12px] text-rose-600 font-medium">{state.error}</p>}
        <button disabled={pending} className="btn btn-primary w-full">
          {pending ? "Submitting…" : "Submit Registration Request"}
        </button>
        <p className="text-center text-[12px] text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="text-navy font-semibold">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
