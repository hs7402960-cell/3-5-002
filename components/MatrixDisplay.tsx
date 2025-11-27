import React, { useMemo } from 'react';
import * as THREE from 'three';
import { MachineState, TOOL_LENGTH_OFFSET } from '../types';
import { Grid3X3, Info, Axis3d, Ruler, Link } from 'lucide-react';

interface MatrixDisplayProps {
  state: MachineState;
}

// Helper to clean floating point errors (e.g. 1.2e-16 -> 0)
const cleanFloat = (val: number) => {
  if (Math.abs(val) < 0.001) return 0;
  return val;
};

export const MatrixDisplay = ({ state }: MatrixDisplayProps) => {
  // Compute Transformation Matrix
  // Logic: Relative Forward Kinematics
  // The goal is to show the TCP pose relative to the "Home Position" (0,0,0,0,0).
  const { displayMatrix, delta } = useMemo(() => {
    
    // --- 1. Helper Function to calculate TCP Pose for any given state ---
    const calculateTCP = (x: number, y: number, z: number, a: number, b: number) => {
        // A. Base Translation (Gantry/Head movement)
        const matTrans = new THREE.Matrix4().makeTranslation(x, y, z);
        
        // B. Rotations (Gimbal)
        // Order: B (Rotate around Z) then A (Tilt around local X)
        // NOTE: Controller B is "Compass" style (Neg=Left). Math Z-Rot is Right-Hand (Pos=Left).
        // We negate B to match the controller convention.
        const matRotB = new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(-b));
        const matRotA = new THREE.Matrix4().makeRotationX(THREE.MathUtils.degToRad(a));
        
        // C. Tool Offset
        // The tool vector extends along the Z axis (DOWNWARDS in our logical frame).
        // Length = TOOL_LENGTH_OFFSET
        // We use negative Z to represent "Down/Out" from the faceplate.
        const matTool = new THREE.Matrix4().makeTranslation(0, 0, -TOOL_LENGTH_OFFSET);

        // Chain: Base * RotB * RotA * Tool
        const matFinal = new THREE.Matrix4();
        matFinal.multiply(matTrans);
        matFinal.multiply(matRotB);
        matFinal.multiply(matRotA);
        matFinal.multiply(matTool);
        
        return matFinal;
    };

    // --- 2. Calculate Current Pose ---
    const currentMat = calculateTCP(state.x, state.y, state.z, state.a, state.b);

    // --- 3. Calculate Home Pose (Reference Zero) ---
    // This is where the TCP would be if all inputs were 0.
    // At (0,0,0,0,0), the TCP is at (0, 0, -TOOL_LENGTH_OFFSET) in absolute space.
    // We want to subtract this offset so that (0,0,0,0,0) reads as (0,0,0).
    const homeMat = calculateTCP(0, 0, 0, 0, 0);
    
    // Extract Home Position Vector
    const homePos = new THREE.Vector3();
    homePos.setFromMatrixPosition(homeMat);

    // --- 4. Construct Display Matrix ---
    // Rotation is absolute (current rotation).
    // Translation is Relative (Current Pos - Home Pos).
    const displayMat = currentMat.clone();
    const currentElements = currentMat.elements;
    
    // Calculated Delta for UI display
    const dX = currentElements[12] - homePos.x;
    const dY = currentElements[13] - homePos.y;
    const dZ = currentElements[14] - homePos.z;

    displayMat.elements[12] = dX;
    displayMat.elements[13] = dY;
    displayMat.elements[14] = dZ;

    // Calculate the "Error" vs Inputs (Motor Position)
    // This shows how much the rotation has shifted the tip away from the motor position
    const diffX = dX - state.x;
    const diffY = dY - state.y;
    const diffZ = dZ - state.z;

    return { 
        displayMatrix: displayMat, 
        delta: { diffX, diffY, diffZ } 
    };
  }, [state]);

  const elements = displayMatrix.elements; // Column-major array

  const getEl = (row: number, col: number) => {
    const val = cleanFloat(elements[col * 4 + row]);
    return val.toFixed(2);
  };
  
  const hasRotation = Math.abs(state.a) > 0.1 || Math.abs(state.b) > 0.1;

  return (
    <div className="absolute bottom-6 right-6 pointer-events-none hidden md:block">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl w-80">
            <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
                <div className="flex items-center gap-2">
                    <Grid3X3 size={16} className="text-purple-400" />
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">运动学变换矩阵</h3>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">
                    <Axis3d size={10} />
                    <span>针尖绝对坐标 (TCP)</span>
                </div>
            </div>
            
            <div className="flex flex-col gap-4">
                {/* Matrix Grid */}
                <div className="relative font-mono text-xs flex justify-center">
                    {/* Brackets */}
                    <div className="absolute left-1 top-0 bottom-0 w-2 border-l-2 border-t-2 border-b-2 border-slate-600 rounded-l-md" />
                    <div className="absolute right-1 top-0 bottom-0 w-2 border-r-2 border-t-2 border-b-2 border-slate-600 rounded-r-md" />

                    <div className="grid grid-cols-4 gap-x-4 gap-y-2 text-right mx-4">
                        {/* Row 0 */}
                        <span className="text-orange-300">{getEl(0,0)}</span>
                        <span className="text-orange-300">{getEl(0,1)}</span>
                        <span className="text-orange-300">{getEl(0,2)}</span>
                        <span className="text-cyan-300 font-bold">{getEl(0,3)}</span>

                        {/* Row 1 */}
                        <span className="text-orange-300">{getEl(1,0)}</span>
                        <span className="text-orange-300">{getEl(1,1)}</span>
                        <span className="text-orange-300">{getEl(1,2)}</span>
                        <span className="text-cyan-300 font-bold">{getEl(1,3)}</span>

                        {/* Row 2 */}
                        <span className="text-orange-300">{getEl(2,0)}</span>
                        <span className="text-orange-300">{getEl(2,1)}</span>
                        <span className="text-orange-300">{getEl(2,2)}</span>
                        <span className="text-cyan-300 font-bold">{getEl(2,3)}</span>

                        {/* Row 3 */}
                        <span className="text-slate-600">0.00</span>
                        <span className="text-slate-600">0.00</span>
                        <span className="text-slate-600">0.00</span>
                        <span className="text-slate-600">1.00</span>
                    </div>
                </div>
                
                {/* Info Status */}
                <div className="bg-slate-800/50 p-2 rounded text-[10px] text-slate-400 leading-tight">
                    {hasRotation ? (
                         <div className="flex flex-col gap-1">
                            <div className="flex gap-1.5 font-bold text-emerald-400 items-center">
                                <Link size={12} />
                                <span>数据已同步</span>
                            </div>
                            <p>控制台正显示 TCP 坐标。已自动补偿工具偏移：</p>
                            <div className="grid grid-cols-3 gap-1 font-mono text-right opacity-60 text-xs">
                                <span>ΔX: {delta.diffX > 0 ? '+' : ''}{delta.diffX.toFixed(1)}</span>
                                <span>ΔY: {delta.diffY > 0 ? '+' : ''}{delta.diffY.toFixed(1)}</span>
                                <span>ΔZ: {delta.diffZ > 0 ? '+' : ''}{delta.diffZ.toFixed(1)}</span>
                            </div>
                         </div>
                    ) : (
                        <div className="flex gap-2">
                            <Info size={14} className="shrink-0 mt-0.5 text-blue-400" />
                            <p>当前 A/B 轴归零。电机坐标与 TCP 坐标重合。</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};