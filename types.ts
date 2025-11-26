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
  z: 80, // Start high up for safety (logic inverted in visualization: high Z param = lower head, so 0 is highest safe point usually? Wait, let's check map logic.)
         // Logic in MachineScene: mapRange(z, min, max, 11, 7.5). 
         // If Z=0 -> Y=11 (Highest). If Z=100 -> Y=7.5 (Lowest).
         // So to start safe (High), we want Z to be LOW.
         // Let's set Z=0 initially.
  a: 0,
  b: 0,
};

// Correction: Let's set Z to 10 to be slightly engaged but safe.
INITIAL_STATE.z = 10;
