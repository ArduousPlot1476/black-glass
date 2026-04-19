import type { EvidenceStore } from "../evidence/EvidenceStore";
import type { WorldStateStore } from "../worldState/WorldStateStore";
import type { WorldStateSnapshot } from "../worldState/worldStateTypes";

const EVIDENCE_TARGET = 3;

/**
 * Minimal top-center HUD line that tells the player the current next step.
 * Derived from world state + evidence progress — no manual objective
 * management. Kept deliberately terse; this is not a quest log.
 */
export class ObjectiveOverlay {
  private readonly host: HTMLElement;
  private readonly worldStore: WorldStateStore;
  private readonly evidence: EvidenceStore;
  private readonly overlay: HTMLDivElement;
  private readonly label: HTMLDivElement;
  private readonly body: HTMLDivElement;
  private readonly unsubscribeWorld: () => void;
  private readonly unsubscribeEvidence: () => void;
  private currentText = "";

  constructor(host: HTMLElement, worldStore: WorldStateStore, evidence: EvidenceStore) {
    this.host = host;
    this.worldStore = worldStore;
    this.evidence = evidence;

    this.overlay = document.createElement("div");
    this.overlay.className = "bg-objective";
    this.label = document.createElement("div");
    this.label.className = "bg-objective-label";
    this.label.textContent = "OBJECTIVE";
    this.body = document.createElement("div");
    this.body.className = "bg-objective-body";
    this.overlay.appendChild(this.label);
    this.overlay.appendChild(this.body);
    host.appendChild(this.overlay);

    this.unsubscribeWorld = worldStore.onChange(() => this.refresh());
    this.unsubscribeEvidence = evidence.onChange(() => this.refresh());
    this.refresh();
  }

  /** Flash the overlay briefly to signal the objective changed. */
  private pulse(): void {
    this.overlay.classList.remove("pulse");
    // Force reflow so the animation can re-trigger.
    void this.overlay.offsetWidth;
    this.overlay.classList.add("pulse");
  }

  private refresh(): void {
    const text = deriveObjective(this.worldStore.get(), this.evidence.count());
    if (text === this.currentText) return;
    this.currentText = text;
    this.body.textContent = text;
    this.pulse();
  }

  dispose(): void {
    this.unsubscribeWorld();
    this.unsubscribeEvidence();
    if (this.overlay.parentElement === this.host) {
      this.host.removeChild(this.overlay);
    }
  }
}

function deriveObjective(state: WorldStateSnapshot, evidenceCount: number): string {
  if (!state.maintenancePanelOpen) {
    if (evidenceCount < EVIDENCE_TARGET) {
      return `Search the lab. Build enough context to break the seal. (${evidenceCount}/${EVIDENCE_TARGET})`;
    }
    return "The seal will accept you now. Open the maintenance panel.";
  }
  if (!state.corridorLockdownCleared) {
    if (state.powerRouting === "server_alcove") {
      return "The corridor is locked. Find a way to cut its power — the security nook is dark.";
    }
    return "Security nook is live. Trip the override.";
  }
  return "Corridor lockdown cleared. Push east to the control floor.";
}
