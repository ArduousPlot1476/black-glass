import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { SpotLight } from "@babylonjs/core/Lights/spotLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import {
  ceilingTile,
  createFloorMaterials,
  floorTile,
  ROOM_HEIGHT,
  wallBox,
  type FloorMaterials,
} from "./sharedBuilders";

/**
 * M3 floor geometry. Six connected spaces arranged on a rough T-shape so the
 * player can read the layout without a minimap:
 *
 *   LAB (south) → CORRIDOR (east of lab) → MAINTENANCE (north of corridor)
 *     MAINTENANCE → SERVER ALCOVE (east) and SECURITY NOOK (north)
 *     CORRIDOR → FINAL HALLWAY (east, gated by corridor lockdown)
 *
 * Each room's floor/ceiling and wall segments are declared below with the
 * shared-boundary ownership rules documented inline so edits don't
 * double-up walls.
 */
export const LAB = { x0: -4, x1: 4, z0: -5, z1: 5 };
export const CORRIDOR = { x0: 4, x1: 18, z0: -1, z1: 3 };
export const MAINT = { x0: 8, x1: 14, z0: 3, z1: 11 };
export const SERVER = { x0: 14, x1: 22, z0: 3, z1: 11 };
export const SECURITY = { x0: 8, x1: 14, z0: 11, z1: 17 };
export const FINAL_HALL = { x0: 18, x1: 26, z0: -1, z1: 3 };

export interface LaidOutFloor {
  readonly materials: FloorMaterials;
  readonly ceilingLamp: SpotLight;
}

