import { describe, expect, it, beforeEach } from "vitest";
import { useSparklinStore } from "./useSparklinStore";

describe("useSparklinStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useSparklinStore.setState({
      isOpen: false,
      message: null,
      _clickCount: 0,
      _lastClickTime: 0,
    });
  });

  it("toggles open state and sets custom message", () => {
    const store = useSparklinStore.getState();
    expect(store.isOpen).toBe(false);

    store.setIsOpen(true);
    expect(useSparklinStore.getState().isOpen).toBe(true);

    store.setMessage({ en: "Hello", es: "Hola" });
    expect(useSparklinStore.getState().message).toEqual({ en: "Hello", es: "Hola" });
  });

  it("triggers anti-spam defense after 5 rapid clicks within 3 seconds", () => {
    const store = useSparklinStore.getState();

    // 4 clicks: not yet triggered
    for (let i = 0; i < 4; i++) {
      store.handleSpamClick();
    }
    expect(useSparklinStore.getState().isOpen).toBe(false);

    // 5th click triggers antiSpam response
    store.handleSpamClick();
    const state = useSparklinStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.message).toBeDefined();
    expect(state._clickCount).toBe(0); // reset
  });

  it("resets click counter if more than 3 seconds elapsed between clicks", () => {
    const store = useSparklinStore.getState();

    // Click 1
    store.handleSpamClick();
    expect(useSparklinStore.getState()._clickCount).toBe(1);

    // Simulate 4 seconds passing
    useSparklinStore.setState({ _lastClickTime: Date.now() - 4000 });

    // Next click should reset to 1 instead of incrementing to 2
    store.handleSpamClick();
    expect(useSparklinStore.getState()._clickCount).toBe(1);
  });

  it("triggers appropriate greeting according to system time", () => {
    const store = useSparklinStore.getState();
    store.triggerGreeting();

    const state = useSparklinStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.message).toBeDefined();
    expect(state.message?.en).toBeTruthy();
    expect(state.message?.es).toBeTruthy();
  });

  it("triggers status messages for different HTTP status codes", () => {
    const store = useSparklinStore.getState();

    // 404
    store.triggerStatus("404");
    expect(useSparklinStore.getState().isOpen).toBe(true);
    expect(useSparklinStore.getState().message).toBeDefined();

    // 500
    store.triggerStatus("500");
    expect(useSparklinStore.getState().isOpen).toBe(true);

    // 401
    store.triggerStatus("401");
    expect(useSparklinStore.getState().isOpen).toBe(true);

    // 200
    store.triggerStatus("200");
    expect(useSparklinStore.getState().isOpen).toBe(true);
  });

  it("triggers warnings, completed tasks, and streak celebrations", () => {
    const store = useSparklinStore.getState();

    // Valid warning from sparklin.json
    store.triggerWarning("pendingTasksLate");
    expect(useSparklinStore.getState().isOpen).toBe(true);
    expect(useSparklinStore.getState().message).toBeDefined();

    // Completed task
    store.setIsOpen(false);
    store.triggerCompletedTask();
    expect(useSparklinStore.getState().isOpen).toBe(true);

    // Streak
    store.setIsOpen(false);
    store.triggerStreak();
    expect(useSparklinStore.getState().isOpen).toBe(true);
  });
});
