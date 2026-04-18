import type { Scene } from "@babylonjs/core/scene";

import type { InteractionSystem } from "../interaction/InteractionSystem";
import type { Interactable, InteractionContext } from "../interaction/interactionTypes";
import { verbForKind } from "../interaction/interactionTypes";
import type { InputState } from "../player/input";
import type { PlayerController } from "../player/PlayerController";

/**
 * Minimal DOM overlay for:
 *  - center reticle
 *  - bottom-center interaction prompt
 *  - modal inspect panel for "read" interactions
 *  - transient hint line
 *
 * Owns its own DOM nodes and keyboard/frame hooks; cleaned up via dispose().
 */
export class InteractionPrompt {
  private readonly host: HTMLElement;
  private readonly reticle: HTMLDivElement;
  private readonly prompt: HTMLDivElement;
  private readonly inspect: HTMLDivElement;
  private readonly inspectTitle: HTMLHeadingElement;
  private readonly inspectBody: HTMLPreElement;
  private readonly hint: HTMLDivElement;

  private readonly scene: Scene;
  private readonly input: InputState;
  private readonly player: PlayerController;

  private inspectOpen = false;
  private inspectCooldown = 0;
  private hintTimer: number | null = null;
  private unsubscribe: (() => void) | null = null;

  private readonly onBeforeRender: () => void;

  constructor(
    host: HTMLElement,
    scene: Scene,
    input: InputState,
    player: PlayerController,
  ) {
    this.host = host;
    this.scene = scene;
    this.input = input;
    this.player = player;

    this.reticle = document.createElement("div");
    this.reticle.className = "bg-reticle";

    this.prompt = document.createElement("div");
    this.prompt.className = "bg-prompt";

    this.hint = document.createElement("div");
    this.hint.className = "bg-hint";

    this.inspect = document.createElement("div");
    this.inspect.className = "bg-inspect hidden";

    const card = document.createElement("div");
    card.className = "bg-inspect-card";
    this.inspectTitle = document.createElement("h3");
    this.inspectBody = document.createElement("pre");
    const footer = document.createElement("small");
    footer.textContent = "Press E to close";
    card.appendChild(this.inspectTitle);
    card.appendChild(this.inspectBody);
    card.appendChild(footer);
    this.inspect.appendChild(card);

    host.appendChild(this.reticle);
    host.appendChild(this.prompt);
    host.appendChild(this.hint);
    host.appendChild(this.inspect);

    this.onBeforeRender = (): void => {
      if (this.inspectOpen) {
        if (this.inspectCooldown > 0) {
          this.inspectCooldown -= scene.getEngine().getDeltaTime();
        } else if (this.input.consumeJustPressed("interact")) {
          this.closeInspect({ unpause: true });
        }
      }
    };
    scene.onBeforeRenderObservable.add(this.onBeforeRender);
  }

  /** Force-close the panel without changing pause state — used when the pause menu is about to take over. */
  closeInspectForced(): void {
    this.closeInspect({ unpause: false });
  }

  bindSystem(system: InteractionSystem): void {
    this.unsubscribe?.();
    this.unsubscribe = system.onTargetChanged((t) => this.updatePrompt(t));
  }

  context(): InteractionContext {
    return {
      showInspectPanel: (title, body) => this.showInspectPanel(title, body),
      hideInspectPanel: () => this.closeInspect({ unpause: true }),
      flashHint: (text) => this.flashHint(text),
    };
  }

  isInspectOpen(): boolean {
    return this.inspectOpen;
  }

  dispose(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.scene.onBeforeRenderObservable.removeCallback(this.onBeforeRender);
    if (this.hintTimer !== null) window.clearTimeout(this.hintTimer);
    for (const el of [this.reticle, this.prompt, this.hint, this.inspect]) {
      if (el.parentElement === this.host) this.host.removeChild(el);
    }
  }

  private updatePrompt(t: Interactable | null): void {
    if (!t) {
      this.prompt.textContent = "";
      this.prompt.classList.remove("visible");
      return;
    }
    this.prompt.textContent = `[E] ${verbForKind(t.kind)} — ${t.prompt}`;
    this.prompt.classList.add("visible");
  }

  private showInspectPanel(title: string, body: string): void {
    this.inspectTitle.textContent = title;
    this.inspectBody.textContent = body;
    this.inspect.classList.remove("hidden");
    this.inspectOpen = true;
    this.inspectCooldown = 180;
    this.player.setPaused(true);
    this.prompt.classList.remove("visible");
  }

  private closeInspect(options: { unpause: boolean }): void {
    if (!this.inspectOpen) return;
    this.inspect.classList.add("hidden");
    this.inspectOpen = false;
    if (options.unpause) {
      this.player.setPaused(false);
      this.player.requestPointerLock();
    }
  }

  private flashHint(text: string): void {
    this.hint.textContent = text;
    this.hint.classList.add("visible");
    if (this.hintTimer !== null) window.clearTimeout(this.hintTimer);
    this.hintTimer = window.setTimeout(() => {
      this.hint.classList.remove("visible");
      this.hintTimer = null;
    }, 1800);
  }
}
