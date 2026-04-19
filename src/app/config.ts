export const AppConfig = {
  title: "BLACK GLASS",
  milestone: "M3",

  engine: {
    antialias: true,
    adaptToDeviceRatio: true,
    preserveDrawingBuffer: false,
    stencil: true,
  },

  render: {
    clearColor: { r: 0.015, g: 0.02, b: 0.028, a: 1 },
    maxHardwareScale: 1,
  },

  camera: {
    fovDegrees: 65,
    minZ: 0.1,
    maxZ: 200,
  },

  player: {
    eyeHeight: 1.7,
    moveSpeed: 3.0,
    sprintMultiplier: 1.6,
    mouseSensitivity: 0.0022,
    ellipsoid: { x: 0.4, y: 0.85, z: 0.4 },
  },

  interaction: {
    rayDistance: 2.5,
  },
} as const;

export type AppConfigType = typeof AppConfig;
