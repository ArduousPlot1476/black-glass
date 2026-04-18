import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

export type InteractionKind = "inspect" | "toggle" | "pickup";

export interface InteractionContext {
  showInspectPanel(title: string, body: string): void;
  hideInspectPanel(): void;
  flashHint(text: string): void;
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