export function layOutFloor(scene: Scene): LaidOutFloor {
  const m = createFloorMaterials(scene);
  const h = ROOM_HEIGHT;
  const hy = h / 2;

  // Floors
  floorTile(scene, "floor.lab", m.lab, LAB.x0, LAB.x1, LAB.z0, LAB.z1);
  floorTile(scene, "floor.corridor", m.corridor, CORRIDOR.x0, CORRIDOR.x1, CORRIDOR.z0, CORRIDOR.z1);
  floorTile(scene, "floor.maint", m.maintenance, MAINT.x0, MAINT.x1, MAINT.z0, MAINT.z1);
  floorTile(scene, "floor.server", m.serverAlcove, SERVER.x0, SERVER.x1, SERVER.z0, SERVER.z1);
  floorTile(scene, "floor.security", m.securityNook, SECURITY.x0, SECURITY.x1, SECURITY.z0, SECURITY.z1);
  floorTile(scene, "floor.final", m.finalHall, FINAL_HALL.x0, FINAL_HALL.x1, FINAL_HALL.z0, FINAL_HALL.z1);

  // Ceilings
  ceilingTile(scene, "ceil.lab", m.ceiling, LAB.x0, LAB.x1, LAB.z0, LAB.z1, h);
  ceilingTile(scene, "ceil.corridor", m.ceiling, CORRIDOR.x0, CORRIDOR.x1, CORRIDOR.z0, CORRIDOR.z1, h);
  ceilingTile(scene, "ceil.maint", m.ceiling, MAINT.x0, MAINT.x1, MAINT.z0, MAINT.z1, h);
  ceilingTile(scene, "ceil.server", m.ceiling, SERVER.x0, SERVER.x1, SERVER.z0, SERVER.z1, h);
  ceilingTile(scene, "ceil.security", m.ceiling, SECURITY.x0, SECURITY.x1, SECURITY.z0, SECURITY.z1, h);
  ceilingTile(scene, "ceil.final", m.ceiling, FINAL_HALL.x0, FINAL_HALL.x1, FINAL_HALL.z0, FINAL_HALL.z1, h);

  // Lab walls — lab owns the full x=4 boundary (corridor does not build a west wall).
  wallBox(scene, "lab.wall.west", m.wall, -4, hy, 0, 0.2, h, 10);
  wallBox(scene, "lab.wall.south", m.wall, 0, hy, -5, 8, h, 0.2);
  wallBox(scene, "lab.wall.north", m.wall, 0, hy, 5, 8, h, 0.2);
  // East wall of lab split around maintenance doorway (z=-1..1) and corridor overlap (z=1..3):
  wallBox(scene, "lab.wall.east.south", m.wall, 4, hy, -3, 0.2, h, 4);   // z=-5..-1
  wallBox(scene, "lab.wall.east.mid", m.wall, 4, hy, 2, 0.2, h, 2);      // z=1..3 (separates lab from corridor)
  wallBox(scene, "lab.wall.east.north", m.wall, 4, hy, 4, 0.2, h, 2);    // z=3..5

  // Corridor walls — corridor owns south, east, and the west half of its north wall up to x=14.
  wallBox(scene, "cor.wall.south", m.wallCorridor, 11, hy, -1, 14, h, 0.2);
  // North wall: segments either side of maintenance doorway (x=10..12). Server alcove takes over at x=14.
  wallBox(scene, "cor.wall.north.west", m.wallCorridor, 7, hy, 3, 6, h, 0.2);    // x=4..10
  wallBox(scene, "cor.wall.north.east", m.wallCorridor, 13, hy, 3, 2, h, 0.2);   // x=12..14
  // East wall: segments either side of corridor lockdown doorway (z=0..2).
  wallBox(scene, "cor.wall.east.south", m.wallCorridor, 18, hy, -0.5, 0.2, h, 1); // z=-1..0
  wallBox(scene, "cor.wall.east.north", m.wallCorridor, 18, hy, 2.5, 0.2, h, 1);  // z=2..3

  // Maintenance walls — owns west, east (with server doorway), and north (with security doorway).
  wallBox(scene, "maint.wall.west", m.wall, 8, hy, 7, 0.2, h, 8);
  wallBox(scene, "maint.wall.east.south", m.wall, 14, hy, 4, 0.2, h, 2);   // z=3..5
  wallBox(scene, "maint.wall.east.north", m.wall, 14, hy, 9, 0.2, h, 4);   // z=7..11
  wallBox(scene, "maint.wall.north.west", m.wall, 9, hy, 11, 2, h, 0.2);   // x=8..10
  wallBox(scene, "maint.wall.north.east", m.wall, 13, hy, 11, 2, h, 0.2);  // x=12..14

  // Server alcove walls — owns south, north, east. West is shared with maintenance (already built).
  wallBox(scene, "serv.wall.south", m.wall, 18, hy, 3, 8, h, 0.2);
  wallBox(scene, "serv.wall.north", m.wall, 18, hy, 11, 8, h, 0.2);
  wallBox(scene, "serv.wall.east", m.wall, 22, hy, 7, 0.2, h, 8);

  // Security nook walls — owns west, east, north. South shared with maintenance (already built).
  wallBox(scene, "sec.wall.west", m.wall, 8, hy, 14, 0.2, h, 6);
  wallBox(scene, "sec.wall.east", m.wall, 14, hy, 14, 0.2, h, 6);
  wallBox(scene, "sec.wall.north", m.wall, 11, hy, 17, 6, h, 0.2);

  // Final hallway walls — owns east, south, north. West shared with corridor (already built).
  wallBox(scene, "final.wall.south", m.wallCorridor, 22, hy, -1, 8, h, 0.2);
  wallBox(scene, "final.wall.north", m.wallCorridor, 22, hy, 3, 8, h, 0.2);
  wallBox(scene, "final.wall.east", m.wallCorridor, 26, hy, 1, 0.2, h, 4);

  // Lights — one cheap light set per room. Lab keeps its M1/M2 atmospherics
  // with the ceiling lamp returned for evidence-gate wiring.
  const ceilingLamp = buildLabLights(scene);
  buildCorridorLights(scene);
  buildMaintenanceLights(scene);
  buildServerAlcoveLights(scene);
  buildSecurityNookLights(scene);
  buildFinalHallLights(scene);

  return { materials: m, ceilingLamp };
}

