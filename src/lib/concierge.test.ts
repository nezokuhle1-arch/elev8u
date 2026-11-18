import { describe, expect, it } from "vitest";
import { inferCategory, normalizeCategory } from "./concierge";

describe("inferCategory", () => {
  it.each([
    ["I need a web design for my shop", "Web Development"],
    ["website for my business", "Web Development"],
    ["a web developer", "Web Development"],
    ["need a logo", "Graphic Design"],
    ["graphic work", "Graphic Design"],
    ["my car won't start", "Automotive"],
    ["a mechanic", "Automotive"],
    ["blog content writer", "Copywriting"],
    ["a photographer for a shoot", "Photography"],
    ["house cleaner", "Cleaning"],
    ["hair salon", "Hair & Beauty"],
  ])("%s -> %s", (text, expected) => {
    expect(inferCategory(text)).toBe(expected);
  });

  it("does not match keywords inside other words", () => {
    expect(inferCategory("career advice")).toBeNull();
  });
});

describe("normalizeCategory", () => {
  it("is case-insensitive for canonical names", () => {
    expect(normalizeCategory("web development")).toBe("Web Development");
    expect(normalizeCategory("HAIR & BEAUTY")).toBe("Hair & Beauty");
  });
  it("maps phrases and rejects empty values", () => {
    expect(normalizeCategory("logo")).toBe("Graphic Design");
    expect(normalizeCategory("")).toBeNull();
    expect(normalizeCategory("undefined")).toBeNull();
  });
});
