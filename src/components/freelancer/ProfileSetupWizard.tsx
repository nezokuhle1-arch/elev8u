"use client";

import { createClient } from "@/lib/supabase/client";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Sparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const CATEGORIES = [
  "Automotive",
  "Graphic Design",
  "Plumbing",
  "Electrical",
  "Web Development",
  "Photography",
  "Cleaning",
  "Carpentry",
  "Tutoring",
  "Hair & Beauty",
  "Other",
] as const;

const CATEGORY_SKILLS: Record<string, string[]> = {
  Automotive: [
    "Engine diagnostics",
    "Brake systems",
    "Electrical",
    "Tyre fitment",
    "Oil service",
  ],
  "Graphic Design": [
    "Logo design",
    "Social media graphics",
    "Brand identity",
    "Print design",
  ],
  "Web Development": ["React", "Next.js", "UI design", "API integration"],
};

const GENERIC_SKILLS = [
  "Quality workmanship",
  "Reliable service",
  "Free quotes",
];

const PRICING_HINTS: Record<string, { oneTime: string; subscription: string }> = {
  Automotive: {
    oneTime: "R450 – R1,200 per callout",
    subscription: "R800 – R2,500 / month",
  },
  "Graphic Design": {
    oneTime: "R500 – R3,500 per project",
    subscription: "R1,500 – R5,000 / month",
  },
  Plumbing: {
    oneTime: "R350 – R900 per visit",
    subscription: "R600 – R1,800 / month",
  },
  Electrical: {
    oneTime: "R400 – R1,100 per job",
    subscription: "R700 – R2,200 / month",
  },
  "Web Development": {
    oneTime: "R2,500 – R15,000 per project",
    subscription: "R3,500 – R12,000 / month",
  },
  Photography: {
    oneTime: "R800 – R4,500 per shoot",
    subscription: "R1,200 – R6,000 / month",
  },
  Cleaning: {
    oneTime: "R250 – R700 per session",
    subscription: "R500 – R1,500 / month",
  },
  Carpentry: {
    oneTime: "R400 – R1,400 per job",
    subscription: "R750 – R2,000 / month",
  },
  Tutoring: {
    oneTime: "R150 – R400 per hour",
    subscription: "R800 – R2,500 / month",
  },
  "Hair & Beauty": {
    oneTime: "R200 – R800 per session",
    subscription: "R500 – R1,800 / month",
  },
  Other: {
    oneTime: "R300 – R1,500 per job",
    subscription: "R500 – R2,000 / month",
  },
};

const inputClassName =
  "w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20";

type FormData = {
  fullName: string;
  location: string;
  category: string;
  bio: string;
  skills: string[];
  oneTimePrice: string;
  oneTimeDescription: string;
  subscriptionPrice: string;
  subscriptionDescription: string;
};

const INITIAL_FORM: FormData = {
  fullName: "",
  location: "",
  category: "",
  bio: "",
  skills: [],
  oneTimePrice: "",
  oneTimeDescription: "",
  subscriptionPrice: "",
  subscriptionDescription: "",
};

