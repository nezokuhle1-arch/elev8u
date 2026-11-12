import { beforeEach, describe, expect, it } from "vitest";
import {
  signUnsubscribeToken,
  verifyUnsubscribeToken,
} from "./unsubscribe-token";

const ID = "0b9f6a52-3c1e-4f55-9d0a-6f1d3d2f8a11";
const OTHER = "1c8e7b63-4d2f-4a66-8e1b-7a2e4e3a9b22";

describe("unsubscribe token", () => {
  beforeEach(() => {
    process.env.WAITLIST_UNSUBSCRIBE_SECRET = "test-secret-one";
  });

  it("verifies a token it signed", () => {
    expect(verifyUnsubscribeToken(ID, signUnsubscribeToken(ID))).toBe(true);
  });

  it("rejects a token for a different id, a tampered or empty token, and a non-uuid id", () => {
    const token = signUnsubscribeToken(ID);
    expect(verifyUnsubscribeToken(OTHER, token)).toBe(false);
    expect(verifyUnsubscribeToken(ID, token.slice(0, -1) + "x")).toBe(false);
    expect(verifyUnsubscribeToken(ID, "")).toBe(false);
    expect(verifyUnsubscribeToken("not-a-uuid", token)).toBe(false);
  });

  it("rejects a token signed with another secret", () => {
    const token = signUnsubscribeToken(ID);
    process.env.WAITLIST_UNSUBSCRIBE_SECRET = "test-secret-two";
    expect(verifyUnsubscribeToken(ID, token)).toBe(false);
  });

  it("throws a clear error when the secret is missing", () => {
    delete process.env.WAITLIST_UNSUBSCRIBE_SECRET;
    expect(() => signUnsubscribeToken(ID)).toThrow(
      "Missing required env var: WAITLIST_UNSUBSCRIBE_SECRET"
    );
  });
});
