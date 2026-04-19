import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { SpotLight } from "@babylonjs/core/Lights/spotLight";

import { attachInteractable } from "../../gameplay/interaction/Interactable";
import type { WorldStateStore } from "../../gameplay/worldState/WorldStateStore";
import {
  EVIDENCE_ENTRIES,
  EV_DATA_SHARD,
  EV_HVAC_SPIKE,
  EV_SHIFT_LOG,
} from "../../data/evidence/evidenceEntries";

import { SlidingDoor } from "./SlidingDoor";

const REQUIRED_FOR_GATE: readonly string[] = [EV_SHIFT_LOG, EV_DATA_SHARD, EV_HVAC_SPIKE];

const MAINTENANCE_LOG_TEXT = [
  "MAINTENANCE LOG — ACCESS RESTORED",
  "",
  "02:22 — Server B thermal envelope exceeded. South-wing HVAC forced to maximum intake.",
  "02:24 — Physical access to Server B recorded. Credential: VANCE-DR.",
  "02:31 — East-hallway camera feed masked at the source, not the controller.",
  "",
  "Dr. Vance did not leave the west wing. She crossed to Server B and has been there",
  "since 02:24, drawing power through the storm backup. The masked feed is hiding her,",
  "not an intruder.",
  "",
  "Reaching her will require clearing the east hallway lockdown. Power routing for the",
  "east wing is controlled from the maintenance junction beyond this panel.",
].join("\n");

const SERVER_TERMINAL_TEXT = [
  "SERVER B — BACKUP SHARD MIRROR",
  "",
  "Mirror node still live under storm-cell power. Shard contents are encrypted, but",
  "the metadata is in the clear: authored VANCE-DR, signed 02:24, flagged PRIVATE.",
  "",
  "Whoever is in the east wing did not come to destroy Server B. They came to write",
  "to it.",
].join("\n");

const FINAL_PLAQUE_TEXT = [
  "EAST CONTROL FLOOR — ACCESS LOG",
  "",
  "Corridor lockdown released. Maintenance clearance recorded.",
  "",
  "Everything past this door is part of the Threat Response milestone.",
  "You've reached the end of the current playable slice.",
].join("\n");

interface ToggleState {
  on: boolean;
}

interface GateState {
  animating: boolean;
}

export interface RoomInteractablesDeps {
  readonly scene: Scene;
  readonly worldState: WorldStateStore;
  readonly ceilingLamp: SpotLight;
}

export interface RoomDoors {
  readonly maintenancePanel: SlidingDoor;
  readonly corridorLockdown: SlidingDoor;
  readonly serverAlcove: SlidingDoor;
  readonly securityNook: SlidingDoor;
}

/**
 * Wires every interactable and door for the M3 slice. Doors are owned here
 * so the subscription that drives their visual state can live alongside the
 * activators that flip world flags.
 */
export function buildRoomInteractables(deps: RoomInteractablesDeps): RoomDoors {
  const { scene, worldState, ceilingLamp } = deps;

  // Lab props (unchanged from M2 behaviorally, now reading/writing world flags).
  buildLabDesk(scene);
  buildTerminal(scene);
  buildWallSwitch(scene, ceilingLamp);
  buildDataShard(scene);
  buildHvacVent(scene);

  // Doors
  const maintenancePanel = buildMaintenanceDoor(scene);
  const corridorLockdown = buildCorridorDoor(scene);
  const serverAlcoveDoor = buildServerAlcoveDoor(scene);
  const securityNookDoor = buildSecurityNookDoor(scene);

  // Power junction (maintenance area) — flips exclusive routing.
  buildPowerJunction(scene);

  // Security override console (security nook) — clears corridor lockdown
  // only when power is actually routed there.
  buildSecurityOverride(scene, worldState);

  // Server alcove terminal — flavor inspect only.
  buildServerTerminal(scene);

  // Final hallway plaque — the M3 terminus.
  buildFinalPlaque(scene);

  // Drive door visual state from world state. Always tween; also runs on
  // checkpoint restore via WorldStateStore.replaceAll.
  const unsubscribe = worldState.onChange((next, prev) => {
    if (next.maintenancePanelOpen !== prev.maintenancePanelOpen) {
      maintenancePanel.setOpen(next.maintenancePanelOpen);
    }
    if (next.corridorLockdownCleared !== prev.corridorLockdownCleared) {
      corridorLockdown.setOpen(next.corridorLockdownCleared);
    }
    if (next.powerRouting !== prev.powerRouting) {
      serverAlcoveDoor.setOpen(next.powerRouting === "server_alcove");
      securityNookDoor.setOpen(next.powerRouting === "security_nook");
    }
  });
  scene.onDisposeObservable.addOnce(() => unsubscribe());

  // Apply initial open states directly so a fresh scene matches the initial
  // snapshot without waiting for the first change event.
  const initial = worldState.get();
  maintenancePanel.setOpenImmediate(initial.maintenancePanelOpen);
  corridorLockdown.setOpenImmediate(initial.corridorLockdownCleared);
  serverAlcoveDoor.setOpenImmediate(initial.powerRouting === "server_alcove");
  securityNookDoor.setOpenImmediate(initial.powerRouting === "security_nook");

  return {
    maintenancePanel,
    corridorLockdown,
    serverAlcove: serverAlcoveDoor,
    securityNook: securityNookDoor,
  };
}

