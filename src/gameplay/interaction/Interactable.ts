import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

import type { Interactable } from "./interactionTypes";

const METADATA_KEY = "bg_interactable";

export function attachInteractable(
  mesh: AbstractMesh,
  spec: Omit<Interactable, "mesh">,
): Interactable {
  const record: Interactable = { mesh, ...spec };
  mesh.metadata = { ...(mesh.metadata ?? {}), [METADATA_KEY]: record };
  mesh.isPickable = true;
  return record;
}

export function readInteractable(mesh: AbstractMesh): Interactable | null {
  const record = mesh.metadata?.[METADATA_KEY] as Interactable | undefined;
  return record ?? null;
}

export function detachInteractable(mesh: AbstractMesh): void {
  if (mesh.metadata && METADATA_KEY in mesh.metadata) {
    delete mesh.metadata[METADATA_KEY];
  }
}
