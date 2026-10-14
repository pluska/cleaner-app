import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

const { mockUseSession } = vi.hoisted(() => ({
  mockUseSession: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  useSession: mockUseSession,
}));

import { useUser } from "./useUser";

describe("useUser hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthenticated state when no session exists", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    const { result } = renderHook(() => useUser());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("returns loading state while session is being retrieved", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "loading",
    });

    const { result } = renderHook(() => useUser());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("returns user data and authenticated flag when session is active", () => {
    const mockUser = { id: "user-123", email: "hero@cleaner.com", name: "Sir Clean" };
    mockUseSession.mockReturnValue({
      data: { user: mockUser },
      status: "authenticated",
    });

    const { result } = renderHook(() => useUser());

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });
});