// ───────────────────────────── lab (unchanged props) ─────────────────────────────

function buildLabDesk(scene: Scene): void {
  const deskMat = new StandardMaterial("mat.desk", scene);
  deskMat.diffuseColor = new Color3(0.14, 0.12, 0.11);
  deskMat.specularColor = new Color3(0.2, 0.18, 0.16);
  const desk = CreateBox("prop.desk", { width: 1.6, height: 0.8, depth: 0.8 }, scene);
  desk.position.set(2, 0.4, 2.5);
  desk.material = deskMat;
  desk.checkCollisions = true;
}

function buildTerminal(scene: Scene): void {
  const screenMat = new StandardMaterial("mat.terminal.screen", scene);
  screenMat.diffuseColor = new Color3(0.02, 0.04, 0.06);
  screenMat.emissiveColor = new Color3(0.25, 0.6, 0.85);
  screenMat.specularColor = Color3.Black();
  const terminal = CreateBox("prop.terminal", { width: 0.6, height: 0.42, depth: 0.05 }, scene);
  terminal.position.set(2, 1.05, 2.18);
  terminal.rotation.x = -0.25;
  terminal.material = screenMat;

  const entry = findEntry(EV_SHIFT_LOG);
  attachInteractable(terminal, {
    kind: "inspect",
    prompt: "shift log terminal",
    activate: (ctx) => {
      ctx.showInspectPanel(entry.title.toUpperCase(), entry.body);
      if (ctx.collectEvidence(EV_SHIFT_LOG)) {
        ctx.flashHint("Logged to evidence.");
      }
    },
  });
}

function buildWallSwitch(scene: Scene, ceilingLamp: SpotLight): void {
  const switchPlate = CreateBox("prop.switch", { width: 0.22, height: 0.32, depth: 0.04 }, scene);
  switchPlate.position.set(-4 + 0.2 / 2 + 0.03, 1.35, -2);
  switchPlate.rotation.y = Math.PI / 2;
  const switchMat = new StandardMaterial("mat.switch", scene);
  switchMat.diffuseColor = new Color3(0.12, 0.12, 0.13);
  switchMat.emissiveColor = new Color3(0.55, 0.08, 0.08);
  switchPlate.material = switchMat;

  const toggle: ToggleState = { on: false };
  const applyToggle = (): void => {
    if (toggle.on) {
      switchMat.emissiveColor = new Color3(0.1, 0.75, 0.35);
      ceilingLamp.intensity = 1.6;
    } else {
      switchMat.emissiveColor = new Color3(0.55, 0.08, 0.08);
      ceilingLamp.intensity = 0;
    }
  };
  applyToggle();

  attachInteractable(switchPlate, {
    kind: "toggle",
    prompt: "ceiling lamp",
    activate: (ctx) => {
      toggle.on = !toggle.on;
      applyToggle();
      ctx.flashHint(toggle.on ? "Lamp on." : "Lamp off.");
    },
  });
}

