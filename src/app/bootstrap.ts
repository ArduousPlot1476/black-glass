import { Engine } from "@babylonjs/core/Engines/engine";
import type { Scene } from "@babylonjs/core/scene";

import { AppConfig } from "./config";
import { createRootScene } from "../scenes/RootScene";

export interface AppHandle {
  engine: Engine;
  scene: Scene;
  engineName: string;
  dispose: () => void;
}

export async function startApp(canvas: HTMLCanvasElement): Promise<AppHandle> {
  const engine = new Engine(
    canvas,
    AppConfig.engine.antialias,
    {
      preserveDrawingBuffer: AppConfig.engine.preserveDrawingBuffer,
      stencil: AppConfig.engine.stencil,
    },
    AppConfig.engine.adaptToDeviceRatio,
  );

  const scene = createRootScene(engine);

  const onResize = (): void => engine.resize();
  window.addEventListener("resize", onResize);

  engine.runRenderLoop(() => {
    if (scene.activeCamera) {
      scene.render();
    }
  });

  const dispose = (): void => {
    window.removeEventListener("resize", onResize);
    engine.stopRenderLoop();
    scene.dispose();
    engine.dispose();
  };

  const engineName = `WebGL${engine.webGLVersion}`;
  return { engine, scene, engineName, dispose };
}
