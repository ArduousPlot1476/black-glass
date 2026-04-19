import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export interface SlidingDoorOptions {
  readonly name: string;
  readonly position: Vector3;
  readonly size: { width: number; height: number; depth: number };
  readonly liftHeight: number;
  readonly closedEmissive: Color3;
  readonly openEmissive: Color3;
  readonly rotationY?: number;
}

/**
 * A rectangular mesh that occupies a doorway. Controlled through
 * {@link setOpen}: true slides the door up (no collision), false drops it
 * back into place (collision on). Tweens over ~400ms. Multiple rapid
 * setOpen calls are safe — in-flight tweens are canceled.
 *
 * Owns its own material so callers can tint it via open/closed emissives.
 */
export class SlidingDoor {
  readonly mesh: Mesh;
  private readonly scene: Scene;
  private readonly basePos: Vector3;
  private readonly liftHeight: number;
  private readonly closedEmissive: Color3;
  private readonly openEmissive: Color3;
  private readonly material: StandardMaterial;

  private open = false;
  private tween: (() => void) | null = null;

  constructor(scene: Scene, options: SlidingDoorOptions) {
    this.scene = scene;
    this.basePos = options.position.clone();
    this.liftHeight = options.liftHeight;
    this.closedEmissive = options.closedEmissive.clone();
    this.openEmissive = options.openEmissive.clone();

    this.material = new StandardMaterial(`mat.${options.name}`, scene);
    this.material.diffuseColor = new Color3(0.08, 0.09, 0.1);
    this.material.specularColor = new Color3(0.2, 0.22, 0.25);
    this.material.emissiveColor = this.closedEmissive.clone();

    this.mesh = CreateBox(
      options.name,
      {
        width: options.size.width,
        height: options.size.height,
        depth: options.size.depth,
      },
      scene,
    );
    this.mesh.position.copyFrom(this.basePos);
    if (options.rotationY !== undefined) this.mesh.rotation.y = options.rotationY;
    this.mesh.material = this.material;
    this.mesh.checkCollisions = true;
  }

  isOpen(): boolean {
    return this.open;
  }

  /** Snap to a state without tweening — used by checkpoint restore. */
  setOpenImmediate(open: boolean): void {
    this.cancelTween();
    this.open = open;
    this.mesh.position.y = open ? this.basePos.y + this.liftHeight : this.basePos.y;
    this.mesh.checkCollisions = !open;
    this.material.emissiveColor = (open ? this.openEmissive : this.closedEmissive).clone();
  }

  /** Tween to the requested state. */
  setOpen(open: boolean): void {
    if (this.open === open) return;
    this.open = open;
    this.tweenTo(open);
  }

  private cancelTween(): void {
    if (this.tween) {
      this.scene.onBeforeRenderObservable.removeCallback(this.tween);
      this.tween = null;
    }
  }

  private tweenTo(targetOpen: boolean): void {
    this.cancelTween();
    if (!targetOpen) this.mesh.checkCollisions = true;

    const duration = 450;
    const fromY = this.mesh.position.y;
    const toY = targetOpen ? this.basePos.y + this.liftHeight : this.basePos.y;
    const fromEmissive = this.material.emissiveColor.clone();
    const toEmissive = targetOpen ? this.openEmissive : this.closedEmissive;
    let elapsed = 0;

    const step = (): void => {
      elapsed += this.scene.getEngine().getDeltaTime();
      const t = Math.min(1, elapsed / duration);
      const e = 1 - Math.pow(1 - t, 3);
      this.mesh.position.y = fromY + (toY - fromY) * e;
      this.material.emissiveColor = Color3.Lerp(fromEmissive, toEmissive, e);
      if (t >= 1) {
        this.cancelTween();
        if (targetOpen) this.mesh.checkCollisions = false;
      }
    };
    this.tween = step;
    this.scene.onBeforeRenderObservable.add(step);
  }
}
