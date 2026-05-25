"use client";

import {
  CATEGORY_SKILL_SUGGESTIONS,
  FREELANCER_CATEGORIES,
  GENERIC_SKILL_SUGGESTIONS,
  type PortfolioLink,
} from "@/lib/freelancer/categories";
import { createClient } from "@/lib/supabase/client";
import { ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const inputClassName =
  "w-full rounded-lg border border-gray-200 p-3 outline-none focus:border-[#305CDE] focus:ring-2 focus:ring-[#305CDE]/20";

export type ServiceTier = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  type: "one_time" | "subscription";
};

export type FreelancerProfileData = {
  freelancerId: string;
  fullName: string;
  location: string;
  category: string;
  bio: string;
  isVetted: boolean;
  skills: string[];
  tiers: ServiceTier[];
  portfolioLinks: PortfolioLink[];
};

type FreelancerProfileEditorProps = {
  initial: FreelancerProfileData;
};

export function FreelancerProfileEditor({ initial }: FreelancerProfileEditorProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(initial.fullName);
  const [location, setLocation] = useState(initial.location);
  const [category, setCategory] = useState(initial.category);
  const [bio, setBio] = useState(initial.bio);
  const [skills, setSkills] = useState<string[]>(initial.skills);
  const [skillInput, setSkillInput] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState<PortfolioLink[]>(
    initial.portfolioLinks
  );
  const [tiers, setTiers] = useState<ServiceTier[]>(initial.tiers);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const oneTimeTier = initial.tiers.find((t) => t.type === "one_time");
  const subTier = initial.tiers.find((t) => t.type === "subscription");

  const [oneTimePrice, setOneTimePrice] = useState(
    oneTimeTier ? String(oneTimeTier.price) : ""
  );
  const [oneTimeDesc, setOneTimeDesc] = useState(
    oneTimeTier?.description ?? ""
  );
  const [subPrice, setSubPrice] = useState(
    subTier ? String(subTier.price) : ""
  );
  const [subDesc, setSubDesc] = useState(subTier?.description ?? "");

  const skillSuggestions = useMemo(() => {
    const specific = CATEGORY_SKILL_SUGGESTIONS[category] ?? [];
    return [...specific, ...GENERIC_SKILL_SUGGESTIONS].filter(
      (s) => !skills.includes(s)
    );
  }, [category, skills]);

  const bioMinMet = bio.trim().length >= 50;

  function resetForm() {
    setFullName(initial.fullName);
    setLocation(initial.location);
    setCategory(initial.category);
    setBio(initial.bio);
    setSkills(initial.skills);
    setPortfolioLinks(initial.portfolioLinks);
    setOneTimePrice(oneTimeTier ? String(oneTimeTier.price) : "");
    setOneTimeDesc(oneTimeTier?.description ?? "");
    setSubPrice(subTier ? String(subTier.price) : "");
    setSubDesc(subTier?.description ?? "");
    setError(null);
  }

  function addSkill(skill: string) {
    const trimmed = skill.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    setSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
  }

  async function persistPortfolioLinks(links: PortfolioLink[]) {
    const supabase = createClient();
    await supabase
      .from("freelancer_profiles")
      .update({ portfolio_links: links })
      .eq("id", initial.freelancerId);
  }

  async function addPortfolioLink() {
    const title = linkTitle.trim();
    const url = linkUrl.trim();
    if (!title || !url) return;
    const next = [...portfolioLinks, { title, url }];
    setPortfolioLinks(next);
    setLinkTitle("");
    setLinkUrl("");
    await persistPortfolioLinks(next);
    setToast("Portfolio link added!");
    setTimeout(() => setToast(null), 2500);
  }

  async function removePortfolioLink(index: number) {
    const next = portfolioLinks.filter((_, i) => i !== index);
    setPortfolioLinks(next);
    await persistPortfolioLinks(next);
  }

  async function handleSave() {
    if (!bioMinMet) {
      setError("Bio must be at least 50 characters.");
      return;
    }

    setSaving(true);
    setError(null);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      setError("Not signed in.");
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), location: location.trim() })
      .eq("id", user.id);

    if (profileError) {
      setSaving(false);
      setError(profileError.message);
      return;
    }

    const { error: fpError } = await supabase
      .from("freelancer_profiles")
      .update({
        bio: bio.trim(),
        category,
        location: location.trim(),
        portfolio_links: portfolioLinks,
      })
      .eq("id", initial.freelancerId);

    if (fpError) {
      setSaving(false);
      setError(fpError.message);
      return;
    }

    await supabase
      .from("freelancer_skills")
      .delete()
      .eq("freelancer_id", initial.freelancerId);

    if (skills.length > 0) {
      const { error: skillsError } = await supabase
        .from("freelancer_skills")
        .insert(
          skills.map((skill) => ({
            freelancer_id: initial.freelancerId,
            skill,
          }))
        );
      if (skillsError) {
        setSaving(false);
        setError(skillsError.message);
        return;
      }
    }

    await supabase
      .from("service_tiers")
      .delete()
      .eq("freelancer_id", initial.freelancerId);

    const tiersToInsert = [];
    if (oneTimePrice) {
      tiersToInsert.push({
        freelancer_id: initial.freelancerId,
        name: "One-time service",
        description: oneTimeDesc.trim() || null,
        price: Number(oneTimePrice),
        type: "one_time" as const,
      });
    }
    if (subPrice) {
      tiersToInsert.push({
        freelancer_id: initial.freelancerId,
        name: "Monthly subscription",
        description: subDesc.trim() || null,
        price: Number(subPrice),
        type: "subscription" as const,
      });
    }

    if (tiersToInsert.length > 0) {
      const { error: tiersError } = await supabase
        .from("service_tiers")
        .insert(tiersToInsert);
      if (tiersError) {
        setSaving(false);
        setError(tiersError.message);
        return;
      }
    }

    const newTiers: ServiceTier[] = [];
    if (oneTimePrice) {
      newTiers.push({
        id: oneTimeTier?.id ?? "one-time",
        name: "One-time service",
        description: oneTimeDesc.trim() || null,
        price: Number(oneTimePrice),
        type: "one_time",
      });
    }
    if (subPrice) {
      newTiers.push({
        id: subTier?.id ?? "subscription",
        name: "Monthly subscription",
        description: subDesc.trim() || null,
        price: Number(subPrice),
        type: "subscription",
      });
    }
    setTiers(newTiers);

    setSaving(false);
    setEditing(false);
    setToast("Profile updated!");
    setTimeout(() => setToast(null), 3000);
    router.refresh();
  }

  return (
    <div className="px-4 py-6">
      {toast && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="text-center flex-1">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E8EEFB] text-2xl font-semibold text-[#305CDE]">
            {initial.fullName
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          {!editing && (
            <>
              <h2 className="mt-3 text-xl font-semibold text-zinc-900">
                {fullName}
              </h2>
              <span className="mt-2 inline-block rounded-full bg-[#E8EEFB] px-3 py-1 text-sm text-[#305CDE]">
                {category}
              </span>
              <p className="mt-2 text-sm text-gray-500">{location}</p>
              {initial.isVetted ? (
                <span className="mt-3 inline-block rounded-full bg-[#E8EEFB] px-3 py-1 text-xs font-medium text-[#305CDE]">
                  ✓ Verified by Elev8U
                </span>
              ) : (
                <span className="mt-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                  Pending review
                </span>
              )}
            </>
          )}
        </div>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 rounded-xl bg-[#305CDE] px-4 py-2 text-sm font-medium text-white hover:bg-[#1A3FA0]"
          >
            Edit profile
          </button>
        ) : null}
      </div>

      <Link
        href={`/freelancer/${initial.freelancerId}`}
        className="mb-6 block text-sm text-[#305CDE] underline"
      >
        View public profile
      </Link>

      {editing ? (
        <div className="space-y-5">
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
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClassName}
            >
              {FREELANCER_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Bio
            </label>
            <textarea
              rows={5}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={inputClassName}
            />
            <p
              className={`mt-1 text-xs ${bioMinMet ? "text-[#305CDE]" : "text-zinc-500"}`}
            >
              {bio.trim().length} / 50 characters minimum
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Skills
            </label>
            <div className="mb-2 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-[#E8EEFB] px-3 py-1 text-sm text-[#1A3FA0]"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() =>
                      setSkills((prev) => prev.filter((s) => s !== skill))
                    }
                    className="rounded-full p-0.5 hover:bg-[#305CDE]/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(skillInput);
                  }
                }}
                placeholder="Add a skill"
                className={inputClassName}
              />
              <button
                type="button"
                onClick={() => addSkill(skillInput)}
                className="shrink-0 rounded-lg bg-[#305CDE] px-4 py-2 text-sm font-medium text-white hover:bg-[#1A3FA0]"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {skillSuggestions.slice(0, 6).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSkill(s)}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs text-zinc-600 hover:border-[#305CDE] hover:text-[#305CDE]"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-gray-100 p-4">
            <p className="text-sm font-medium text-zinc-900">One-time service</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                R
              </span>
              <input
                type="number"
                min="0"
                value={oneTimePrice}
                onChange={(e) => setOneTimePrice(e.target.value)}
                className={`${inputClassName} pl-8`}
                placeholder="0.00"
              />
            </div>
            <input
              value={oneTimeDesc}
              onChange={(e) => setOneTimeDesc(e.target.value)}
              placeholder="Description"
              className={inputClassName}
            />
          </div>

          <div className="space-y-4 rounded-xl border border-gray-100 p-4">
            <p className="text-sm font-medium text-zinc-900">
              Monthly subscription
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                R
              </span>
              <input
                type="number"
                min="0"
                value={subPrice}
                onChange={(e) => setSubPrice(e.target.value)}
                className={`${inputClassName} pl-8`}
                placeholder="0.00"
              />
            </div>
            <input
              value={subDesc}
              onChange={(e) => setSubDesc(e.target.value)}
              placeholder="Description"
              className={inputClassName}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-lg bg-[#305CDE] py-3 text-sm font-medium text-white hover:bg-[#1A3FA0] disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setEditing(false);
              }}
              className="text-sm text-[#305CDE] hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {initial.bio && (
            <section className="mb-6">
              <h3 className="mb-2 text-base font-medium text-zinc-900">About</h3>
              <p className="text-sm leading-relaxed text-gray-600">{bio}</p>
            </section>
          )}

          {skills.length > 0 && (
            <section className="mb-6">
              <h3 className="mb-2 text-base font-medium text-zinc-900">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-[#6B8EE8] bg-[#E8EEFB] px-3 py-1 text-xs text-[#1A3FA0]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="mb-6">
            <h3 className="mb-3 text-base font-medium text-zinc-900">
              My services
            </h3>
            {tiers.length === 0 ? (
              <p className="text-sm text-gray-400">No services listed yet.</p>
            ) : (
              tiers.map((tier) => (
                <article
                  key={tier.id}
                  className="mb-3 rounded-xl border border-gray-100 p-4"
                >
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="font-medium text-zinc-900">{tier.name}</p>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${
                          tier.type === "subscription"
                            ? "bg-[#EEEDFE] text-[#534AB7]"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {tier.type === "subscription"
                          ? "Monthly plan"
                          : "One-time"}
                      </span>
                    </div>
                    <p className="shrink-0 font-medium text-[#305CDE]">
                      R{Number(tier.price)}
                      {tier.type === "subscription" ? "/mo" : ""}
                    </p>
                  </div>
                  {tier.description && (
                    <p className="mt-2 text-sm text-gray-500">
                      {tier.description}
                    </p>
                  )}
                </article>
              ))
            )}
          </section>
        </>
      )}

      <section className="mt-8 border-t border-gray-100 pt-6">
        <h3 className="mb-4 text-base font-medium text-zinc-900">
          Portfolio &amp; Work Samples
        </h3>

        <div className="mb-4 space-y-2">
          <input
            value={linkTitle}
            onChange={(e) => setLinkTitle(e.target.value)}
            placeholder="Project title"
            className={inputClassName}
          />
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
            className={inputClassName}
          />
          <button
            type="button"
            onClick={addPortfolioLink}
            className="w-full rounded-lg border border-[#305CDE] py-2 text-sm font-medium text-[#305CDE] hover:bg-[#E8EEFB]"
          >
            Add link
          </button>
        </div>

        <div className="space-y-2">
          {portfolioLinks.map((link, index) => (
            <div
              key={`${link.url}-${index}`}
              className="flex items-center gap-3 rounded-xl border border-gray-100 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-zinc-900">{link.title}</p>
                <p className="truncate text-xs text-gray-400">{link.url}</p>
              </div>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-[#305CDE]"
                aria-label="Open link"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => removePortfolioLink(index)}
                className="shrink-0 text-gray-400 hover:text-red-500"
                aria-label="Remove link"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

      </section>
    </div>
  );
}
