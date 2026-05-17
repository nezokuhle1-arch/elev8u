import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900">Create your account</h1>
          <p className="mt-2 text-sm text-zinc-600">Join Elev8U as a freelancer or client</p>
        </div>
        <form className="space-y-4">
          <Input type="text" placeholder="Full name" required />
          <Input type="email" placeholder="Email" required />
          <Input type="password" placeholder="Password" required />
          <Button type="submit" className="w-full">
            Sign up
          </Button>
        </form>
        <p className="text-center text-sm text-zinc-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[var(--color-primary)]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
