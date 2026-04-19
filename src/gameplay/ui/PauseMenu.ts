import type { CheckpointManager } from "../worldState/CheckpointManager";
import type { PlayerController } from "../player/PlayerController";

/**
 * Minimal DOM pause overlay. Opens when the user releases pointer lock
 * (typically via Esc) while not already paused. Resume re-requests lock.
 *
 * Also hosts the checkpoint recovery entry point for M3: a "Restore last
 * checkpoint" button that restores the most recent snapshot if one exists.
 */
export class PauseMenu {
  private readonly host: HTMLElement;
  private readonly player: PlayerController;
  private readonly overlay: HTMLDivElement;
  private readonly resumeBtn: HTMLButtonElement;
  private readonly restoreBtn: HTMLButtonElement;
  private readonly restoreLabel: HTMLElement;
  private readonly checkpoints: CheckpointManager | null;
  private readonly unsubscribeCheckpoint: (() => void) | null;

  private open = false;
  private shouldOpenOnUnlock = true;
  private hasEverLocked = false;

  private readonly onPointerLockChange: () => void;
  private readonly onResumeClick: () => void;
  private readonly onRestoreClick: () => void;

  constructor(
    host: HTMLElement,
    player: PlayerController,
    checkpoints: CheckpointManager | null = null,
  ) {
    this.host = host;
    this.player = player;
    this.checkpoints = checkpoints;

    this.overlay = document.createElement("div");
    this.overlay.className = "bg-pause hidden";

    const panel = document.createElement("div");
    panel.className = "bg-pause-panel";
    const title = document.createElement("h2");
    title.textContent = "PAUSED";
    const hint = document.createElement("p");
    hint.textContent = "BLACK GLASS — Milestone 3";

    this.resumeBtn = document.createElement("button");
    this.resumeBtn.type = "button";
    this.resumeBtn.textContent = "Resume";

    this.restoreBtn = document.createElement("button");
    this.restoreBtn.type = "button";
    this.restoreBtn.className = "bg-pause-secondary";
    this.restoreBtn.textContent = "Restore last checkpoint";
    this.restoreBtn.disabled = true;

    this.restoreLabel = document.createElement("small");
    this.restoreLabel.className = "bg-pause-checkpoint";
    this.restoreLabel.textContent = "No checkpoint yet.";

    panel.appendChild(title);
    panel.appendChild(hint);
    panel.appendChild(this.resumeBtn);
    if (checkpoints) {
      panel.appendChild(this.restoreBtn);
      panel.appendChild(this.restoreLabel);
    }
    this.overlay.appendChild(panel);
    host.appendChild(this.overlay);

    this.onPointerLockChange = (): void => {
      const nowLocked = document.pointerLockElement !== null;
      if (nowLocked) {
        this.hasEverLocked = true;
        return;
      }
      // Only surface the pause overlay on a real unlock — i.e. we had previously
      // been locked. Without this guard, a failed initial lock request (some
      // browsers still fire pointerlockchange with pointerLockElement=null on
      // denial) would auto-open the pause menu at startup and the user would
      // never have a chance to click-to-play.
      if (!this.hasEverLocked) return;
      if (this.shouldOpenOnUnlock && !this.open) this.show();
    };
    document.addEventListener("pointerlockchange", this.onPointerLockChange);

    this.onResumeClick = (): void => this.hide();
    this.resumeBtn.addEventListener("click", this.onResumeClick);

    this.onRestoreClick = (): void => {
      if (!this.checkpoints) return;
      if (this.checkpoints.restore()) this.hide();
    };
    this.restoreBtn.addEventListener("click", this.onRestoreClick);

    this.unsubscribeCheckpoint = checkpoints
      ? checkpoints.onChange((cp) => {
          this.restoreBtn.disabled = cp === null;
          this.restoreLabel.textContent = cp
            ? `Checkpoint: ${cp.label}`
            : "No checkpoint yet.";
        })
      : null;
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
    this.restoreBtn.removeEventListener("click", this.onRestoreClick);
    this.unsubscribeCheckpoint?.();
    if (this.overlay.parentElement === this.host) {
      this.host.removeChild(this.overlay);
    }
  }
}
