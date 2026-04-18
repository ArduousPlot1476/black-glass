import { Scene } from "@babylonjs/core/scene";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { SpotLight } from "@babylonjs/core/Lights/spotLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import type { Engine } from "@babylonjs/core/Engines/engine";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";

import { AppConfig } from "../app/config";
import { InputState } from "../gameplay/player/input";
import { PlayerController } from "../gameplay/player/PlayerController";
import { InteractionSystem } from "../gameplay/interaction/InteractionSystem";
import { attachInteractable } from "../gameplay/interaction/Interactable";
import type { InteractionContext } from "../gameplay/interaction/interactionTypes";
import { InteractionPrompt } from "../gameplay/ui/InteractionPrompt";
import { PauseMenu } from "../gameplay/ui/PauseMenu";
import { EvidenceBoard } from "../gameplay/ui/EvidenceBoard";
import { EvidenceRegistry } from "../gameplay/evidence/EvidenceRegistry";
import { EvidenceStore } from "../gameplay/evidence/EvidenceStore";
import {
  EVIDENCE_ENTRIES,
  EV_SHIFT_LOG,
  EV_DATA_SHARD,
  EV_HVAC_SPIKE,
} from "../data/evidence/evidenceEntries";

const ROOM = { width: 8, depth: 10, height: 3 };
const WALL_THICKNESS = 0.2;

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
  "Reaching her will require clearing the east hallway lockdown. That sequence is",
  "handled in Milestone 3.",
].join("\n");

export function createRootScene(engine: Engine): Scene {
  const canvas = engine.getRenderingCanvas();
  if (!canvas) throw new Error("RootScene: engine has no rendering canvas");

  const scene = new Scene(engine);
  const clear = AppConfig.render.clearColor;
  scene.clearColor = new Color4(clear.r, clear.g, clear.b, clear.a);
  scene.ambientColor = new Color3(0.03, 0.03, 0.04);
  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogColor = new Color3(clear.r, clear.g, clear.b);
  scene.fogDensity = 0.035;

  buildRoom(scene);
  const ceilingLamp = buildCeilingLamp(scene);
  buildAtmosphereLights(scene);

  const input = new InputState();
  input.attach();
  const player = new PlayerController(
    scene,
    canvas,
    input,
    new Vector3(0, AppConfig.player.eyeHeight, -ROOM.depth / 2 + 1.2),
    0,
  );

  const overlayHost = document.body;
  const prompt = new InteractionPrompt(overlayHost, scene, input, player);
  const pauseMenu = new PauseMenu(overlayHost, player);

  const registry = new EvidenceRegistry(EVIDENCE_ENTRIES);
  const store = new EvidenceStore(registry);

  const uiCtx = prompt.uiContext();
  const interactionCtx: InteractionContext = {
    ...uiCtx,
    collectEvidence: (id) => store.collect(id),
    hasEvidence: (id) => store.has(id),
    hasAllEvidence: (ids) => store.hasAll(ids),
  };

  const interaction = new InteractionSystem(scene, player, input, interactionCtx);
  prompt.bindSystem(interaction);

  const evidenceBoard = new EvidenceBoard(
    overlayHost,
    scene,
    input,
    player,
    pauseMenu,
    prompt,
    registry,
    store,
  );

  const onLockChange = (): void => {
    if (document.pointerLockElement === null && prompt.isInspectOpen()) {
      // Pointer lock lost mid-inspect (e.g. Esc): drop the panel but leave
      // pause state alone — PauseMenu's own pointerlockchange handler will
      // have already raised the menu.
      prompt.closeInspectForced();
    }
  };
  document.addEventListener("pointerlockchange", onLockChange);

  populateInteractables(scene, ceilingLamp);

  scene.onDisposeObservable.addOnce(() => {
    document.removeEventListener("pointerlockchange", onLockChange);
    evidenceBoard.dispose();
    interaction.dispose();
    prompt.dispose();
    pauseMenu.dispose();
    player.dispose();
    input.detach();
  });

  return scene;
}

function buildRoom(scene: Scene): void {
  const { width: w, depth: d, height: h } = ROOM;

  const floorMat = new StandardMaterial("mat.floor", scene);
  floorMat.diffuseColor = new Color3(0.08, 0.09, 0.1);
  floorMat.specularColor = new Color3(0.25, 0.28, 0.32);
  floorMat.specularPower = 96;

  const wallMat = new StandardMaterial("mat.wall", scene);
  wallMat.diffuseColor = new Color3(0.06, 0.07, 0.09);
  wallMat.specularColor = new Color3(0.08, 0.09, 0.11);

  const ceilMat = new StandardMaterial("mat.ceiling", scene);
  ceilMat.diffuseColor = new Color3(0.03, 0.035, 0.04);
  ceilMat.specularColor = Color3.Black();

  const floor = CreateGround("room.floor", { width: w, height: d }, scene);
  floor.position.y = 0;
  floor.material = floorMat;
  floor.checkCollisions = true;

  const ceiling = CreateGround("room.ceiling", { width: w, height: d }, scene);
  ceiling.position.y = h;
  ceiling.rotation.x = Math.PI;
  ceiling.material = ceilMat;

  buildWall(scene, "room.wall.north", w, h, WALL_THICKNESS, new Vector3(0, h / 2, d / 2), wallMat);
  buildWall(scene, "room.wall.south", w, h, WALL_THICKNESS, new Vector3(0, h / 2, -d / 2), wallMat);
  buildWall(scene, "room.wall.east", WALL_THICKNESS, h, d, new Vector3(w / 2, h / 2, 0), wallMat);
  buildWall(scene, "room.wall.west", WALL_THICKNESS, h, d, new Vector3(-w / 2, h / 2, 0), wallMat);
}

