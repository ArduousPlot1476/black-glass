import { Scene } from "@babylonjs/core/scene";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import type { Engine } from "@babylonjs/core/Engines/engine";

import { AppConfig } from "../app/config";

/**
 * M0 placeholder scene. Exists only to prove the render pipeline boots.
 * Replace in M1 with the real first-room environment and first-person camera.
 */
export function createRootScene(engine: Engine): Scene {
  const scene = new Scene(engine);

  const c = AppConfig.render.clearColor;
  scene.clearColor = new Color4(c.r, c.g, c.b, c.a);

  const camera = new ArcRotateCamera(
    "m0.camera",
    -Math.PI / 2,
    Math.PI / 2.5,
    6,
    Vector3.Zero(),
    scene,
  );
  camera.minZ = AppConfig.camera.minZ;
  camera.maxZ = AppConfig.camera.maxZ;
  camera.fov = (AppConfig.camera.fovDegrees * Math.PI) / 180;

  const light = new HemisphericLight("m0.light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.9;

  const marker = CreateBox("m0.marker", { size: 1 }, scene);
  marker.position.set(0, 0, 0);

  return scene;
}
