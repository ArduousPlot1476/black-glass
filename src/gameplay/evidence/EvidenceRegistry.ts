import type { EvidenceEntry } from "./evidenceTypes";

/**
 * Read-only index over authored evidence entries. Registry is passive data —
 * collection state lives in {@link EvidenceStore}.
 */
export class EvidenceRegistry {
  private readonly byId = new Map<string, EvidenceEntry>();

  constructor(entries: readonly EvidenceEntry[]) {
    for (const entry of entries) {
      if (this.byId.has(entry.id)) {
        throw new Error(`EvidenceRegistry: duplicate id "${entry.id}"`);
      }
      this.byId.set(entry.id, entry);
    }
  }

  has(id: string): boolean {
    return this.byId.has(id);
  }

  get(id: string): EvidenceEntry | null {
    return this.byId.get(id) ?? null;
  }

  all(): readonly EvidenceEntry[] {
    return [...this.byId.values()];
  }
}
