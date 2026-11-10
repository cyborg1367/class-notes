export type Point3 = readonly [number, number, number];
export type Orientation = { yaw: number; pitch: number };

export const HOME_ORIENTATION: Readonly<Orientation> = Object.freeze({ yaw: -0.62, pitch: 0.36 });
export const SAMPLE_POINTS: readonly Point3[] = [
  [0.14, 0.22, 0.26], [0.31, 0.68, 0.16], [0.72, 0.19, 0.28],
  [0.81, 0.76, 0.35], [0.22, 0.42, 0.81], [0.64, 0.86, 0.79],
  [0.83, 0.41, 0.74], [0.43, 0.79, 0.49],
];

// The original conceptual coordinates and projection. No training, exercise or
// learner data is read by this illustration.
export function projectPoint(point: Point3, { yaw, pitch }: Orientation) {
  const [x, y, z] = point.map(value => value - 0.5);
  const horizontal = Math.cos(yaw) * x + Math.sin(yaw) * z;
  const depth = -Math.sin(yaw) * x + Math.cos(yaw) * z;
  const vertical = Math.cos(pitch) * y - Math.sin(pitch) * depth;
  const rotatedDepth = Math.sin(pitch) * y + Math.cos(pitch) * depth;
  const scale = 4 / (4 - rotatedDepth);
  return { x: 260 + horizontal * 175 * scale, y: 203 - vertical * 175 * scale, z: rotatedDepth, scale };
}

export function orbit(current: Orientation, dx: number, dy: number): Orientation {
  return {
    yaw: ((current.yaw + dx + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI,
    pitch: Math.max(-1.1, Math.min(1.1, current.pitch + dy)),
  };
}

export const ORBIT_ACTIONS = {
  left: [-0.18, 0], right: [0.18, 0], up: [0, -0.13], down: [0, 0.13],
} as const;
export type OrbitAction = keyof typeof ORBIT_ACTIONS | 'reset';
