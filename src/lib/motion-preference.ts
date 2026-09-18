import { useSyncExternalStore } from "react";

/**
 * A single site-wide switch for ambient, looping motion — the header ticker and
 * the hero video.
 *
 * WCAG 2.2.2 requires a way to stop any animation that runs for more than five
 * seconds, and `prefers-reduced-motion` only covers people who have set that
 * system preference. This gives everyone else a control.
 *
 * The preference seeds from `prefers-reduced-motion` on first visit and is then
 * remembered per browser.
 */

export type MotionState = "running" | "paused";

const STORAGE_KEY = "weast-wing-motion";

let current: MotionState = "running";
let initialized = false;
const listeners = new Set<() => void>();

function apply(state: MotionState) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset["motion"] = state;
}

function emit() {
  for (const listener of listeners) listener();
}

/** Resolve the starting value from storage, falling back to the OS preference. */
function initialize() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }

  if (stored === "paused" || stored === "running") {
    current = stored;
  } else if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    current = "paused";
  }

  apply(current);
  emit();
}

export function setMotionState(state: MotionState) {
  if (state === current) return;
  current = state;
  try {
    window.localStorage.setItem(STORAGE_KEY, state);
  } catch {
    /* storage unavailable */
  }
  apply(state);
  emit();
}

function subscribe(listener: () => void) {
  initialize();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => current;
// The server always renders the running state; `initialize` corrects it on the
// client before paint if the visitor has asked for stillness.
const getServerSnapshot = (): MotionState => "running";

export function useMotionState(): MotionState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
