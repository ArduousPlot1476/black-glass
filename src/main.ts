import { startApp } from "./app/bootstrap";

const CANVAS_ID = "app-canvas";
const STATUS_ID = "boot-status";

function setStatus(text: string, tone: "ok" | "error" | "default" = "default"): void {
  const el = document.getElementById(STATUS_ID);
  if (!el) return;
  el.textContent = text;
  el.classList.remove("ok", "error");
  if (tone === "ok") el.classList.add("ok");
  if (tone === "error") el.classList.add("error");
}

async function main(): Promise<void> {
  const canvas = document.getElementById(CANVAS_ID);
  if (!(canvas instanceof HTMLCanvasElement)) {
    setStatus("BLACK GLASS — canvas missing", "error");
    throw new Error(`Canvas element #${CANVAS_ID} not found`);
  }

  try {
    setStatus("BLACK GLASS — initializing engine…");
    const app = await startApp(canvas);
    setStatus(`BLACK GLASS — M1 • click to play • WASD • E • Esc (${app.engineName})`, "ok");
  } catch (err) {
    console.error("[BLACK GLASS] Boot failed:", err);
    setStatus("BLACK GLASS — boot failed (see console)", "error");
  }
}

void main();
