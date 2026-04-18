import type { EvidenceRegistry } from "./EvidenceRegistry";
import type { EvidenceEntry } from "./evidenceTypes";

type ChangeListener = (id: string) => void;

/**
 * In-session collection state. Idempotent: collecting the same id twice is a
 * no-op and returns false so callers can decide whether to show a "first time"
 * acknowledgement.
 */
export class EvidenceStore {
  private readonly registry: EvidenceRegistry;
  private readonly collected = new Set<string>();
  private readonly listeners = new Set<ChangeListener>();

  constructor(registry: EvidenceRegistry) {
    this.registry = registry;
  }

  /** Collect an entry. Returns true only on the first successful collect. */
  collect(id: string): boolean {
    if (!this.registry.has(id)) {
      throw new Error(`EvidenceStore: unknown evidence id "${id}"`);
    }
    if (this.collected.has(id)) return false;
    this.collected.add(id);
    for (const listener of this.listeners) listener(id);
    return true;
  }

  has(id: string): boolean {
    return this.collected.has(id);
  }

  hasAll(ids: readonly string[]): boolean {
    for (const id of ids) {
      if (!this.collected.has(id)) return false;
    }
    return true;
  }

  count(): number {
    return this.collected.size;
  }

  getCollectedEntries(): readonly EvidenceEntry[] {
    const out: EvidenceEntry[] = [];
    for (const id of this.collected) {
      const entry = this.registry.get(id);
      if (entry) out.push(entry);
    }
    return out;
  }

  onChange(listener: ChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
