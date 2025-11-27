import React, { useMemo } from 'react';
import { Play, RotateCcw, Scan, Pause, AlertCircle, Settings2, Link } from 'lucide-react';
import { MachineState, MachineLimits, TOOL_LENGTH_OFFSET } from '../types';
import * as THREE from 'three';
import clsx from 'clsx';

interface ControlPanelProps {
  state: MachineState;
  limits: MachineLimits;
  isScanning: boolean;
  onUpdate: (key: keyof MachineState, value: number) => void;
  onReset: () => void;
  onToggleScan: () => void;
}

const AxisControl = ({ 
  label, 
  value, 
  min, 
  max, 
  onChange, 
  colorClass,
  unit = ''
}: { 
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  onChange: (val: number) => void;
  colorClass: string;
  unit?: string;
}) => {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</label>
        <div className="flex items-center gap-2">
            <input 
                type="number" 
                // Allow a slightly wider range for manual input if needed, but clamp logic handles safety
                value={value.toFixed(2)}
                onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) onChange(val);
                }}
                className="w-20 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-right text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
            />
            <span className="text-xs text-slate-600 w-4">{unit}</span>
        </div>
      </div>
      <div className="relative flex items-center h-4 w-full">
         <input
          type="range"
          min={min}
          max={max}
          step={0.1}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={clsx(
            "w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-700",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110",
            colorClass
          )}
        />
      </div>
    </div>
  );
};

