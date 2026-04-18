export type ActionKey =
  | "forward"
  | "back"
  | "left"
  | "right"
  | "sprint"
  | "interact"
  | "pause";

const KEY_MAP: Record<string, ActionKey> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "back",
  ArrowDown: "back",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  ShiftLeft: "sprint",
  ShiftRight: "sprint",
  KeyE: "interact",
  Escape: "pause",
};

export class InputState {
  private held = new Set<ActionKey>();
  private justPressed = new Set<ActionKey>();
  private attached = false;

  attach(): void {
    if (this.attached) return;
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
    this.attached = true;
  }

  detach(): void {
    if (!this.attached) return;
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
    this.attached = false;
  }

  isHeld(action: ActionKey): boolean {
    return this.held.has(action);
  }

  consumeJustPressed(action: ActionKey): boolean {
    if (!this.justPressed.has(action)) return false;
    this.justPressed.delete(action);
    return true;
  }

  clearAll(): void {
    this.held.clear();
    this.justPressed.clear();
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    const action = KEY_MAP[e.code];
    if (!action) return;
    if (action === "pause") e.preventDefault();
    if (!this.held.has(action)) this.justPressed.add(action);
    this.held.add(action);
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    const action = KEY_MAP[e.code];
    if (!action) return;
    this.held.delete(action);
  };

  private onBlur = (): void => {
    this.clearAll();
  };
}