function buildLabLights(scene: Scene): SpotLight {
  const hemi = new HemisphericLight("light.hemi.lab", new Vector3(0, 1, 0), scene);
  hemi.diffuse = new Color3(0.35, 0.42, 0.55);
  hemi.groundColor = new Color3(0.06, 0.05, 0.04);
  hemi.intensity = 0.12;

  const desk = new SpotLight(
    "light.desk",
    new Vector3(2, ROOM_HEIGHT - 0.2, 2.5),
    new Vector3(0, -1, -0.2),
    Math.PI / 3.5,
    4,
    scene,
  );
  desk.diffuse = new Color3(1, 0.82, 0.62);
  desk.specular = new Color3(0.8, 0.7, 0.55);
  desk.intensity = 1.4;
  desk.range = 6;

  const accent = new PointLight("light.accent.lab", new Vector3(-2.5, 1.7, -2), scene);
  accent.diffuse = new Color3(0.35, 0.55, 0.85);
  accent.specular = new Color3(0.2, 0.35, 0.6);
  accent.intensity = 0.4;
  accent.range = 4;

  const lamp = new SpotLight(
    "light.ceiling",
    new Vector3(0, ROOM_HEIGHT - 0.1, 1.5),
    new Vector3(0, -1, -0.25),
    Math.PI / 2.2,
    2,
    scene,
  );
  lamp.diffuse = new Color3(1, 0.9, 0.78);
  lamp.specular = new Color3(0.9, 0.85, 0.7);
  lamp.intensity = 0;
  lamp.range = 12;
  return lamp;
}

function buildCorridorLights(scene: Scene): void {
  const west = new PointLight("light.cor.west", new Vector3(7, 2.6, 1), scene);
  west.diffuse = new Color3(0.55, 0.7, 0.95);
  west.intensity = 0.6;
  west.range = 6;

  const mid = new PointLight("light.cor.mid", new Vector3(12, 2.6, 1), scene);
  mid.diffuse = new Color3(0.55, 0.7, 0.95);
  mid.intensity = 0.55;
  mid.range = 6;

  const east = new PointLight("light.cor.east", new Vector3(16.5, 2.6, 1), scene);
  east.diffuse = new Color3(0.85, 0.55, 0.45);
  east.specular = new Color3(0.5, 0.3, 0.25);
  east.intensity = 0.5;
  east.range = 5;
}

function buildMaintenanceLights(scene: Scene): void {
  const overhead = new PointLight("light.maint.main", new Vector3(11, 2.7, 7), scene);
  overhead.diffuse = new Color3(0.85, 0.88, 0.78);
  overhead.intensity = 0.9;
  overhead.range = 9;

  const panel = new PointLight("light.maint.panel", new Vector3(9.5, 1.6, 5), scene);
  panel.diffuse = new Color3(0.9, 0.55, 0.25);
  panel.intensity = 0.4;
  panel.range = 3;
}

function buildServerAlcoveLights(scene: Scene): void {
  const rack = new PointLight("light.server.rack", new Vector3(18, 2.6, 7), scene);
  rack.diffuse = new Color3(0.25, 0.55, 0.9);
  rack.intensity = 0.8;
  rack.range = 8;

  const glow = new PointLight("light.server.glow", new Vector3(20, 1.2, 7), scene);
  glow.diffuse = new Color3(0.25, 0.7, 1);
  glow.intensity = 0.35;
  glow.range = 4;
}

function buildSecurityNookLights(scene: Scene): void {
  const dome = new PointLight("light.sec.dome", new Vector3(11, 2.7, 14), scene);
  dome.diffuse = new Color3(0.9, 0.35, 0.3);
  dome.intensity = 0.7;
  dome.range = 7;
}

function buildFinalHallLights(scene: Scene): void {
  const strip = new PointLight("light.final.strip", new Vector3(22, 2.6, 1), scene);
  strip.diffuse = new Color3(0.4, 0.8, 0.9);
  strip.intensity = 0.7;
  strip.range = 7;
}