export const ControlPanel = ({ 
  state, 
  limits, 
  isScanning, 
  onUpdate, 
  onReset, 
  onToggleScan 
}: ControlPanelProps) => {

  // Calculate Forward Kinematics Delta to sync with MatrixDisplay
  // Delta = (Rotation * ToolOffset) - HomeOffset
  const delta = useMemo(() => {
    // 1. Calculate Rotation Matrix
    // B is negative because controller B is "Left=Neg", Math is "Left=Pos"
    const matRotB = new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(-state.b));
    const matRotA = new THREE.Matrix4().makeRotationX(THREE.MathUtils.degToRad(state.a));
    
    // 2. Tool Offset Vector (Downwards -Z)
    const vecTool = new THREE.Vector3(0, 0, -TOOL_LENGTH_OFFSET);
    
    // 3. Rotate Tool Vector
    // Apply B then A
    const currentOffset = vecTool.clone().applyMatrix4(matRotA).applyMatrix4(matRotB);
    
    // 4. Calculate Delta from Home (Home is just (0,0,-L))
    const homeOffset = new THREE.Vector3(0, 0, -TOOL_LENGTH_OFFSET);
    
    return currentOffset.sub(homeOffset);
  }, [state.a, state.b]);

  // Wrapper to update Motor Position based on Target TCP Position
  // TargetTCP = Motor + Delta
  // Motor = TargetTCP - Delta
  const updateTCP = (axis: 'x' | 'y' | 'z', targetTCPVal: number) => {
    let motorVal = 0;
    if (axis === 'x') motorVal = targetTCPVal - delta.x;
    if (axis === 'y') motorVal = targetTCPVal - delta.y;
    if (axis === 'z') motorVal = targetTCPVal - delta.z;

    // Clamp to Physical Motor Limits
    const limit = limits[axis];
    const clampedMotorVal = Math.max(limit.min, Math.min(limit.max, motorVal));
    
    onUpdate(axis, clampedMotorVal);
  };

  return (
    <div className="absolute top-4 left-4 w-80 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl p-5 shadow-2xl flex flex-col max-h-[calc(100vh-2rem)] overflow-y-auto z-10">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <div>
                <h1 className="text-lg font-bold text-white tracking-tight leading-none">CNC 控制台 <span className="text-blue-500">Pro</span></h1>
                <span className="text-[10px] text-blue-300 uppercase tracking-widest font-bold flex items-center gap-1">
                    <Link size={10} /> TCP 坐标 (Cartesian)
                </span>
            </div>
        </div>
        <button 
            onClick={onReset}
            className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 transition-colors"
            title="复位参数"
        >
            <RotateCcw size={16} />
        </button>
      </div>

      {/* Main Scan Button */}
      <button
        onClick={onToggleScan}
        className={clsx(
            "w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 mb-8 transition-all shadow-lg transform active:scale-95",
            isScanning 
                ? "bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20" 
                : "bg-blue-600 text-white hover:bg-blue-500 border border-transparent shadow-blue-500/20"
        )}
      >
        {isScanning ? <><Pause size={18} /> 停止自动扫描</> : <><Play size={18} /> 开始自动扫描</>}
      </button>

      {/* Axis Controls */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-2 text-slate-500 border-b border-slate-800 pb-1">
            <Settings2 size={12} />
            <span className="text-[10px] uppercase font-bold">TCP 线性坐标 (XYZ)</span>
        </div>
        
        {/* X Axis */}
        <AxisControl 
            label="X 轴 (TCP 横向)" 
            value={state.x + delta.x} 
            min={limits.x.min + delta.x} 
            max={limits.x.max + delta.x} 
            onChange={(v) => updateTCP('x', v)}
            colorClass="accent-blue-500"
            unit="mm"
        />
        {/* Y Axis */}
        <AxisControl 
            label="Y 轴 (TCP 纵向)" 
            value={state.y + delta.y} 
            min={limits.y.min + delta.y} 
            max={limits.y.max + delta.y} 
            onChange={(v) => updateTCP('y', v)}
            colorClass="accent-cyan-500"
            unit="mm"
        />
        {/* Z Axis */}
        <AxisControl 
            label="Z 轴 (TCP 高度)" 
            value={state.z + delta.z} 
            min={limits.z.min + delta.z} 
            max={limits.z.max + delta.z} 
            onChange={(v) => updateTCP('z', v)}
            colorClass="accent-emerald-500"
            unit="mm"
        />
        
        <div className="h-px bg-slate-700 my-4" />
        
        <div className="flex items-center gap-2 mb-2 text-slate-500 border-b border-slate-800 pb-1">
            <Settings2 size={12} />
            <span className="text-[10px] uppercase font-bold">云台姿态 (AB)</span>
        </div>

        {/* Rotation axes directly control the motor, no linear offset applied to angle */}
        <AxisControl 
            label="A 轴 (俯仰)" 
            value={state.a} 
            min={limits.a.min} 
            max={limits.a.max} 
            onChange={(v) => onUpdate('a', v)}
            colorClass="accent-purple-500"
            unit="deg"
        />
        <AxisControl 
            label="B 轴 (旋转)" 
            value={state.b} 
            min={limits.b.min} 
            max={limits.b.max} 
            onChange={(v) => onUpdate('b', v)}
            colorClass="accent-orange-500"
            unit="deg"
        />
      </div>

      {/* Status Footer */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="flex items-center gap-2 mb-2">
            <Scan size={14} className="text-slate-400" />
            <h3 className="text-xs font-bold text-slate-300 uppercase">系统状态</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
                <span className="text-slate-500 block mb-0.5">模式</span>
                <span className={clsx("font-bold", isScanning ? "text-violet-400" : "text-slate-300")}>
                    {isScanning ? '自动扫描' : '手动控制'}
                </span>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
                <span className="text-slate-500 block mb-0.5">安全监测</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                    正常
                </span>
            </div>
        </div>
        
        {/* Helper Hint */}
        <div className="mt-4 flex items-start gap-2 text-[10px] text-blue-400/80 bg-blue-500/10 p-2 rounded border border-blue-500/10">
            <AlertCircle size={12} className="mt-0.5 shrink-0" />
            <p>已启用 TCP 模式。控制台数值已补偿工具长度 ({TOOL_LENGTH_OFFSET}mm) 造成的偏差，与矩阵数据保持一致。</p>
        </div>
      </div>
    </div>
  );
};