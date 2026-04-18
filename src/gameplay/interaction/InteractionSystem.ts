import type { Scene } from "@babylonjs/core/scene";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

import type { PlayerController } from "../player/PlayerController";
import type { InputState } from "../player/input";
import { readInteractable } from "./Interactable";
import type { Interactable, InteractionContext } from "./interactionTypes";

type TargetListener = (target: Interactable | null) => void;

export class InteractionSystem {
  private readonly scene: Scene;
  private readonly player: PlayerController;
  private readonly input: InputState;
  private readonly context: InteractionContext;

  private active = true;
  private current: Interactable | null = null;
  private readonly listeners = new Set<TargetListener>();
  private readonly onBeforeRender: () => void;
  private readonly predicate: (mesh: AbstractMesh) => boolean;

  constructor(
    scene: Scene,
    player: PlayerController,
    input: InputState,
    context: InteractionContext,
  ) {
    this.scene = scene;
    this.player = player;
    this.input = input;
    this.context = context;

    this.predicate = (m) => m.isEnabled() && !!readInteractable(m);
    this.onBeforeRender = (): void => this.update();
    scene.onBeforeRenderObservable.add(this.onBeforeRender);
  }

  onTargetChanged(cb: TargetListener): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  getCurrent(): Interactable | null {
    return this.current;
  }

  setActive(active: boolean): void {
    if (this.active === active) return;
    this.active = active;
    if (!active) this.setCurrent(null);
  }

  dispose(): void {
    this.scene.onBeforeRenderObservable.removeCallback(this.onBeforeRender);
    this.listeners.clear();
  }

  private update(): void {
    if (!this.active || this.player.isPaused() || !this.player.isPointerLocked()) {
      if (this.current) this.setCurrent(null);
      return;
    }

    const ray = this.player.getForwardRay();
    const hit = this.scene.pickWithRay(ray, this.predicate);
    const next = hit?.hit && hit.pickedMesh ? readInteractable(hit.pickedMesh) : null;
    const nextValid = next && (!next.isAvailable || next.isAvailable()) ? next : null;
    if (nextValid !== this.current) this.setCurrent(nextValid);

    if (this.current && this.input.consumeJustPressed("interact")) {
      this.current.activate(this.context);
    }
  }

  private setCurrent(target: Interactable | null): void {
    this.current = target;
    for (const listener of this.listeners) listener(target);
  }
}