function buildDataShard(scene: Scene): void {
  const pickupMat = new StandardMaterial("mat.pickup", scene);
  pickupMat.diffuseColor = new Color3(0.05, 0.05, 0.05);
  pickupMat.emissiveColor = new Color3(0.95, 0.65, 0.25);
  pickupMat.specularColor = new Color3(0.3, 0.25, 0.15);
  const pickup: Mesh = CreateBox("prop.pickup.chip", { width: 0.1, height: 0.03, depth: 0.14 }, scene);
  pickup.position.set(1.5, 0.83, 2.55);
  pickup.rotation.y = 0.5;
  pickup.material = pickupMat;
  attachInteractable(pickup as unknown as AbstractMesh, {
    kind: "pickup",
    prompt: "data shard",
    activate: (ctx) => {
      const first = ctx.collectEvidence(EV_DATA_SHARD);
      pickup.dispose();
      ctx.flashHint(first ? "Picked up data shard. Logged to evidence." : "Picked up data shard.");
    },
  });
}

function buildHvacVent(scene: Scene): void {
  const ventMat = new StandardMaterial("mat.vent", scene);
  ventMat.diffuseColor = new Color3(0.18, 0.2, 0.22);
  ventMat.specularColor = new Color3(0.3, 0.32, 0.35);
  ventMat.emissiveColor = new Color3(0.02, 0.04, 0.05);

  const vent = CreateBox("prop.vent", { width: 0.9, height: 0.45, depth: 0.05 }, scene);
  vent.position.set(-2.2, 0.6, -5 + 0.2 / 2 + 0.03);
  vent.material = ventMat;

  const entry = findEntry(EV_HVAC_SPIKE);
  attachInteractable(vent as unknown as AbstractMesh, {
    kind: "inspect",
    prompt: "south vent",
    activate: (ctx) => {
      ctx.showInspectPanel(entry.title.toUpperCase(), entry.body);
      if (ctx.collectEvidence(EV_HVAC_SPIKE)) {
        ctx.flashHint("Logged to evidence.");
      }
    },
  });
}

// ──────────────────────────────── doors ────────────────────────────────

function buildMaintenanceDoor(scene: Scene): SlidingDoor {
  // Fills the lab east-wall doorway at x=4, z=-1..1.
  const door = new SlidingDoor(scene, {
    name: "door.maintenance",
    position: new Vector3(4, 1.25, 0),
    size: { width: 0.14, height: 2.5, depth: 2 },
    liftHeight: 2.6,
    closedEmissive: new Color3(0.35, 0.04, 0.04),
    openEmissive: new Color3(0.05, 0.55, 0.18),
  });

  const gate: GateState = { animating: false };
  const interactable = attachInteractable(door.mesh, {
    kind: "inspect",
    prompt: "sealed maintenance panel",
    activate: (ctx) => {
      if (ctx.worldState().maintenancePanelOpen) {
        ctx.showInspectPanel("MAINTENANCE LOG", MAINTENANCE_LOG_TEXT);
        return;
      }
      if (gate.animating) return;
      if (!ctx.hasAllEvidence(REQUIRED_FOR_GATE)) {
        const have = REQUIRED_FOR_GATE.filter((id) => ctx.hasEvidence(id)).length;
        ctx.flashHint(`Sealed. Need more context. (${have}/${REQUIRED_FOR_GATE.length})`);
        return;
      }
      gate.animating = true;
      ctx.flashHint("Seal releases.");
      ctx.setWorldFlag("maintenancePanelOpen", true);
      interactable.prompt = "maintenance log";
      // Save a checkpoint the moment the player cleared the evidence gate.
      ctx.saveCheckpoint("maint_open", "Maintenance panel breached");
      window.setTimeout(() => {
        gate.animating = false;
      }, 500);
    },
  });
  return door;
}

function buildCorridorDoor(scene: Scene): SlidingDoor {
  // Fills the corridor east-wall doorway at x=18, z=0..2.
  const door = new SlidingDoor(scene, {
    name: "door.corridor",
    position: new Vector3(18, 1.25, 1),
    size: { width: 0.14, height: 2.5, depth: 2 },
    liftHeight: 2.6,
    closedEmissive: new Color3(0.45, 0.05, 0.05),
    openEmissive: new Color3(0.05, 0.55, 0.55),
  });

  attachInteractable(door.mesh, {
    kind: "inspect",
    prompt: "corridor lockdown door",
    activate: (ctx) => {
      if (ctx.worldState().corridorLockdownCleared) {
        ctx.flashHint("Corridor clear.");
        return;
      }
      ctx.flashHint("LOCKDOWN ACTIVE — override required.");
    },
  });
  return door;
}

