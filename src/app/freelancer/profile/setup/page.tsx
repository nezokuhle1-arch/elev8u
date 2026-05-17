import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ProfileSetupPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900">Set up your profile</h1>
      <p className="mt-2 text-zinc-600">
        Tell clients about your skills and services.
      </p>
      <form className="mt-8 space-y-4">
        <Input placeholder="Category (e.g. Plumbing)" required />
        <Input placeholder="Location (e.g. Johannesburg)" required />
        <textarea
          className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20"
          placeholder="Bio"
          rows={4}
        />
        <Button type="submit" className="w-full">
          Save profile
        </Button>
      </form>
    </div>
  );
}
