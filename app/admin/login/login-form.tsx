"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconEye, IconEyeOff, IconShield, IconSparkles } from "../../components/icons";

const fieldLabel = "text-[12px] font-semibold text-slate-700";

export function AdminLoginForm() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);

  // Login inputs (defaults preserved)
  const [email, setEmail] = useState("admin@alkhidmat.org");
  const [password, setPassword] = useState("admin2025");

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
        body: JSON.stringify({ identifier: email, password, role: "admin" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed. Please try again.");
        return;
      }
      router.push("/admin/dashboard");
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
          phone: signupPhone || "0300 9998887",
          password: signupPassword,
          role: "admin",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create admin account. Please try again.");
        return;
      }
      router.push("/admin/dashboard");
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
          onClick={() => { setTab("signup"); setError(""); }}
          className={`flex-1 rounded-xl py-2 text-[13px] font-bold transition ${
            tab === "signup" ? "bg-white text-ink shadow-xs" : "text-slate-500"
          }`}
        >
          Register Admin
        </button>
      </div>

      {tab === "login" ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <label className="block">
            <span className={fieldLabel}>Email or Username</span>
            <input
              type="text"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              autoComplete="username"
              className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[14px] font-semibold text-ink outline-none transition focus:border-channel focus:ring-2 focus:ring-sky-100"
            />
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
                {showPassword ? (
                  <IconEyeOff className="h-[18px] w-[18px]" />
                ) : (
                  <IconEye className="h-[18px] w-[18px]" />
                )}
              </button>
            </span>
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] font-medium text-red-600">{error}</p>
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
            <span className={fieldLabel}>Admin Full Name</span>
            <input
              type="text"
              required
              value={signupName}
              onChange={(e) => { setSignupName(e.target.value); setError(""); }}
              placeholder="e.g. Tariq Javed"
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[13.5px] font-semibold text-ink outline-none focus:border-channel"
            />
          </label>

          <label className="block">
            <span className={fieldLabel}>Official Email or ID</span>
            <input
              type="text"
              required
              value={signupUsername}
              onChange={(e) => { setSignupUsername(e.target.value); setError(""); }}
              placeholder="e.g. tariq.admin@alkhidmat.org"
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[13.5px] font-semibold text-ink outline-none focus:border-channel"
            />
          </label>

          <label className="block">
            <span className={fieldLabel}>Official Mobile Phone</span>
            <input
              type="tel"
              value={signupPhone}
              onChange={(e) => { setSignupPhone(e.target.value); setError(""); }}
              placeholder="0300 9998887"
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
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] font-medium text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-1 h-[52px] w-full rounded-xl bg-purple-700 text-[15px] font-bold text-white shadow-lg shadow-purple-700/25 transition active:scale-[0.99] disabled:opacity-60"
          >
            {busy ? "Registering..." : "Create Admin Account"}
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
