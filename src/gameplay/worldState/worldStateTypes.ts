/**
 * World-state schema for the M3 slice. Kept as a flat, explicit record so new
 * flags stay discoverable and checkpoint serialization is trivial.
 *
 * Keep this narrow. If a flag is only ever read by one room and one
 * interactable, prefer local state. This type is for progression.
 */
export type PowerRouting = "server_alcove" | "security_nook";

export interface WorldStateSnapshot {
  readonly powerRouting: PowerRouting;
  readonly maintenancePanelOpen: boolean;
  readonly corridorLockdownCleared: boolean;
}

export type WorldStateListener = (
  next: WorldStateSnapshot,
  prev: WorldStateSnapshot,
) => void;
