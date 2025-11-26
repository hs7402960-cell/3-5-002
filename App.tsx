import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MachineScene } from './components/MachineScene';
import { ControlPanel } from './components/ControlPanel';
import { MachineState, INITIAL_STATE, DEFAULT_LIMITS } from './types';

function App() {
  const [state, setState] = useState<MachineState>(INITIAL_STATE);
  const [isScanning, setIsScanning] = useState(false);
  
  // Animation loop for scanning mode
  const requestRef = useRef<number>();

  const animate = useCallback((time: number) => {
    if (!isScanning) return;

    const t = time * 0.001;
    
    setState(prev => {
        // Orbit Logic: Move in a circle around the center (50, 50)
        const centerX = 50;
        const centerY = 50;
        
        // Increased Radius for 1.3x Working Distance
        const radius = 40; 
        
        // Calculate new position
        const angle = t * 0.5; // Speed of orbit
        const newX = centerX + Math.cos(angle) * radius;
        const newY = centerY + Math.sin(angle) * radius;
        
        // Z Axis Logic:
        // We moved the physical range of the head up (15 -> 9 units).
        // 0 machine Z = 15 world Y (High)
        // 100 machine Z = 9 world Y (Low)
        // Dog top is approx 3.75 world Y.
        // We want a safe distance. 
        // We keep Z param low (~20) to stay high physically.
        const newZ = 15 + Math.sin(t * 2) * 5;

        // --- LOOK AT LOGIC ---
        // Calculate B-Axis (Rotation) to face the center (50, 50)
        const dx = centerX - newX;
        const dy = centerY - newY;
        
        let targetB = Math.atan2(dx, dy) * (180 / Math.PI); 
        
        // Calculate A-Axis (Tilt) to look DOWN at the object
        // Height diff approx 13 (Head) - 3 (Dog) = 10 units
        // Horizontal dist approx 30-40 units (machine scale 0-100) -> 4-5 units world scale
        // Tilt is shallower now that we are higher up.
        const baseTilt = 10;
        const newA = baseTilt + Math.sin(t * 3) * 3;

        return {
            x: Math.max(DEFAULT_LIMITS.x.min, Math.min(DEFAULT_LIMITS.x.max, newX)),
            y: Math.max(DEFAULT_LIMITS.y.min, Math.min(DEFAULT_LIMITS.y.max, newY)),
            z: Math.max(DEFAULT_LIMITS.z.min, Math.min(DEFAULT_LIMITS.z.max, newZ)),
            a: Math.max(DEFAULT_LIMITS.a.min, Math.min(DEFAULT_LIMITS.a.max, newA)),
            b: Math.max(DEFAULT_LIMITS.b.min, Math.min(DEFAULT_LIMITS.b.max, targetB)),
        };
    });

    requestRef.current = requestAnimationFrame(animate);
  }, [isScanning]);

  useEffect(() => {
    if (isScanning) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
  }, [isScanning, animate]);

  const updateState = (key: keyof MachineState, value: number) => {
    // If manual interaction happens during scan, stop scan
    if (isScanning) setIsScanning(false);
    
    setState(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleReset = () => {
    setIsScanning(false);
    setState(INITIAL_STATE);
  };

  return (
    <div className="relative w-screen h-screen bg-slate-900 overflow-hidden font-sans text-slate-200 selection:bg-blue-500/30">
      
      {/* 3D Viewport */}
      <div className="absolute inset-0 z-0">
        <MachineScene 
            state={state} 
            limits={DEFAULT_LIMITS} 
            isScanning={isScanning} 
        />
      </div>

      {/* UI Overlay */}
      <ControlPanel 
        state={state}
        limits={DEFAULT_LIMITS}
        isScanning={isScanning}
        onUpdate={updateState}
        onReset={handleReset}
        onToggleScan={() => setIsScanning(!isScanning)}
      />

      {/* Decorative Overlay Elements */}
      <div className="absolute bottom-6 right-6 pointer-events-none select-none">
        <div className="text-right opacity-50">
           <h2 className="text-4xl font-black text-white tracking-tighter">RGB-D SCANNER</h2>
           <p className="text-sm font-mono text-blue-400">MODEL: V-800 // REV: 2.5.0</p>
        </div>
      </div>

      {/* Top Right Coordinate Readout (Heads Up Display) */}
      <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-lg pointer-events-none hidden md:block shadow-xl">
        <div className="grid grid-cols-3 gap-x-8 gap-y-2 font-mono text-sm">
            <div className="text-slate-300 font-bold">POS.X</div>
            <div className="text-right text-blue-300 col-span-2">{state.x.toFixed(3)}</div>
            
            <div className="text-slate-300 font-bold">POS.Y</div>
            <div className="text-right text-cyan-300 col-span-2">{state.y.toFixed(3)}</div>
            
            <div className="text-slate-300 font-bold">POS.Z</div>
            <div className="text-right text-emerald-300 col-span-2">{state.z.toFixed(3)}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
