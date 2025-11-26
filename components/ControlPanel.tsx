import React from 'react';
import { Play, RotateCcw, Scan, Pause, AlertCircle } from 'lucide-react';
import { MachineState, MachineLimits } from '../types';
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
                min={min} 
                max={max}
                value={value.toFixed(1)}
                onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) onChange(Math.max(min, Math.min(max, val)));
                }}
                className="w-16 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-right text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
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
  return (
    <div className="absolute top-4 left-4 w-80 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl p-5 shadow-2xl flex flex-col max-h-[calc(100vh-2rem)] overflow-y-auto z-10">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <h1 className="text-lg font-bold text-white tracking-tight">CNC Control <span className="text-blue-500">Pro</span></h1>
        </div>
        <button 
            onClick={onReset}
            className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 transition-colors"
            title="Reset Position"
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
        {isScanning ? <><Pause size={18} /> Stop Sequence</> : <><Play size={18} /> Start Auto-Scan</>}
      </button>

      {/* Axis Controls */}
      <div className="space-y-1">
        <AxisControl 
            label="X-Axis (Carriage)" 
            value={state.x} 
            min={limits.x.min} 
            max={limits.x.max} 
            onChange={(v) => onUpdate('x', v)}
            colorClass="accent-blue-500"
            unit="mm"
        />
        <AxisControl 
            label="Y-Axis (Gantry)" 
            value={state.y} 
            min={limits.y.min} 
            max={limits.y.max} 
            onChange={(v) => onUpdate('y', v)}
            colorClass="accent-cyan-500"
            unit="mm"
        />
        <AxisControl 
            label="Z-Axis (Head Height)" 
            value={state.z} 
            min={limits.z.min} 
            max={limits.z.max} 
            onChange={(v) => onUpdate('z', v)}
            colorClass="accent-emerald-500"
            unit="mm"
        />
        <div className="h-px bg-slate-700 my-4" />
        <AxisControl 
            label="A-Axis (Gimbal Tilt)" 
            value={state.a} 
            min={limits.a.min} 
            max={limits.a.max} 
            onChange={(v) => onUpdate('a', v)}
            colorClass="accent-purple-500"
            unit="deg"
        />
        <AxisControl 
            label="B-Axis (Gimbal Rotate)" 
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
            <h3 className="text-xs font-bold text-slate-300 uppercase">System Status</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
                <span className="text-slate-500 block mb-0.5">Mode</span>
                <span className={clsx("font-bold", isScanning ? "text-violet-400" : "text-slate-300")}>
                    {isScanning ? 'AUTO-SCAN' : 'MANUAL'}
                </span>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
                <span className="text-slate-500 block mb-0.5">Safety</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                    ACTIVE
                </span>
            </div>
        </div>
        
        {/* Helper Hint */}
        <div className="mt-4 flex items-start gap-2 text-[10px] text-slate-500 bg-slate-800/50 p-2 rounded">
            <AlertCircle size={12} className="mt-0.5 shrink-0" />
            <p>Use inputs for precision. Labels are displayed on the 3D model for clarity.</p>
        </div>
      </div>
    </div>
  );
};