"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  IconChevronDown,
  IconEye,
  IconEyeOff,
  IconPhone,
  IconShield,
  IconUser,
} from "../components/icons";

const roles = ["Health Camp", "Volunteer", "District Admin"];

const roleApi: Record<string, string> = {
  "Health Camp": "camp_manager",
  "Volunteer": "volunteer",
  "District Admin": "admin",
};

const roleRedirects: Record<string, string> = {
  "Health Camp": "/queue",
  "Volunteer": "/volunteer/tasks",
  "District Admin": "/admin/dashboard",
};

const fieldLabel = "text-[12px] font-semibold text-slate-700";
const fieldBox =
  "mt-1.5 flex h-12 items-center rounded-xl border border-slate-200 bg-white pl-3.5 pr-3.5 transition focus-within:border-channel focus-within:ring-2 focus-within:ring-sky-100";

export function LoginForm() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [role, setRole] = useState("Health Camp");
  const [showPassword, setShowPassword] = useState(false);

  // Login inputs (defaults preserved)
  const [identifier, setIdentifier] = useState("ahmad.raza");
  const [password, setPassword] = useState("camp2025");

  // Signup inputs
  const [signupUsername, setSignupUsername] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, role: roleApi[role] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed. Please try again.");
        return;
      }
      router.push(roleRedirects[role] ?? "/queue");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!signupUsername.trim() || !signupName.trim() || !signupPassword.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signupUsername,
          name: signupName,
          phone: signupPhone || "0300 1234567",
          password: signupPassword,
          role: roleApi[role] ?? "volunteer",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create account. Please try again.");
        return;
      }
      router.push(roleRedirects[role] ?? "/queue");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-5">
      {/* Mode Switcher */}
      <div className="flex rounded-2xl bg-slate-100 p-1 mb-4">
        <button
          type="button"
          onClick={() => { setTab("login"); setError(""); }}
          className={`flex-1 rounded-xl py-2 text-[13px] font-bold transition ${
            tab === "login" ? "bg-white text-ink shadow-xs" : "text-slate-500"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setTab("signup"); setRole("Volunteer"); setError(""); }}
          className={`flex-1 rounded-xl py-2 text-[13px] font-bold transition ${
            tab === "signup" ? "bg-white text-ink shadow-xs" : "text-slate-500"
          }`}
        >
          Sign Up / Register
        </button>
      </div>

      <label className="block mb-4">
        <span className={fieldLabel}>Portal Role</span>
        <span className="relative mt-1.5 block">
          <select
            value={role}
            onChange={(e) => {
              const newRole = e.target.value;
              setRole(newRole);
              if (newRole === "Health Camp") {
                setIdentifier("ahmad.raza");
                setPassword("camp2025");
              } else if (newRole === "Volunteer") {
                setIdentifier("hamza.khan");
                setPassword("volunteer2025");
              } else {
                setIdentifier("admin@alkhidmat.org");
                setPassword("admin2025");
              }
            }}
            className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-10 text-[14px] font-semibold text-ink outline-none transition focus:border-channel focus:ring-2 focus:ring-sky-100"
          >
            {roles.filter((r) => tab === "signup" ? r === "Volunteer" : true).map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <IconChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </span>
      </label>

      {tab === "login" ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <label className="block">
            <span className={fieldLabel}>Phone or Staff ID</span>
            <span className={`${fieldBox} gap-2`}>
              <IconPhone className="h-[18px] w-[18px] shrink-0 text-emerald-500" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setError(""); }}
                autoComplete="username"
                className="h-full w-full bg-transparent text-[14px] font-semibold text-ink outline-none"
              />
            </span>
          </label>

          <label className="block">
            <span className={fieldLabel}>Password</span>
            <span className="relative mt-1.5 block">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                autoComplete="current-password"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-3.5 pr-11 text-[14px] font-semibold tracking-[0.08em] text-ink outline-none transition focus:border-channel focus:ring-2 focus:ring-sky-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-slate-400 transition active:scale-90"
              >
                {showPassword ? <IconEyeOff className="h-[18px] w-[18px]" /> : <IconEye className="h-[18px] w-[18px]" />}
              </button>
            </span>
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-600">
              {error}
            </p>
          )}

          <div className="-mt-1 text-right">
            <a href="#" className="text-[12px] font-semibold text-sky-500">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-1 h-[52px] w-full rounded-xl bg-ink text-[15px] font-bold text-white shadow-lg shadow-ink/25 transition active:scale-[0.99] disabled:opacity-60"
          >
            {busy ? "Signing in..." : "Login"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="flex flex-col gap-3.5">
          <label className="block">
            <span className={fieldLabel}>Staff Full Name</span>
            <input
              type="text"
              required
              value={signupName}
              onChange={(e) => { setSignupName(e.target.value); setError(""); }}
              placeholder="e.g. Dr. Rashid Munir"
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[13.5px] font-semibold text-ink outline-none focus:border-channel"
            />
          </label>

          <label className="block">
            <span className={fieldLabel}>Username / ID</span>
            <input
              type="text"
              required
              value={signupUsername}
              onChange={(e) => { setSignupUsername(e.target.value); setError(""); }}
              placeholder="e.g. rashid.manager"
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[13.5px] font-semibold text-ink outline-none focus:border-channel"
            />
          </label>

          <label className="block">
            <span className={fieldLabel}>Contact Phone</span>
            <input
              type="tel"
              value={signupPhone}
              onChange={(e) => { setSignupPhone(e.target.value); setError(""); }}
              placeholder="0300 1234567"
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[13.5px] font-semibold text-ink outline-none focus:border-channel"
            />
          </label>

          <label className="block">
            <span className={fieldLabel}>Create Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={signupPassword}
              onChange={(e) => { setSignupPassword(e.target.value); setError(""); }}
              placeholder="At least 6 characters"
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[13.5px] font-semibold text-ink outline-none focus:border-channel"
            />
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-1 h-[52px] w-full rounded-xl bg-channel text-[15px] font-bold text-white shadow-lg shadow-channel/25 transition active:scale-[0.99] disabled:opacity-60"
          >
            {busy ? "Registering..." : `Create ${role} Account`}
          </button>
        </form>
      )}

      <a
        href="#"
        className="mt-3 flex items-center justify-center gap-1.5 text-[12.5px] font-semibold text-channel"
      >
        <IconShield className="h-4 w-4" />
        Secure login with Alkhidmat
      </a>
    </div>
  );
}