function buildServerAlcoveDoor(scene: Scene): SlidingDoor {
  // Fills the maintenance east-wall doorway at x=14, z=5..7.
  return new SlidingDoor(scene, {
    name: "door.server",
    position: new Vector3(14, 1.25, 6),
    size: { width: 0.14, height: 2.5, depth: 2 },
    liftHeight: 2.6,
    closedEmissive: new Color3(0.1, 0.25, 0.4),
    openEmissive: new Color3(0.2, 0.7, 1),
  });
}

function buildSecurityNookDoor(scene: Scene): SlidingDoor {
  // Fills the maintenance north-wall doorway at z=11, x=10..12.
  return new SlidingDoor(scene, {
    name: "door.security",
    position: new Vector3(11, 1.25, 11),
    size: { width: 2, height: 2.5, depth: 0.14 },
    liftHeight: 2.6,
    closedEmissive: new Color3(0.4, 0.1, 0.1),
    openEmissive: new Color3(0.9, 0.35, 0.3),
  });
}

// ──────────────────────────── maintenance junction ────────────────────────────

function buildPowerJunction(scene: Scene): void {
  // Stubby console standing in the middle of the maintenance area.
  const baseMat = new StandardMaterial("mat.junction.base", scene);
  baseMat.diffuseColor = new Color3(0.14, 0.13, 0.12);
  baseMat.specularColor = new Color3(0.22, 0.22, 0.22);

  const base = CreateBox("prop.junction.base", { width: 0.7, height: 1.0, depth: 0.5 }, scene);
  base.position.set(11, 0.5, 7);
  base.material = baseMat;
  base.checkCollisions = true;

  const panelMat = new StandardMaterial("mat.junction.panel", scene);
  panelMat.diffuseColor = new Color3(0.05, 0.05, 0.05);
  panelMat.specularColor = Color3.Black();
  panelMat.emissiveColor = new Color3(0.1, 0.6, 1);

  const panel = CreateBox("prop.junction.panel", { width: 0.5, height: 0.24, depth: 0.04 }, scene);
  panel.position.set(11, 1.05, 6.78);
  panel.rotation.x = -0.3;
  panel.material = panelMat;

  const describeRouting = (routing: string): string =>
    routing === "server_alcove" ? "Power → Server Alcove" : "Power → Security Nook";

  attachInteractable(panel, {
    kind: "toggle",
    prompt: "power routing junction",
    activate: (ctx) => {
      const current = ctx.worldState().powerRouting;
      const next = current === "server_alcove" ? "security_nook" : "server_alcove";
      ctx.setWorldFlag("powerRouting", next);
      panelMat.emissiveColor = next === "server_alcove"
        ? new Color3(0.1, 0.6, 1)
        : new Color3(0.95, 0.35, 0.25);
      ctx.flashHint(describeRouting(next));
      ctx.saveCheckpoint(`power_${next}`, `Power rerouted — ${describeRouting(next)}`);
    },
  });
}

// ──────────────────────────── security override ────────────────────────────

