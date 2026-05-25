"use client";

import { Elev8ULogo } from "@/components/ui/Elev8ULogo";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

const inputClassName =
  "w-full rounded-lg border border-gray-200 p-3 outline-none focus:border-[#305CDE] focus:ring-2 focus:ring-[#305CDE]/20";

type Mode = "signin" | "forgot" | "forgot-success";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordUpdated =
    searchParams.get("message") === "password-updated";

  async function handleSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    setLoading(false);

    if (profileError) {
      setError(profileError.message);
      return;
    }

    const redirectTo = searchParams.get("redirectTo");
    if (redirectTo) {
      router.push(redirectTo);
    } else if (profile.role === "freelancer") {
      router.push("/freelancer/dashboard");
    } else {
      router.push("/client/home");
    }
    router.refresh();
  }

  async function handleForgotPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMode("forgot-success");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full sm:max-w-md">
        <Elev8ULogo size="md" theme="light" centered href="/" />
        <h1 className="mt-6 text-center text-2xl font-bold text-zinc-900">
          {mode === "signin" ? "Welcome back" : "Reset your password"}
        </h1>

        {passwordUpdated && mode === "signin" && (
          <p className="mt-4 rounded-lg bg-[#E8EEFB] px-3 py-2 text-center text-sm text-[#305CDE]">
            Password updated successfully. Sign in with your new password.
          </p>
        )}

        {mode === "signin" && (
          <form onSubmit={handleSignIn} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassName}
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClassName}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setMode("forgot");
                setError(null);
              }}
              className="mb-4 block w-full cursor-pointer text-right text-xs text-[#305CDE] hover:underline"
            >
              Forgot password?
            </button>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#305CDE] p-3 font-medium text-white hover:bg-[#1A3FA0] disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword} className="mt-8 space-y-5">
            <p className="text-sm text-zinc-500">
              Enter your email and we&apos;ll send you a reset link.
            </p>
            <div>
              <label htmlFor="reset-email" className="sr-only">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassName}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#305CDE] p-3 font-medium text-white hover:bg-[#1A3FA0] disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className="w-full text-center text-sm text-[#305CDE] hover:underline"
            >
              Back to sign in
            </button>
          </form>
        )}

        {mode === "forgot-success" && (
          <div className="mt-8 space-y-4 text-center">
            <p className="text-sm text-[#305CDE]">
              Reset link sent! Check your email.
            </p>
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="text-sm text-[#305CDE] hover:underline"
            >
              Back to sign in
            </button>
          </div>
        )}

        {mode === "signin" && (
          <p className="mt-6 text-center text-sm text-zinc-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-[#305CDE]">
              Sign up
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
