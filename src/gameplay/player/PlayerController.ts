import type { Scene } from "@babylonjs/core/scene";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Ray } from "@babylonjs/core/Culling/ray";

import { AppConfig } from "../../app/config";
import type { InputState } from "./input";

const HALF_PI = Math.PI / 2;
const PITCH_LIMIT = HALF_PI - 0.02;

export class PlayerController {
  readonly camera: UniversalCamera;

  private readonly scene: Scene;
  private readonly canvas: HTMLCanvasElement;
  private readonly input: InputState;

  private yaw = 0;
  private pitch = 0;
  private isLocked = false;
  private paused = false;

  private readonly moveDelta = new Vector3();
  private readonly onPointerLockChange: () => void;
  private readonly onMouseMove: (e: MouseEvent) => void;
  private readonly onCanvasClick: () => void;
  private readonly onBeforeRender: () => void;

  constructor(
    scene: Scene,
    canvas: HTMLCanvasElement,
    input: InputState,
    spawn: Vector3,
    initialYaw: number,
  ) {
    this.scene = scene;
    this.canvas = canvas;
    this.input = input;
    this.yaw = initialYaw;

    this.camera = new UniversalCamera("player.camera", spawn.clone(), scene);
    this.camera.minZ = AppConfig.camera.minZ;
    this.camera.maxZ = AppConfig.camera.maxZ;
    this.camera.fov = (AppConfig.camera.fovDegrees * Math.PI) / 180;
    this.camera.inputs.clear();
    this.camera.rotation.set(this.pitch, this.yaw, 0);

    const e = AppConfig.player.ellipsoid;
    this.camera.ellipsoid = new Vector3(e.x, e.y, e.z);
    this.camera.checkCollisions = true;
    this.camera.applyGravity = false;

    scene.collisionsEnabled = true;
    scene.activeCamera = this.camera;

    this.onCanvasClick = (): void => {
      if (this.paused) return;
      if (document.pointerLockElement !== this.canvas) {
        this.tryRequestPointerLock();
      }
    };
    this.canvas.addEventListener("click", this.onCanvasClick);

    this.onPointerLockChange = (): void => {
      this.isLocked = document.pointerLockElement === this.canvas;
      if (!this.isLocked) this.input.clearAll();
    };
    document.addEventListener("pointerlockchange", this.onPointerLockChange);

    this.onMouseMove = (event: MouseEvent): void => {
      if (!this.isLocked || this.paused) return;
      const sens = AppConfig.player.mouseSensitivity;
      this.yaw += event.movementX * sens;
      this.pitch += event.movementY * sens;
      if (this.pitch > PITCH_LIMIT) this.pitch = PITCH_LIMIT;
      if (this.pitch < -PITCH_LIMIT) this.pitch = -PITCH_LIMIT;
    };
    document.addEventListener("mousemove", this.onMouseMove);

    this.onBeforeRender = (): void => this.update();
    scene.onBeforeRenderObservable.add(this.onBeforeRender);
  }

  isPaused(): boolean {
    return this.paused;
  }

  isPointerLocked(): boolean {
    return this.isLocked;
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    this.input.clearAll();
  }

  getPose(): { x: number; y: number; z: number; yaw: number; pitch: number } {
    const p = this.camera.position;
    return { x: p.x, y: p.y, z: p.z, yaw: this.yaw, pitch: this.pitch };
  }

  setPose(x: number, y: number, z: number, yaw: number, pitch: number): void {
    this.camera.position.set(x, y, z);
    this.yaw = yaw;
    this.pitch = pitch;
    this.camera.rotation.set(this.pitch, this.yaw, 0);
  }

  requestPointerLock(): void {
    if (!this.paused && document.pointerLockElement !== this.canvas) {
      this.tryRequestPointerLock();
    }
  }

  private tryRequestPointerLock(): void {
    // Modern Chromium returns a Promise that rejects on denial (e.g. transient
    // activation missing, rapid re-request cooldown). Swallow the rejection so
    // it does not surface as an "Unhandled Promise rejection" and log it so
    // failures are visible instead of silently leaving the player un-locked.
    try {
      const result = (this.canvas.requestPointerLock as undefined | (() => unknown))?.();
      if (result && typeof (result as Promise<unknown>).then === "function") {
        (result as Promise<unknown>).catch((err: unknown) => {
          console.warn("[BLACK GLASS] requestPointerLock rejected:", err);
        });
      }
    } catch (err) {
      console.warn("[BLACK GLASS] requestPointerLock threw:", err);
    }
  }

  exitPointerLock(): void {
    if (document.pointerLockElement === this.canvas) {
      document.exitPointerLock();
    }
  }

  getForwardRay(distance: number = AppConfig.interaction.rayDistance): Ray {
    return this.camera.getForwardRay(distance);
  }

  dispose(): void {
    this.canvas.removeEventListener("click", this.onCanvasClick);
    document.removeEventListener("pointerlockchange", this.onPointerLockChange);
    document.removeEventListener("mousemove", this.onMouseMove);
    this.scene.onBeforeRenderObservable.removeCallback(this.onBeforeRender);
  }

  private update(): void {
    this.camera.rotation.set(this.pitch, this.yaw, 0);
    if (this.paused || !this.isLocked) return;

    let fx = 0;
    let fz = 0;
    if (this.input.isHeld("forward")) fz += 1;
    if (this.input.isHeld("back")) fz -= 1;
    if (this.input.isHeld("right")) fx += 1;
    if (this.input.isHeld("left")) fx -= 1;
    if (fx === 0 && fz === 0) return;

    const len = Math.hypot(fx, fz);
    fx /= len;
    fz /= len;

    const base = AppConfig.player.moveSpeed;
    const speed = this.input.isHeld("sprint") ? base * AppConfig.player.sprintMultiplier : base;
    const dt = this.scene.getEngine().getDeltaTime() / 1000;
    const step = speed * dt;

    const sinY = Math.sin(this.yaw);
    const cosY = Math.cos(this.yaw);
    this.moveDelta.set(
      (fx * cosY + fz * sinY) * step,
      0,
      (-fx * sinY + fz * cosY) * step,
    );
    this.camera._collideWithWorld(this.moveDelta);
  }
}
