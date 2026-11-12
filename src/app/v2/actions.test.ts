import { beforeEach, describe, expect, it, vi } from "vitest";

const { rpc, sendMock, lookupMock } = vi.hoisted(() => ({
  rpc: vi.fn(),
  sendMock: vi.fn(),
  lookupMock: vi.fn(),
}));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc }) }));
vi.mock("@/lib/waitlist/send", () => ({ sendWaitlistConfirmation: sendMock }));
vi.mock("@/lib/waitlist/signups", () => ({ getWaitlistSignup: lookupMock }));

import { joinWaitlistAction, resendConfirmationAction } from "./actions";

const signup = {
  id: "0b9f6a52-3c1e-4f55-9d0a-6f1d3d2f8a11",
  position: 7,
  createdAt: "2026-11-07T10:00:00Z",
  unsubscribedAt: null as string | null,
};

function form(email: string) {
  const f = new FormData();
  f.set("email", email);
  return f;
}
const idle = { status: "idle" } as const;

describe("joinWaitlistAction", () => {
  beforeEach(() => {
    rpc.mockReset();
    sendMock.mockReset();
    lookupMock.mockReset();
    lookupMock.mockResolvedValue(signup);
  });

  it("sends exactly one email for a new signup", async () => {
    rpc.mockResolvedValue({ data: [{ position: 7, already_existed: false }], error: null });
    sendMock.mockResolvedValue(true);
    const res = await joinWaitlistAction(idle, form("a@example.com"));
    expect(res).toEqual({ status: "success", position: 7, emailSent: true });
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0][0].idempotencyKey).toBe(`waitlist-confirm/${signup.id}`);
  });

  it("never sends for an existing signup", async () => {
    rpc.mockResolvedValue({ data: [{ position: 7, already_existed: true }], error: null });
    const res = await joinWaitlistAction(idle, form("a@example.com"));
    expect(res).toEqual({ status: "already", position: 7 });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("still succeeds with emailSent false when the send fails or the lookup throws", async () => {
    rpc.mockResolvedValue({ data: [{ position: 7, already_existed: false }], error: null });
    sendMock.mockResolvedValue(false);
    expect(await joinWaitlistAction(idle, form("a@example.com"))).toEqual({
      status: "success",
      position: 7,
      emailSent: false,
    });
    lookupMock.mockRejectedValue(new Error("db down"));
    expect(await joinWaitlistAction(idle, form("a@example.com"))).toEqual({
      status: "success",
      position: 7,
      emailSent: false,
    });
  });
});

describe("resendConfirmationAction", () => {
  beforeEach(() => {
    rpc.mockReset();
    sendMock.mockReset();
    lookupMock.mockReset();
  });

  it("never touches or sends for an unsubscribed address", async () => {
    lookupMock.mockResolvedValue({ ...signup, unsubscribedAt: "2026-11-08T00:00:00Z" });
    expect(await resendConfirmationAction("a@example.com")).toEqual({
      allowed: false,
      emailSent: false,
    });
    expect(rpc).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("does not send when touch_resend refuses (10-minute limit)", async () => {
    lookupMock.mockResolvedValue(signup);
    rpc.mockResolvedValue({ data: false, error: null });
    expect((await resendConfirmationAction("a@example.com")).allowed).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("sends once without an idempotency key when allowed", async () => {
    lookupMock.mockResolvedValue(signup);
    rpc.mockResolvedValue({ data: true, error: null });
    sendMock.mockResolvedValue(true);
    expect(await resendConfirmationAction("a@example.com")).toEqual({
      allowed: true,
      emailSent: true,
    });
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0][0].idempotencyKey).toBeUndefined();
  });
});
