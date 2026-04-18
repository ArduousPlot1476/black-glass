import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

export type InteractionKind = "inspect" | "toggle" | "pickup";

/**
 * UI-only surface owned by InteractionPrompt. Does not know about evidence
 * or other systems — keeps the prompt module self-contained.
 */
export interface PromptUIContext {
  showInspectPanel(title: string, body: string): void;
  hideInspectPanel(): void;
  flashHint(text: string): void;
}

/**
 * Composed context passed into each interactable's activate(). Extends the UI
 * surface with whatever gameplay systems the scene wants to expose. Evidence
 * hooks live here so interactables can record discoveries without knowing
 * about EvidenceStore directly.
 */
export interface InteractionContext extends PromptUIContext {
  collectEvidence(id: string): boolean;
  hasEvidence(id: string): boolean;
  hasAllEvidence(ids: readonly string[]): boolean;
}

export interface Interactable {
  mesh: AbstractMesh;
  kind: InteractionKind;
  prompt: string;
  activate(ctx: InteractionContext): void;
  isAvailable?(): boolean;
}

export function verbForKind(kind: InteractionKind): string {
  switch (kind) {
    case "inspect":
      return "Read";
    case "toggle":
      return "Use";
    case "pickup":
      return "Pick up";
  }
}
