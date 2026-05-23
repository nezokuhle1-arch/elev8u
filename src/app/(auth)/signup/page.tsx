"use client";

import { createClient } from "@/lib/supabase/client";
import { Briefcase, Eye, EyeOff, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Role = "freelancer" | "client";

const inputClassName =
  "w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-[#305CDE] focus:ring-2 focus:ring-[#305CDE]/20";

export default function SignupPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("freelancer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.push(
        role === "freelancer"
          ? "/freelancer/profile/setup"
          : "/client/home"
      );
      router.refresh();
      return;
    }

    setError(
      "Account created. Check your email to confirm your address, then sign in."
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full sm:max-w-md">
        <p className="text-center text-2xl font-bold text-[#305CDE]">Elev8U</p>
        <h1 className="mt-6 text-center text-2xl font-bold text-zinc-900">
          Create your account
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setRole("freelancer")}
              className={`w-full rounded-lg border-2 p-4 text-left transition-colors sm:flex-1 ${
                role === "freelancer"
                  ? "border-[#305CDE] bg-[#E8EEFB]"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <Briefcase className="h-6 w-6 text-[#305CDE]" />
              <p className="mt-2 font-semibold text-zinc-900">
                I&apos;m a Freelancer
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                Get discovered, earn predictably
              </p>
            </button>
            <button
              type="button"
              onClick={() => setRole("client")}
              className={`w-full rounded-lg border-2 p-4 text-left transition-colors sm:flex-1 ${
                role === "client"
                  ? "border-[#305CDE] bg-[#E8EEFB]"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <Search className="h-6 w-6 text-[#305CDE]" />
              <p className="mt-2 font-semibold text-zinc-900">
                I&apos;m looking for a Pro
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                Find trusted local professionals
              </p>
            </button>
          </div>

          <div>
            <label htmlFor="fullName" className="sr-only">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Full name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClassName}
            />
          </div>

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
              minLength={6}
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
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#305CDE]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
