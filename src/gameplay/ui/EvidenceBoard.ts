import type { Scene } from "@babylonjs/core/scene";

import type { EvidenceRegistry } from "../evidence/EvidenceRegistry";
import type { EvidenceStore } from "../evidence/EvidenceStore";
import type { EvidenceEntry } from "../evidence/evidenceTypes";
import { labelForCategory } from "../evidence/evidenceTypes";
import type { InputState } from "../player/input";
import type { PlayerController } from "../player/PlayerController";
import type { PauseMenu } from "./PauseMenu";
import type { InteractionPrompt } from "./InteractionPrompt";

/**
 * Tab-toggled evidence review overlay. Holds two panes:
 *   - a list of collected entries (grouped chronologically by collection order)
 *   - a detail pane showing the selected entry's title, category, and body
 *
 * While open, the player is paused and pointer lock is released. PauseMenu's
 * auto-open-on-unlock is suppressed for the duration so losing lock does not
 * stack another overlay on top.
 */
export class EvidenceBoard {
  private readonly host: HTMLElement;
  private readonly scene: Scene;
  private readonly input: InputState;
  private readonly player: PlayerController;
  private readonly pauseMenu: PauseMenu;
  private readonly prompt: InteractionPrompt;
  private readonly store: EvidenceStore;
  private readonly registry: EvidenceRegistry;

  private readonly overlay: HTMLDivElement;
  private readonly listEl: HTMLDivElement;
  private readonly detailTitle: HTMLHeadingElement;
  private readonly detailCategory: HTMLSpanElement;
  private readonly detailBody: HTMLPreElement;
  private readonly emptyHint: HTMLDivElement;
  private readonly counter: HTMLSpanElement;

  private open = false;
  private openCooldown = 0;
  private selectedId: string | null = null;
  private dirty = true;

  private readonly onBeforeRender: () => void;
  private readonly unsubscribeStore: () => void;

  constructor(
    host: HTMLElement,
    scene: Scene,
    input: InputState,
    player: PlayerController,
    pauseMenu: PauseMenu,
    prompt: InteractionPrompt,
    registry: EvidenceRegistry,
    store: EvidenceStore,
  ) {
    this.host = host;
    this.scene = scene;
    this.input = input;
    this.player = player;
    this.pauseMenu = pauseMenu;
    this.prompt = prompt;
    this.registry = registry;
    this.store = store;

    this.overlay = document.createElement("div");
    this.overlay.className = "bg-evidence hidden";

    const panel = document.createElement("div");
    panel.className = "bg-evidence-panel";

    const header = document.createElement("div");
    header.className = "bg-evidence-header";
    const title = document.createElement("h2");
    title.textContent = "EVIDENCE";
    this.counter = document.createElement("span");
    this.counter.className = "bg-evidence-counter";
    header.appendChild(title);
    header.appendChild(this.counter);

    const body = document.createElement("div");
    body.className = "bg-evidence-body";

    this.listEl = document.createElement("div");
    this.listEl.className = "bg-evidence-list";

    this.emptyHint = document.createElement("div");
    this.emptyHint.className = "bg-evidence-empty";
    this.emptyHint.textContent = "No evidence collected yet.";

    const detail = document.createElement("div");
    detail.className = "bg-evidence-detail";
    this.detailTitle = document.createElement("h3");
    this.detailCategory = document.createElement("span");
    this.detailCategory.className = "bg-evidence-category";
    this.detailBody = document.createElement("pre");
    detail.appendChild(this.detailTitle);
    detail.appendChild(this.detailCategory);
    detail.appendChild(this.detailBody);

    body.appendChild(this.listEl);
    body.appendChild(detail);

    const footer = document.createElement("small");
    footer.className = "bg-evidence-footer";
    footer.textContent = "Tab or Esc to close";

    panel.appendChild(header);
    panel.appendChild(this.emptyHint);
    panel.appendChild(body);
    panel.appendChild(footer);
    this.overlay.appendChild(panel);
    host.appendChild(this.overlay);

    this.unsubscribeStore = store.onChange(() => {
      this.dirty = true;
      if (this.open) this.refresh();
    });

    this.onBeforeRender = (): void => this.tick();
    scene.onBeforeRenderObservable.add(this.onBeforeRender);
  }

