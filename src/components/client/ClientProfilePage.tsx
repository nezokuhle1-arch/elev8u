"use client";

import { createClient } from "@/lib/supabase/client";
import { formatMemberSince } from "@/lib/format";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClassName =
  "w-full rounded-lg border border-gray-200 p-3 outline-none focus:border-[#305CDE] focus:ring-2 focus:ring-[#305CDE]/20";

type ClientProfilePageProps = {
  fullName: string;
  email: string;
  location: string;
  memberSince: string;
  bookingsCount: number;
  initials: string;
};

export function ClientProfilePage({
  fullName: initialName,
  email,
  location: initialLocation,
  memberSince,
  bookingsCount,
  initials,
}: ClientProfilePageProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(initialName);
  const [location, setLocation] = useState(initialLocation);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        location: location.trim(),
      })
      .eq("id", user.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setEditing(false);
    setToast("Profile updated!");
    setTimeout(() => setToast(null), 3000);
    router.refresh();
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="px-4 py-6">
      {toast && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E8EEFB] text-2xl font-semibold text-[#305CDE]">
          {initials}
        </div>
        {!editing && (
          <>
            <h2 className="mt-4 text-xl font-semibold text-zinc-900">
              {fullName}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{email}</p>
            <p className="mt-1 text-xs text-gray-400">
              Member since {formatMemberSince(memberSince)}
            </p>
            <span className="mt-3 inline-block rounded-full bg-[#E8EEFB] px-3 py-1 text-xs font-medium text-[#305CDE]">
              Client account
            </span>
          </>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-xl bg-[#305CDE] px-4 py-2 text-sm font-medium text-white hover:bg-[#1A3FA0]"
          >
            Edit
          </button>
        ) : null}
      </div>

      {editing ? (
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Full name
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClassName}
            />
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-[#305CDE] py-3 text-sm font-medium text-white hover:bg-[#1A3FA0] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => {
              setFullName(initialName);
              setLocation(initialLocation);
              setEditing(false);
              setError(null);
            }}
            className="w-full text-center text-sm text-[#305CDE] hover:underline"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <section className="mt-8 rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Total bookings</p>
            <p className="mt-1 text-2xl font-semibold text-[#305CDE]">
              {bookingsCount}
            </p>
            <Link
              href="/client/bookings"
              className="mt-3 inline-block text-sm font-medium text-[#305CDE] hover:underline"
            >
              View all bookings →
            </Link>
          </section>
        </>
      )}

      <button
        type="button"
        onClick={handleSignOut}
        className="mt-8 w-full rounded-xl border border-red-200 bg-transparent py-3 text-sm font-medium text-red-500 hover:bg-red-50"
      >
        Sign out
      </button>
    </div>
  );
}
