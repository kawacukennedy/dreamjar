import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useDebounce } from "../hooks/useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));
    expect(result.current).toBe("initial");
  });

  it("debounces value changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 500 } },
    );

    // Initial value
    expect(result.current).toBe("initial");

    // Change value
    rerender({ value: "changed", delay: 500 });
    expect(result.current).toBe("initial"); // Should still be old value

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("changed");
  });

  it("respects different delay values", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 1000 } },
    );

    rerender({ value: "changed", delay: 1000 });
    expect(result.current).toBe("initial");

    // Advance by 500ms - should still be old value
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe("initial");

    // Advance by another 500ms - should now be new value
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe("changed");
  });

  it("cancels previous timeout when value changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "first", delay: 500 } },
    );

    // Change value quickly
    rerender({ value: "second", delay: 500 });
    expect(result.current).toBe("first");

    // Advance time partially
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("first");

    // Change value again before first timeout completes
    rerender({ value: "third", delay: 500 });

    // Advance time to complete the second change
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe("third");
  });

  it("cleans up timeout on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

    const { unmount } = renderHook(() => useDebounce("test", 500));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
