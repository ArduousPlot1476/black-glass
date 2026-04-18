export const AppConfig = {
  title: "BLACK GLASS",
  milestone: "M0",

  engine: {
    antialias: true,
    adaptToDeviceRatio: true,
    preserveDrawingBuffer: false,
    stencil: true,
  },

  render: {
    clearColor: { r: 0.02, g: 0.03, b: 0.04, a: 1 },
    maxHardwareScale: 1,
  },

  camera: {
    fovDegrees: 60,
    minZ: 0.1,
    maxZ: 500,
  },
} as const;

export type AppConfigType = typeof AppConfig;
