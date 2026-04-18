export type EvidenceCategory = "document" | "object" | "observation";

export interface EvidenceEntry {
  readonly id: string;
  readonly title: string;
  readonly category: EvidenceCategory;
  readonly summary: string;
  readonly body: string;
}

export function labelForCategory(category: EvidenceCategory): string {
  switch (category) {
    case "document":
      return "Document";
    case "object":
      return "Object";
    case "observation":
      return "Observation";
  }
}
