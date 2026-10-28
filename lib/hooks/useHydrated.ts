import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// False during SSR and the hydration pass, true afterwards. Gate anything that
// reads persisted client state (e.g. the auth store) on this to avoid mismatches.
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
