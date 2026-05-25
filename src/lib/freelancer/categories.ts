export const FREELANCER_CATEGORIES = [
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

export const CATEGORY_SKILL_SUGGESTIONS: Record<string, string[]> = {
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

export const GENERIC_SKILL_SUGGESTIONS = [
  "Quality workmanship",
  "Reliable service",
  "Free quotes",
];

export type PortfolioLink = {
  title: string;
  url: string;
};
