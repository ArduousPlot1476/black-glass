import type { WorldStateSnapshot } from "../../gameplay/worldState/worldStateTypes";

/**
 * Canonical starting world state for a fresh run. Power defaults to the
 * server alcove (the "expected" routing) so the security nook — and therefore
 * the override that clears the corridor lockdown — is something the player
 * has to deliberately reach for.
 */
export const INITIAL_WORLD_STATE: WorldStateSnapshot = {
  powerRouting: "server_alcove",
  maintenancePanelOpen: false,
  corridorLockdownCleared: false,
};
