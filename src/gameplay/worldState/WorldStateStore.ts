import type {
  WorldStateListener,
  WorldStateSnapshot,
} from "./worldStateTypes";

/**
 * Single source of truth for progression-relevant state in the M3 slice.
 * Immutable snapshots; mutations produce a new snapshot and notify listeners
 * with (next, prev) so subscribers can diff cheaply.
 */
export class WorldStateStore {
  private state: WorldStateSnapshot;
  private readonly listeners = new Set<WorldStateListener>();

  constructor(initial: WorldStateSnapshot) {
    this.state = initial;
  }

  get(): WorldStateSnapshot {
    return this.state;
  }

  set<K extends keyof WorldStateSnapshot>(
    key: K,
    value: WorldStateSnapshot[K],
  ): boolean {
    if (this.state[key] === value) return false;
    const prev = this.state;
    this.state = { ...this.state, [key]: value };
    for (const listener of this.listeners) listener(this.state, prev);
    return true;
  }

  /** Replace the whole snapshot in one shot — used by checkpoint restore. */
  replaceAll(next: WorldStateSnapshot): void {
    const prev = this.state;
    this.state = next;
    for (const listener of this.listeners) listener(this.state, prev);
  }

  onChange(listener: WorldStateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