export function ProfileSetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?redirectTo=/freelancer/profile/setup");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, location")
        .eq("id", user.id)
        .single();

      setForm((prev) => ({
        ...prev,
        fullName:
          profile?.full_name ??
          (user.user_metadata?.full_name as string | undefined) ??
          "",
        location: profile?.location ?? "",
      }));
      setLoading(false);
    }

    loadSession();
  }, [router]);

  const skillSuggestions = useMemo(() => {
    if (!form.category) return GENERIC_SKILLS;
    return CATEGORY_SKILLS[form.category] ?? GENERIC_SKILLS;
  }, [form.category]);

  const pricingHint = useMemo(() => {
    return (
      PRICING_HINTS[form.category] ?? {
        oneTime: "R300 – R1,500 per job",
        subscription: "R500 – R2,000 / month",
      }
    );
  }, [form.category]);

  const bioMinMet = form.bio.trim().length >= 50;
  const canProceedStep1 =
    form.fullName.trim() && form.location.trim() && form.category;
  const canProceedStep2 = bioMinMet && form.skills.length >= 2;
  const canProceedStep3 =
    Number(form.oneTimePrice) > 0 && Number(form.subscriptionPrice) > 0;

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addSkill(skill: string) {
    const trimmed = skill.trim();
    if (!trimmed || form.skills.includes(trimmed)) return;
    updateField("skills", [...form.skills, trimmed]);
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    updateField(
      "skills",
      form.skills.filter((s) => s !== skill)
    );
  }

  function handleNext() {
    setError(null);
    if (step < 4) setStep((s) => s + 1);
  }

  function handleBack() {
    setError(null);
    if (step > 1) setStep((s) => s - 1);
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in to publish your profile.");
      setSubmitting(false);
      return;
    }

    const bioWithSkills = `${form.bio.trim()}\n\nSkills: ${form.skills.join(", ")}`;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: form.fullName.trim(),
        location: form.location.trim(),
      })
      .eq("id", user.id);

    if (profileError) {
      setError(profileError.message);
      setSubmitting(false);
      return;
    }

    const { data: existingFreelancer } = await supabase
      .from("freelancer_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    let freelancerId = existingFreelancer?.id;

    if (freelancerId) {
      const { error: updateError } = await supabase
        .from("freelancer_profiles")
        .update({
          bio: bioWithSkills,
          category: form.category,
          location: form.location.trim(),
        })
        .eq("id", freelancerId);

      if (updateError) {
        setError(updateError.message);
        setSubmitting(false);
        return;
      }

      await supabase
        .from("service_tiers")
        .delete()
        .eq("freelancer_id", freelancerId);
    } else {
      const { data: newFreelancer, error: insertError } = await supabase
        .from("freelancer_profiles")
        .insert({
          user_id: user.id,
          bio: bioWithSkills,
          category: form.category,
          location: form.location.trim(),
        })
        .select("id")
        .single();

      if (insertError || !newFreelancer) {
        setError(insertError?.message ?? "Failed to create freelancer profile.");
        setSubmitting(false);
        return;
      }

      freelancerId = newFreelancer.id;
    }

    const { error: tiersError } = await supabase.from("service_tiers").insert([
      {
        freelancer_id: freelancerId,
        name: "One-time service",
        description: form.oneTimeDescription.trim() || null,
        price: Number(form.oneTimePrice),
        type: "one_time",
      },
      {
        freelancer_id: freelancerId,
        name: "Monthly subscription",
        description: form.subscriptionDescription.trim() || null,
        price: Number(form.subscriptionPrice),
        type: "subscription",
      },
    ]);

    setSubmitting(false);

    if (tiersError) {
      setError(tiersError.message);
      return;
    }

    router.push("/freelancer/dashboard");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-zinc-600">Loading your profile…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Progress */}
        <div className="mb-8 flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                n <= step ? "bg-[#1D9E75]" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">
                Tell us about yourself
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Step 1 of 4 · Basic info
              </p>
            </div>

            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-zinc-700">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                className={inputClassName}
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="location" className="mb-1.5 block text-sm font-medium text-zinc-700">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                className={inputClassName}
                placeholder="e.g. Johannesburg, Gauteng"
              />
            </div>

            <div>
              <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-zinc-700">
                Service category
              </label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => {
                  updateField("category", e.target.value);
                  updateField("skills", []);
                }}
                className={inputClassName}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">
                Your bio &amp; skills
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Step 2 of 4 · Bio &amp; skills
              </p>
            </div>

            <div>
              <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-zinc-700">
                Bio
              </label>
              <textarea
                id="bio"
                rows={5}
                value={form.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                className={inputClassName}
                placeholder="Describe your experience, what you specialise in, and what makes you different. Min 50 characters."
              />
              <p
                className={`mt-1.5 text-sm ${
                  bioMinMet ? "text-[#1D9E75]" : "text-zinc-500"
                }`}
              >
                {form.bio.trim().length} / 50 minimum
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Skills
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill(skillInput);
                    }
                  }}
                  className={inputClassName}
                  placeholder="Add a skill"
                />
                <button
                  type="button"
                  onClick={() => addSkill(skillInput)}
                  className="shrink-0 rounded-lg bg-[#1D9E75] px-4 py-3 text-sm font-medium text-white hover:bg-[#0F6E56]"
                >
                  Add
                </button>
              </div>

              {form.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {form.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-full bg-[#E1F5EE] px-3 py-1 text-sm text-[#085041]"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="rounded-full p-0.5 hover:bg-[#1D9E75]/20"
                        aria-label={`Remove ${skill}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <p className="mt-2 text-xs text-zinc-500">
                Minimum 2 skills required ({form.skills.length}/2)
              </p>

              <div className="mt-3">
                <p className="mb-2 text-xs font-medium text-zinc-500">
                  Suggestions for {form.category || "your category"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {skillSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => addSkill(suggestion)}
                      disabled={form.skills.includes(suggestion)}
                      className="rounded-full border border-gray-200 px-3 py-1 text-xs text-zinc-600 hover:border-[#1D9E75] hover:text-[#1D9E75] disabled:opacity-40"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">
                Set your pricing
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Step 3 of 4 · Pricing
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-[#1D9E75]" />
                  <span className="font-semibold text-zinc-900">One-time</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-600">
                      Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                        R
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.oneTimePrice}
                        onChange={(e) =>
                          updateField("oneTimePrice", e.target.value)
                        }
                        className={`${inputClassName} pl-8`}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-600">
                      Description
                    </label>
                    <input
                      type="text"
                      value={form.oneTimeDescription}
                      onChange={(e) =>
                        updateField("oneTimeDescription", e.target.value)
                      }
                      className={inputClassName}
                      placeholder="e.g. Single callout, diagnosis included"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Repeat className="h-5 w-5 text-[#1D9E75]" />
                  <span className="font-semibold text-zinc-900">
                    Subscription
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-600">
                      Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                        R
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.subscriptionPrice}
                        onChange={(e) =>
                          updateField("subscriptionPrice", e.target.value)
                        }
                        className={`${inputClassName} pl-8`}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-600">
                      Description
                    </label>
                    <input
                      type="text"
                      value={form.subscriptionDescription}
                      onChange={(e) =>
                        updateField("subscriptionDescription", e.target.value)
                      }
                      className={inputClassName}
                      placeholder="e.g. 2 visits per month + priority support"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 rounded-xl border border-[#1D9E75]/30 bg-[#E1F5EE] p-4">
              <Sparkles className="h-5 w-5 shrink-0 text-[#1D9E75]" />
              <div>
                <p className="text-sm font-medium text-[#085041]">
                  AI pricing hint for {form.category || "your category"}
                </p>
                <p className="mt-1 text-sm text-[#085041]/80">
                  One-time: {pricingHint.oneTime} · Subscription:{" "}
                  {pricingHint.subscription}
                </p>
                <p className="mt-1 text-xs text-[#085041]/60">
                  Typical rates in South Africa — adjust based on your experience
                  and demand.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 — Review */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">
                Review your profile
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Step 4 of 4 · Review &amp; publish
              </p>
            </div>

            <div className="space-y-4 rounded-xl border border-gray-200 p-5 text-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Basic info
                </p>
                <p className="mt-1 font-medium text-zinc-900">{form.fullName}</p>
                <p className="text-zinc-600">{form.location}</p>
                <p className="text-zinc-600">{form.category}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Bio &amp; skills
                </p>
                <p className="mt-1 text-zinc-700">{form.bio}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-[#E1F5EE] px-2.5 py-0.5 text-xs text-[#085041]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Pricing
                </p>
                <p className="mt-1 text-zinc-700">
                  One-time: R{form.oneTimePrice}
                  {form.oneTimeDescription && ` — ${form.oneTimeDescription}`}
                </p>
                <p className="text-zinc-700">
                  Subscription: R{form.subscriptionPrice}/mo
                  {form.subscriptionDescription &&
                    ` — ${form.subscriptionDescription}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2) ||
                (step === 3 && !canProceedStep3)
              }
              className="inline-flex items-center gap-1 rounded-lg bg-[#1D9E75] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0F6E56] disabled:opacity-50"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-lg bg-[#1D9E75] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0F6E56] disabled:opacity-50"
            >
              {submitting ? "Publishing…" : "Publish profile"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
