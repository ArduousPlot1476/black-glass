import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";

export interface FloorMaterials {
  readonly lab: StandardMaterial;
  readonly corridor: StandardMaterial;
  readonly maintenance: StandardMaterial;
  readonly serverAlcove: StandardMaterial;
  readonly securityNook: StandardMaterial;
  readonly finalHall: StandardMaterial;
  readonly wall: StandardMaterial;
  readonly wallCorridor: StandardMaterial;
  readonly ceiling: StandardMaterial;
}

/**
 * Shared materials for the M3 floor. Kept on the scene for lifecycle, and
 * tinted per-space so the player reads transitions between rooms without a
 * minimap. Deliberately plain — graybox, not final art.
 */
export function createFloorMaterials(scene: Scene): FloorMaterials {
  const lab = new StandardMaterial("mat.floor.lab", scene);
  lab.diffuseColor = new Color3(0.08, 0.09, 0.1);
  lab.specularColor = new Color3(0.2, 0.22, 0.25);
  lab.specularPower = 96;

  const corridor = new StandardMaterial("mat.floor.corridor", scene);
  corridor.diffuseColor = new Color3(0.07, 0.08, 0.12);
  corridor.specularColor = new Color3(0.3, 0.36, 0.48);
  corridor.specularPower = 128;

  const maintenance = new StandardMaterial("mat.floor.maint", scene);
  maintenance.diffuseColor = new Color3(0.12, 0.1, 0.08);
  maintenance.specularColor = new Color3(0.18, 0.16, 0.14);

  const serverAlcove = new StandardMaterial("mat.floor.server", scene);
  serverAlcove.diffuseColor = new Color3(0.05, 0.08, 0.1);
  serverAlcove.specularColor = new Color3(0.3, 0.4, 0.5);
  serverAlcove.specularPower = 96;

  const securityNook = new StandardMaterial("mat.floor.security", scene);
  securityNook.diffuseColor = new Color3(0.09, 0.07, 0.07);
  securityNook.specularColor = new Color3(0.2, 0.18, 0.18);

  const finalHall = new StandardMaterial("mat.floor.final", scene);
  finalHall.diffuseColor = new Color3(0.06, 0.08, 0.09);
  finalHall.specularColor = new Color3(0.35, 0.45, 0.55);
  finalHall.specularPower = 144;

  const wall = new StandardMaterial("mat.wall", scene);
  wall.diffuseColor = new Color3(0.06, 0.07, 0.09);
  wall.specularColor = new Color3(0.08, 0.09, 0.11);

  const wallCorridor = new StandardMaterial("mat.wall.corridor", scene);
  wallCorridor.diffuseColor = new Color3(0.05, 0.07, 0.1);
  wallCorridor.specularColor = new Color3(0.2, 0.3, 0.42);
  wallCorridor.emissiveColor = new Color3(0.02, 0.04, 0.07);

  const ceiling = new StandardMaterial("mat.ceiling", scene);
  ceiling.diffuseColor = new Color3(0.03, 0.035, 0.04);
  ceiling.specularColor = Color3.Black();

  return {
    lab,
    corridor,
    maintenance,
    serverAlcove,
    securityNook,
    finalHall,
    wall,
    wallCorridor,
    ceiling,
  };
}

/** Build a collidable axis-aligned wall segment. */
export function wallBox(
  scene: Scene,
  name: string,
  material: StandardMaterial,
  cx: number,
  cy: number,
  cz: number,
  sx: number,
  sy: number,
  sz: number,
): Mesh {
  const mesh = CreateBox(name, { width: sx, height: sy, depth: sz }, scene);
  mesh.position.set(cx, cy, cz);
  mesh.material = material;
  mesh.checkCollisions = true;
  return mesh;
}

/** Floor tile covering [x0..x1] × [z0..z1]. */
export function floorTile(
  scene: Scene,
  name: string,
  material: StandardMaterial,
  x0: number,
  x1: number,
  z0: number,
  z1: number,
): Mesh {
  const width = x1 - x0;
  const depth = z1 - z0;
  const tile = CreateGround(name, { width, height: depth }, scene);
  tile.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2);
  tile.material = material;
  tile.checkCollisions = true;
  return tile;
}

/** Ceiling tile — inverted ground. */
export function ceilingTile(
  scene: Scene,
  name: string,
  material: StandardMaterial,
  x0: number,
  x1: number,
  z0: number,
  z1: number,
  height: number,
): Mesh {
  const width = x1 - x0;
  const depth = z1 - z0;
  const tile = CreateGround(name, { width, height: depth }, scene);
  tile.position.set((x0 + x1) / 2, height, (z0 + z1) / 2);
  tile.rotation.x = Math.PI;
  tile.material = material;
  return tile;
}

export const ROOM_HEIGHT = 3;
export const WALL_THICKNESS = 0.2;