  isOpen(): boolean {
    return this.open;
  }

  dispose(): void {
    this.unsubscribeStore();
    this.scene.onBeforeRenderObservable.removeCallback(this.onBeforeRender);
    if (this.overlay.parentElement === this.host) {
      this.host.removeChild(this.overlay);
    }
  }

  private tick(): void {
    if (this.openCooldown > 0) {
      this.openCooldown -= this.scene.getEngine().getDeltaTime();
    }
    if (!this.open) {
      if (!this.input.consumeJustPressed("evidence")) return;
      if (!this.canOpen()) return;
      this.show();
      return;
    }
    // Open: Tab or Esc closes.
    if (this.openCooldown > 0) {
      this.input.consumeJustPressed("evidence");
      this.input.consumeJustPressed("pause");
      return;
    }
    if (
      this.input.consumeJustPressed("evidence") ||
      this.input.consumeJustPressed("pause")
    ) {
      this.hide();
    }
  }

  private canOpen(): boolean {
    if (this.pauseMenu.isOpen()) return false;
    if (this.prompt.isInspectOpen()) return false;
    if (!this.player.isPointerLocked()) return false;
    return true;
  }

  private show(): void {
    this.open = true;
    this.openCooldown = 180;
    this.pauseMenu.setAutoOpenOnUnlock(false);
    this.player.setPaused(true);
    this.player.exitPointerLock();
    this.prompt.setPromptSuppressed(true);
    this.overlay.classList.remove("hidden");
    this.dirty = true;
    this.refresh();
  }

  private hide(): void {
    this.open = false;
    this.overlay.classList.add("hidden");
    this.pauseMenu.setAutoOpenOnUnlock(true);
    this.player.setPaused(false);
    this.player.requestPointerLock();
  }

  private refresh(): void {
    if (!this.dirty) return;
    this.dirty = false;

    const entries = this.store.getCollectedEntries();
    const total = this.registry.all().length;
    this.counter.textContent = `${entries.length} / ${total}`;

    this.listEl.textContent = "";
    if (entries.length === 0) {
      this.emptyHint.classList.remove("hidden");
      this.clearDetail();
      return;
    }
    this.emptyHint.classList.add("hidden");

    for (const entry of entries) {
      this.listEl.appendChild(this.buildListItem(entry));
    }

    const stillSelected =
      this.selectedId !== null && entries.some((e) => e.id === this.selectedId);
    const toSelect = stillSelected ? this.selectedId! : entries[entries.length - 1]!.id;
    this.select(toSelect);
  }

  private buildListItem(entry: EvidenceEntry): HTMLButtonElement {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "bg-evidence-item";
    item.dataset.id = entry.id;
    if (entry.id === this.selectedId) item.classList.add("active");

    const head = document.createElement("div");
    head.className = "bg-evidence-item-title";
    head.textContent = entry.title;
    const sub = document.createElement("div");
    sub.className = "bg-evidence-item-summary";
    sub.textContent = entry.summary;

    item.appendChild(head);
    item.appendChild(sub);
    item.addEventListener("click", () => this.select(entry.id));
    return item;
  }

  private select(id: string): void {
    this.selectedId = id;
    const entry = this.registry.get(id);
    if (!entry) {
      this.clearDetail();
      return;
    }
    this.detailTitle.textContent = entry.title;
    this.detailCategory.textContent = labelForCategory(entry.category);
    this.detailBody.textContent = entry.body;
    for (const el of this.listEl.querySelectorAll<HTMLElement>(".bg-evidence-item")) {
      el.classList.toggle("active", el.dataset.id === id);
    }
  }

  private clearDetail(): void {
    this.selectedId = null;
    this.detailTitle.textContent = "";
    this.detailCategory.textContent = "";
    this.detailBody.textContent = "";
  }
}
