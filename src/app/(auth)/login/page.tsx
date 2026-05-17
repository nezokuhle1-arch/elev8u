import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <p className="text-zinc-600">Loading…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
