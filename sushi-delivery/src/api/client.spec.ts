import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient, ApiError, setUnauthorizedHandler } from "./client";

const unauthorized = vi.fn();
beforeEach(() => {
  vi.useFakeTimers();
  setUnauthorizedHandler(unauthorized);
  unauthorized.mockClear();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function pendingFetch() {
  const fetch = vi.fn(
    (_url: string, options: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        const signal = options.signal!;
        const abort = () => reject(new DOMException("Aborted", "AbortError"));
        if (signal.aborted) abort();
        else signal.addEventListener("abort", abort, { once: true });
      }),
  );
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

describe("mobile API request lifetime", () => {
  it("stops a stalled request after 30 seconds without expiring the account", async () => {
    pendingFetch();
    const pending = expect(
      apiClient.getWithAuth("/products", "token"),
    ).rejects.toMatchObject({ kind: "timeout", status: 0 });
    await vi.advanceTimersByTimeAsync(30_001);
    await pending;
    expect(unauthorized).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("propagates caller cancellation and removes its listener and timeout", async () => {
    pendingFetch();
    const caller = new AbortController();
    const remove = vi.spyOn(caller.signal, "removeEventListener");
    const pending = expect(
      apiClient.get("/products", { signal: caller.signal }),
    ).rejects.toMatchObject({ name: "AbortError" });
    caller.abort();
    await pending;
    expect(remove).toHaveBeenCalledWith("abort", expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });

  it("honors a signal aborted before the request begins", async () => {
    const fetch = pendingFetch();
    const caller = new AbortController();
    caller.abort();
    await expect(
      apiClient.get("/products", { signal: caller.signal }),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(fetch.mock.calls[0][1].signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps the timeout active while reading the response body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, options: RequestInit) => ({
        ok: true,
        status: 200,
        json: () =>
          new Promise((_resolve, reject) =>
            options.signal!.addEventListener(
              "abort",
              () => reject(new DOMException("Aborted", "AbortError")),
              { once: true },
            ),
          ),
      })),
    );
    const pending = expect(
      apiClient.get("/products", { timeoutMs: 100 }),
    ).rejects.toMatchObject({ kind: "timeout" });
    await vi.advanceTimersByTimeAsync(101);
    await pending;
    expect(vi.getTimerCount()).toBe(0);
  });

  it("distinguishes offline and malformed responses from invalid credentials", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockRejectedValueOnce(new TypeError("Offline"))
        .mockResolvedValueOnce(new Response("bad json")),
    );
    await expect(
      apiClient.getWithAuth("/auth/me", "token"),
    ).rejects.toMatchObject({ kind: "network" });
    await expect(
      apiClient.getWithAuth("/auth/me", "token"),
    ).rejects.toMatchObject({ kind: "response" });
    expect(unauthorized).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("only notifies an expired authenticated session for HTTP 401", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ message: "Expired" }), { status: 401 }),
      ),
    );
    await expect(
      apiClient.getWithAuth("/auth/me", "token"),
    ).rejects.toBeInstanceOf(ApiError);
    expect(unauthorized).toHaveBeenCalledWith("token");
    unauthorized.mockClear();
    await expect(
      apiClient.post("/auth/telegram/verify", {}),
    ).rejects.toMatchObject({ status: 401 });
    expect(unauthorized).not.toHaveBeenCalled();
  });
});