function buildSecurityOverride(scene: Scene, worldState: WorldStateStore): void {
  const mountMat = new StandardMaterial("mat.override.mount", scene);
  mountMat.diffuseColor = new Color3(0.12, 0.08, 0.08);
  mountMat.specularColor = new Color3(0.2, 0.15, 0.15);

  const mount = CreateBox("prop.override.mount", { width: 0.7, height: 1.1, depth: 0.3 }, scene);
  mount.position.set(11, 0.55, 16.5);
  mount.material = mountMat;
  mount.checkCollisions = true;

  const screenMat = new StandardMaterial("mat.override.screen", scene);
  screenMat.diffuseColor = new Color3(0.02, 0.02, 0.02);
  screenMat.specularColor = Color3.Black();
  screenMat.emissiveColor = new Color3(0.45, 0.05, 0.05);

  const screen = CreateBox("prop.override.screen", { width: 0.55, height: 0.35, depth: 0.04 }, scene);
  screen.position.set(11, 1.15, 16.35);
  screen.rotation.x = -0.22;
  screen.material = screenMat;

  const refreshVisual = (powered: boolean, fired: boolean): void => {
    if (fired) {
      screenMat.emissiveColor = new Color3(0.1, 0.7, 0.3);
    } else if (powered) {
      screenMat.emissiveColor = new Color3(0.95, 0.6, 0.1);
    } else {
      screenMat.emissiveColor = new Color3(0.45, 0.05, 0.05);
    }
  };

  const interactable = attachInteractable(screen, {
    kind: "inspect",
    prompt: "security override console",
    activate: (ctx) => {
      const s = ctx.worldState();
      if (s.corridorLockdownCleared) {
        ctx.flashHint("Override already fired.");
        return;
      }
      if (s.powerRouting !== "security_nook") {
        ctx.flashHint("Console is dark. Reroute power to the security nook first.");
        return;
      }
      ctx.setWorldFlag("corridorLockdownCleared", true);
      refreshVisual(true, true);
      interactable.prompt = "override fired";
      ctx.flashHint("Corridor lockdown released.");
      ctx.saveCheckpoint("corridor_cleared", "Corridor lockdown released");
    },
  });

  // Seed visual state from the current snapshot, and keep it in sync with
  // world-state changes (including checkpoint restores).
  const syncVisual = (): void => {
    const s = worldState.get();
    const powered = s.powerRouting === "security_nook";
    refreshVisual(powered, s.corridorLockdownCleared);
    interactable.prompt = s.corridorLockdownCleared
      ? "override fired"
      : "security override console";
  };
  syncVisual();
  const unsubscribe = worldState.onChange(syncVisual);
  scene.onDisposeObservable.addOnce(() => unsubscribe());
}

// ──────────────────────────── server alcove terminal ────────────────────────────

function buildServerTerminal(scene: Scene): void {
  const rackMat = new StandardMaterial("mat.server.rack", scene);
  rackMat.diffuseColor = new Color3(0.08, 0.09, 0.12);
  rackMat.specularColor = new Color3(0.2, 0.25, 0.3);
  const rack = CreateBox("prop.server.rack", { width: 0.8, height: 1.9, depth: 0.6 }, scene);
  rack.position.set(20, 0.95, 7);
  rack.material = rackMat;
  rack.checkCollisions = true;

  const screenMat = new StandardMaterial("mat.server.screen", scene);
  screenMat.diffuseColor = new Color3(0.02, 0.04, 0.06);
  screenMat.emissiveColor = new Color3(0.2, 0.65, 0.95);
  screenMat.specularColor = Color3.Black();
  const screen = CreateBox("prop.server.screen", { width: 0.6, height: 0.38, depth: 0.05 }, scene);
  screen.position.set(20, 1.5, 6.67);
  screen.rotation.x = -0.2;
  screen.material = screenMat;

  attachInteractable(screen, {
    kind: "inspect",
    prompt: "server mirror",
    activate: (ctx) => {
      ctx.showInspectPanel("SERVER B — MIRROR", SERVER_TERMINAL_TEXT);
    },
  });
}

// ──────────────────────────── final hallway plaque ────────────────────────────

function buildFinalPlaque(scene: Scene): void {
  const plaqueMat = new StandardMaterial("mat.plaque", scene);
  plaqueMat.diffuseColor = new Color3(0.05, 0.06, 0.08);
  plaqueMat.specularColor = new Color3(0.3, 0.4, 0.5);
  plaqueMat.emissiveColor = new Color3(0.15, 0.35, 0.45);

  const plaque = CreateBox("prop.plaque", { width: 1.4, height: 0.8, depth: 0.06 }, scene);
  plaque.position.set(26 - 0.2 / 2 - 0.04, 1.7, 1);
  plaque.rotation.y = -Math.PI / 2;
  plaque.material = plaqueMat;

  attachInteractable(plaque, {
    kind: "inspect",
    prompt: "floor access plaque",
    activate: (ctx) => {
      ctx.showInspectPanel("EAST CONTROL FLOOR", FINAL_PLAQUE_TEXT);
      ctx.saveCheckpoint("final_reached", "East control floor reached");
    },
  });
}

function findEntry(id: string): { title: string; body: string } {
  const entry = EVIDENCE_ENTRIES.find((e) => e.id === id);
  if (!entry) throw new Error(`roomInteractables: missing evidence entry "${id}"`);
  return entry;
}
