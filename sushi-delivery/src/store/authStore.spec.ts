import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "../api/authApi";

const storage = vi.hoisted(() => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));
const getCurrentUser = vi.hoisted(() => vi.fn());
vi.mock("expo-secure-store", () => storage);
vi.mock("../api/authApi", () => ({ getCurrentUser }));

let store: (typeof import("./authStore"))["useAuthStore"];
let ApiError: (typeof import("../api/client"))["ApiError"];
let saved: string | null;
const user = { id: 1, firstName: "User" } as AuthUser;
beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  saved = "saved-token";
  storage.getItemAsync.mockImplementation(async () => saved);
  storage.setItemAsync.mockImplementation(async (_key, token) => {
    saved = token;
  });
  storage.deleteItemAsync.mockImplementation(async () => {
    saved = null;
  });
  ({ ApiError } = await import("../api/client"));
  store = (await import("./authStore")).useAuthStore;
});

describe("session recovery", () => {
  it.each(["offline", "timeout", "server"])(
    "retains the saved token on %s and supports a retry",
    async (reason) => {
      getCurrentUser.mockRejectedValueOnce(
        new ApiError(
          reason,
          reason === "server" ? 503 : 0,
          undefined,
          reason === "timeout" ? "timeout" : "network",
        ),
      );
      await store.getState().restoreSession();
      expect(saved).toBe("saved-token");
      expect(storage.deleteItemAsync).not.toHaveBeenCalled();
      expect(store.getState()).toMatchObject({
        restoreError: true,
        isRestoring: false,
      });
      getCurrentUser.mockResolvedValueOnce(user);
      await store.getState().restoreSession();
      expect(store.getState()).toMatchObject({
        accessToken: "saved-token",
        user,
        restoreError: false,
        isRestoring: false,
      });
    },
  );

  it("deletes an invalid token after an explicit HTTP 401", async () => {
    getCurrentUser.mockRejectedValueOnce(new ApiError("Expired", 401));
    await store.getState().restoreSession();
    expect(saved).toBeNull();
    expect(storage.deleteItemAsync).toHaveBeenCalledOnce();
    expect(store.getState()).toMatchObject({
      user: null,
      accessToken: null,
      restoreError: false,
      isRestoring: false,
    });
  });

  it("does not delete a token when the device storage cannot be read", async () => {
    storage.getItemAsync.mockRejectedValueOnce(
      new Error("Storage unavailable"),
    );
    await store.getState().restoreSession();
    expect(saved).toBe("saved-token");
    expect(storage.deleteItemAsync).not.toHaveBeenCalled();
    expect(store.getState().restoreError).toBe(true);
  });

  it("does not resurrect the user when an old restore finishes after logout", async () => {
    let resolve!: (user: AuthUser) => void;
    getCurrentUser.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const restoring = store.getState().restoreSession();
    await vi.waitFor(() => expect(getCurrentUser).toHaveBeenCalledOnce());
    await store.getState().logout();
    resolve(user);
    await restoring;
    expect(saved).toBeNull();
    expect(store.getState()).toMatchObject({ user: null, accessToken: null });
  });

  it("does not erase a new login when an older restore returns 401", async () => {
    let reject!: (error: Error) => void;
    getCurrentUser.mockImplementationOnce(
      () =>
        new Promise((_resolve, fail) => {
          reject = fail;
        }),
    );
    const restoring = store.getState().restoreSession();
    await vi.waitFor(() => expect(getCurrentUser).toHaveBeenCalledOnce());
    await store.getState().setAuth("new-token", { ...user, id: 2 });
    reject(new ApiError("Old token expired", 401));
    await restoring;
    expect(saved).toBe("new-token");
    expect(store.getState()).toMatchObject({
      accessToken: "new-token",
      user: { id: 2 },
    });
  });
});
