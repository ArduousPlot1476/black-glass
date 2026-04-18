import type { PlayerController } from "../player/PlayerController";

/**
 * Minimal DOM pause overlay. Opens when the user releases pointer lock
 * (typically via Esc) while not already paused. Resume re-requests lock.
 * Kept intentionally narrow for M1.
 */
export class PauseMenu {
  private readonly host: HTMLElement;
  private readonly player: PlayerController;
  private readonly overlay: HTMLDivElement;
  private readonly resumeBtn: HTMLButtonElement;

  private open = false;
  private shouldOpenOnUnlock = true;

  private readonly onPointerLockChange: () => void;
  private readonly onResumeClick: () => void;

  constructor(host: HTMLElement, player: PlayerController) {
    this.host = host;
    this.player = player;

    this.overlay = document.createElement("div");
    this.overlay.className = "bg-pause hidden";

    const panel = document.createElement("div");
    panel.className = "bg-pause-panel";
    const title = document.createElement("h2");
    title.textContent = "PAUSED";
    const hint = document.createElement("p");
    hint.textContent = "BLACK GLASS — Milestone 2";
    this.resumeBtn = document.createElement("button");
    this.resumeBtn.type = "button";
    this.resumeBtn.textContent = "Resume";
    panel.appendChild(title);
    panel.appendChild(hint);
    panel.appendChild(this.resumeBtn);
    this.overlay.appendChild(panel);
    host.appendChild(this.overlay);

    this.onPointerLockChange = (): void => {
      const nowLocked = document.pointerLockElement !== null;
      if (!nowLocked && this.shouldOpenOnUnlock && !this.open) {
        this.show();
      }
    };
    document.addEventListener("pointerlockchange", this.onPointerLockChange);

    this.onResumeClick = (): void => this.hide();
    this.resumeBtn.addEventListener("click", this.onResumeClick);
  }

  /** Temporarily suppress auto-open on pointer unlock (used while an inspect panel is the reason lock was lost). */
  setAutoOpenOnUnlock(enabled: boolean): void {
    this.shouldOpenOnUnlock = enabled;
  }

  isOpen(): boolean {
    return this.open;
  }

  show(): void {
    if (this.open) return;
    this.open = true;
    this.overlay.classList.remove("hidden");
    this.player.setPaused(true);
  }

  hide(): void {
    if (!this.open) return;
    this.open = false;
    this.overlay.classList.add("hidden");
    this.player.setPaused(false);
    this.player.requestPointerLock();
  }

  dispose(): void {
    document.removeEventListener("pointerlockchange", this.onPointerLockChange);
    this.resumeBtn.removeEventListener("click", this.onResumeClick);
    if (this.overlay.parentElement === this.host) {
      this.host.removeChild(this.overlay);
    }
  }
}