function buildWall(
  scene: Scene,
  name: string,
  width: number,
  height: number,
  depth: number,
  position: Vector3,
  material: StandardMaterial,
): Mesh {
  const mesh = CreateBox(name, { width, height, depth }, scene);
  mesh.position.copyFrom(position);
  mesh.material = material;
  mesh.checkCollisions = true;
  return mesh;
}

function buildCeilingLamp(scene: Scene): SpotLight {
  const lamp = new SpotLight(
    "light.ceiling",
    new Vector3(0, ROOM.height - 0.1, 1.5),
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

function buildAtmosphereLights(scene: Scene): void {
  const hemi = new HemisphericLight("light.hemi", new Vector3(0, 1, 0), scene);
  hemi.diffuse = new Color3(0.35, 0.42, 0.55);
  hemi.groundColor = new Color3(0.06, 0.05, 0.04);
  hemi.intensity = 0.12;

  // Warm desk spot — always on, sells the "someone just left" mood.
  const desk = new SpotLight(
    "light.desk",
    new Vector3(2, ROOM.height - 0.2, 2.5),
    new Vector3(0, -1, -0.2),
    Math.PI / 3.5,
    4,
    scene,
  );
  desk.diffuse = new Color3(1, 0.82, 0.62);
  desk.specular = new Color3(0.8, 0.7, 0.55);
  desk.intensity = 1.4;
  desk.range = 6;

  // Cold accent from the switch side of the room.
  const accent = new PointLight("light.accent", new Vector3(-2.5, 1.7, -2), scene);
  accent.diffuse = new Color3(0.35, 0.55, 0.85);
  accent.specular = new Color3(0.2, 0.35, 0.6);
  accent.intensity = 0.4;
  accent.range = 4;
}

interface ToggleState {
  on: boolean;
}

function populateInteractables(scene: Scene, ceilingLamp: SpotLight): void {
  // Desk
  const deskMat = new StandardMaterial("mat.desk", scene);
  deskMat.diffuseColor = new Color3(0.14, 0.12, 0.11);
  deskMat.specularColor = new Color3(0.2, 0.18, 0.16);
  const desk = CreateBox("prop.desk", { width: 1.6, height: 0.8, depth: 0.8 }, scene);
  desk.position.set(2, 0.4, 2.5);
  desk.material = deskMat;
  desk.checkCollisions = true;

  buildTerminal(scene);
  buildWallSwitch(scene, ceilingLamp);
  buildDataShard(scene);
  buildHvacVent(scene);
  buildMaintenancePanel(scene);
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
  switchPlate.position.set(-ROOM.width / 2 + WALL_THICKNESS / 2 + 0.03, 1.35, -2);
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

  const vent = CreateBox(
    "prop.vent",
    { width: 0.9, height: 0.45, depth: 0.05 },
    scene,
  );
  // South wall, low on the wall — small inward offset so it reads as inset.
  vent.position.set(-2.2, 0.6, -ROOM.depth / 2 + WALL_THICKNESS / 2 + 0.03);
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

interface GateState {
  opened: boolean;
  animating: boolean;
}

function buildMaintenancePanel(scene: Scene): void {
  const panelMat = new StandardMaterial("mat.panel", scene);
  panelMat.diffuseColor = new Color3(0.1, 0.11, 0.12);
  panelMat.specularColor = new Color3(0.25, 0.27, 0.3);
  panelMat.emissiveColor = new Color3(0.35, 0.04, 0.04);

  const panel = CreateBox(
    "prop.panel",
    { width: 0.08, height: 1.2, depth: 0.8 },
    scene,
  );
  // East wall, chest-height.
  const baseY = 1.1;
  panel.position.set(ROOM.width / 2 - WALL_THICKNESS / 2 - 0.05, baseY, -1.2);
  panel.material = panelMat;

  const gate: GateState = { opened: false, animating: false };
  const interactable = attachInteractable(panel as unknown as AbstractMesh, {
    kind: "inspect",
    prompt: "sealed maintenance panel",
    activate: (ctx) => {
      if (gate.opened) {
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
      tweenPanelOpen(scene, panel, panelMat, baseY, () => {
        gate.opened = true;
        gate.animating = false;
        interactable.prompt = "maintenance log";
      });
    },
  });
}

function tweenPanelOpen(
  scene: Scene,
  panel: Mesh,
  material: StandardMaterial,
  baseY: number,
  onComplete: () => void,
): void {
  const duration = 500; // ms
  const rise = 1.4;
  const fromEmissive = material.emissiveColor.clone();
  const toEmissive = new Color3(0.05, 0.55, 0.18);
  let elapsed = 0;

  const step = (): void => {
    elapsed += scene.getEngine().getDeltaTime();
    const t = Math.min(1, elapsed / duration);
    // ease-out cubic
    const e = 1 - Math.pow(1 - t, 3);
    panel.position.y = baseY + rise * e;
    material.emissiveColor = Color3.Lerp(fromEmissive, toEmissive, e);
    if (t >= 1) {
      scene.onBeforeRenderObservable.removeCallback(step);
      onComplete();
    }
  };
  scene.onBeforeRenderObservable.add(step);
}

function findEntry(id: string): { title: string; body: string } {
  const entry = EVIDENCE_ENTRIES.find((e) => e.id === id);
  if (!entry) throw new Error(`RootScene: missing evidence entry "${id}"`);
  return entry;
}
