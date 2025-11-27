
export interface MachineState {
  x: number; // 0 to 100
  y: number; // 0 to 100
  z: number; // 0 to 100
  a: number; // -45 to 45 (Tilt)
  b: number; // -180 to 180 (Rotate)
}

export interface MachineLimits {
  x: { min: number; max: number };
  y: { min: number; max: number };
  z: { min: number; max: number };
  a: { min: number; max: number };
  b: { min: number; max: number };
}

export const DEFAULT_LIMITS: MachineLimits = {
  x: { min: 0, max: 100 },
  y: { min: 0, max: 100 },
  z: { min: 0, max: 100 },
  a: { min: -45, max: 45 },
  b: { min: -180, max: 180 },
};

export const INITIAL_STATE: MachineState = {
  x: 50,
  y: 50,
  z: 10,
  a: 0,
  b: 0,
};

// Physical Constants
// Defines the length of the tool (pivot to tip) in logical units (mm)
// This causes the XYZ variance when rotating AB.
export const TOOL_LENGTH_OFFSET = 25.0; 
