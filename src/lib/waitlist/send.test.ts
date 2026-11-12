import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

import { sendWaitlistConfirmation, SEND_TIMEOUT_MS } from "./send";

const EMAIL = "someone+test@example.com";
const KEY = "re_test_secret_key";
const signup = {
  id: "0b9f6a52-3c1e-4f55-9d0a-6f1d3d2f8a11",
  position: 48,
  createdAt: "2026-11-07T10:00:00Z",
};

describe("sendWaitlistConfirmation", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    process.env.RESEND_API_KEY = KEY;
    process.env.WAITLIST_REPLY_TO = "reply@example.com";
    process.env.WAITLIST_UNSUBSCRIBE_SECRET = "s3cret";
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.elev8u.co.za";
    sendMock.mockReset();
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    errorSpy.mockRestore();
  });

  function loggedText() {
    return JSON.stringify(errorSpy.mock.calls);
  }

  it("sends with the right from, reply-to, headers and idempotency key", async () => {
    sendMock.mockResolvedValue({ data: { id: "x" }, error: null });
    const ok = await sendWaitlistConfirmation({
      email: EMAIL,
      signup,
      idempotencyKey: "waitlist-confirm/abc",
    });
    expect(ok).toBe(true);
    const [payload, opts] = sendMock.mock.calls[0];
    expect(payload.from).toBe("Elev8U <hello@elev8u.co.za>");
    expect(payload.replyTo).toBe("reply@example.com");
    expect(payload.subject).toBe("You're #48 on the Elev8U V2 waitlist");
    expect(payload.headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
    expect(payload.headers["List-Unsubscribe"]).toMatch(
      /^<https:\/\/www\.elev8u\.co\.za\/unsubscribe\?id=.+&t=.+>$/
    );
    expect(opts).toEqual({ idempotencyKey: "waitlist-confirm/abc" });
  });

  it("sends no idempotency key when none is given (resend)", async () => {
    sendMock.mockResolvedValue({ data: { id: "x" }, error: null });
    await sendWaitlistConfirmation({ email: EMAIL, signup });
    expect(sendMock.mock.calls[0][1]).toBeUndefined();
  });

  it("returns false and logs no address or key when Resend returns an error", async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { name: "validation_error", statusCode: 422, message: `bad ${EMAIL}` },
    });
    expect(await sendWaitlistConfirmation({ email: EMAIL, signup })).toBe(false);
    expect(loggedText()).not.toContain(EMAIL);
    expect(loggedText()).not.toContain(KEY);
  });

  it("returns false when the call throws, with nothing sensitive logged", async () => {
    sendMock.mockRejectedValue(new Error(`boom ${EMAIL} ${KEY}`));
    expect(await sendWaitlistConfirmation({ email: EMAIL, signup })).toBe(false);
    expect(loggedText()).not.toContain(EMAIL);
    expect(loggedText()).not.toContain(KEY);
  });

  it("returns false after the timeout instead of hanging", async () => {
    vi.useFakeTimers();
    sendMock.mockReturnValue(new Promise(() => {}));
    const pending = sendWaitlistConfirmation({ email: EMAIL, signup });
    await vi.advanceTimersByTimeAsync(SEND_TIMEOUT_MS + 1);
    expect(await pending).toBe(false);
  });

  it("returns false without calling Resend when config is missing or the site URL is wrong in production", async () => {
    delete process.env.RESEND_API_KEY;
    expect(await sendWaitlistConfirmation({ email: EMAIL, signup })).toBe(false);
    process.env.RESEND_API_KEY = KEY;
    vi.stubEnv("NODE_ENV", "production");
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    expect(await sendWaitlistConfirmation({ email: EMAIL, signup })).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
