import { Scene } from "@babylonjs/core/scene";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Engine } from "@babylonjs/core/Engines/engine";

import { AppConfig } from "../app/config";
import { InputState } from "../gameplay/player/input";
import { PlayerController } from "../gameplay/player/PlayerController";
import { InteractionSystem } from "../gameplay/interaction/InteractionSystem";
import type { InteractionContext } from "../gameplay/interaction/interactionTypes";
import { InteractionPrompt } from "../gameplay/ui/InteractionPrompt";
import { PauseMenu } from "../gameplay/ui/PauseMenu";
import { EvidenceBoard } from "../gameplay/ui/EvidenceBoard";
import { ObjectiveOverlay } from "../gameplay/ui/ObjectiveOverlay";
import { EvidenceRegistry } from "../gameplay/evidence/EvidenceRegistry";
import { EvidenceStore } from "../gameplay/evidence/EvidenceStore";
import { EVIDENCE_ENTRIES } from "../data/evidence/evidenceEntries";
import { WorldStateStore } from "../gameplay/worldState/WorldStateStore";
import { CheckpointManager } from "../gameplay/worldState/CheckpointManager";
import { INITIAL_WORLD_STATE } from "../data/world/worldStateDefinitions";

import { layOutFloor, LAB } from "./rooms/FloorLayout";
import { buildRoomInteractables } from "./rooms/roomInteractables";

export function createRootScene(engine: Engine): Scene {
  const canvas = engine.getRenderingCanvas();
  if (!canvas) throw new Error("RootScene: engine has no rendering canvas");

  const scene = new Scene(engine);
  const clear = AppConfig.render.clearColor;
  scene.clearColor = new Color4(clear.r, clear.g, clear.b, clear.a);
  scene.ambientColor = new Color3(0.03, 0.03, 0.04);
  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogColor = new Color3(clear.r, clear.g, clear.b);
  scene.fogDensity = 0.028;

  const { ceilingLamp } = layOutFloor(scene);

  const input = new InputState();
  input.attach();
  const spawn = new Vector3(0, AppConfig.player.eyeHeight, LAB.z0 + 1.5);
  const player = new PlayerController(scene, canvas, input, spawn, 0);

  const registry = new EvidenceRegistry(EVIDENCE_ENTRIES);
  const evidence = new EvidenceStore(registry);
  const worldState = new WorldStateStore(INITIAL_WORLD_STATE);
  const checkpoints = new CheckpointManager(worldState, evidence, player);

  const overlayHost = document.body;
  const prompt = new InteractionPrompt(overlayHost, scene, input, player);
  const pauseMenu = new PauseMenu(overlayHost, player, checkpoints);
  const objective = new ObjectiveOverlay(overlayHost, worldState, evidence);

  const uiCtx = prompt.uiContext();
  const interactionCtx: InteractionContext = {
    ...uiCtx,
    collectEvidence: (id) => evidence.collect(id),
    hasEvidence: (id) => evidence.has(id),
    hasAllEvidence: (ids) => evidence.hasAll(ids),
    worldState: () => worldState.get(),
    setWorldFlag: (key, value) => worldState.set(key, value),
    saveCheckpoint: (id, label) => {
      checkpoints.save(id, label);
    },
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
    evidence,
  );

  buildRoomInteractables({ scene, worldState, ceilingLamp });

  // Seed an initial "starting point" checkpoint so restore-from-start works
  // even before the player triggers any progression.
  checkpoints.save("start", "Fresh start");

  const onLockChange = (): void => {
    if (document.pointerLockElement === null && prompt.isInspectOpen()) {
      prompt.closeInspectForced();
    }
  };
  document.addEventListener("pointerlockchange", onLockChange);

  scene.onDisposeObservable.addOnce(() => {
    document.removeEventListener("pointerlockchange", onLockChange);
    objective.dispose();
    evidenceBoard.dispose();
    interaction.dispose();
    prompt.dispose();
    pauseMenu.dispose();
    player.dispose();
    input.detach();
  });

  return scene;
}
