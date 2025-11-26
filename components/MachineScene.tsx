import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Grid, 
  PerspectiveCamera, 
  Html,
  ContactShadows
} from '@react-three/drei';
import * as THREE from 'three';
import { MachineState, MachineLimits } from '../types';

interface SceneProps {
  state: MachineState;
  limits: MachineLimits;
  isScanning: boolean;
}

// -- Individual Machine Components --

const AxisArrows = ({ scale = 1, labelSuffix = '' }: { scale?: number, labelSuffix?: string }) => (
  <group scale={scale}>
    {/* Z Axis (Blue) */}
    <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.02, 0.02, 1]} />
      <meshBasicMaterial color="#3b82f6" />
    </mesh>
    <mesh position={[0, 0, 1.1]} rotation={[Math.PI / 2, 0, 0]}>
      <coneGeometry args={[0.08, 0.2]} />
      <meshBasicMaterial color="#3b82f6" />
    </mesh>
    <Html position={[0, 0, 1.3]} center transform sprite>
        <div className="text-[10px] font-bold text-blue-500 font-mono">Z{labelSuffix}</div>
    </Html>

    {/* Y Axis (Green) */}
    <mesh position={[0, 0.5, 0]}>
      <cylinderGeometry args={[0.02, 0.02, 1]} />
      <meshBasicMaterial color="#22c55e" />
    </mesh>
    <mesh position={[0, 1.1, 0]}>
      <coneGeometry args={[0.08, 0.2]} />
      <meshBasicMaterial color="#22c55e" />
    </mesh>
    <Html position={[0, 1.3, 0]} center transform sprite>
        <div className="text-[10px] font-bold text-green-500 font-mono">Y{labelSuffix}</div>
    </Html>

    {/* X Axis (Red) */}
    <mesh position={[0.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <cylinderGeometry args={[0.02, 0.02, 1]} />
      <meshBasicMaterial color="#ef4444" />
    </mesh>
    <mesh position={[1.1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <coneGeometry args={[0.08, 0.2]} />
      <meshBasicMaterial color="#ef4444" />
    </mesh>
    <Html position={[1.3, 0, 0]} center transform sprite>
        <div className="text-[10px] font-bold text-red-500 font-mono">X{labelSuffix}</div>
    </Html>
  </group>
);

const BasePlatform = () => (
  <group position={[0, -0.5, 0]}>
    {/* Main Bed */}
    <mesh receiveShadow position={[0, 0, 0]}>
      <boxGeometry args={[16, 1, 16]} />
      <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.5} />
    </mesh>
    {/* Rails Y */}
    <mesh position={[6, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.15, 0.15, 14]} />
      <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
    </mesh>
    <mesh position={[-6, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.15, 0.15, 14]} />
      <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
    </mesh>
  </group>
);

const DogModel = ({ isScanning }: { isScanning: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const BASE_SCALE = 1.5; // Increased scale by 1.5x as requested

  useFrame((state) => {
    if (groupRef.current && isScanning) {
        // Subtle breathing animation when scanning
        const s = BASE_SCALE + Math.sin(state.clock.elapsedTime * 8) * 0.005;
        groupRef.current.scale.set(s, s, s);
    } else if (groupRef.current) {
        groupRef.current.scale.set(BASE_SCALE, BASE_SCALE, BASE_SCALE);
    }
  });

  const skinColor = "#ea580c"; // Burnt orange / brown
  const skinMaterial = <meshStandardMaterial color={skinColor} roughness={0.8} />;
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Platform/Base for figurine */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[2.5, 2.7, 0.2, 32]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      <group position={[0, 0.2, 0]}>
        {/* Body */}
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.4, 1.2, 2.2]} />
            {skinMaterial}
        </mesh>
        
        {/* Head Group */}
        <group position={[0, 1.8, 1.2]}>
            {/* Head Main */}
            <mesh castShadow>
                <boxGeometry args={[1, 1, 1]} />
                {skinMaterial}
            </mesh>
            {/* Snout */}
            <mesh position={[0, -0.1, 0.6]} castShadow>
                <boxGeometry args={[0.6, 0.5, 0.4]} />
                <meshStandardMaterial color="#fed7aa" /> 
            </mesh>
            {/* Nose */}
            <mesh position={[0, 0, 0.85]}>
                <boxGeometry args={[0.2, 0.15, 0.1]} />
                <meshStandardMaterial color="#1e293b" /> 
            </mesh>
            {/* Ears */}
            <mesh position={[0.4, 0.6, 0]} rotation={[0, 0, 0.2]} castShadow>
                <boxGeometry args={[0.2, 0.6, 0.4]} />
                <meshStandardMaterial color="#7c2d12" /> 
            </mesh>
            <mesh position={[-0.4, 0.6, 0]} rotation={[0, 0, -0.2]} castShadow>
                <boxGeometry args={[0.2, 0.6, 0.4]} />
                <meshStandardMaterial color="#7c2d12" /> 
            </mesh>
            {/* Eyes */}
            <mesh position={[0.25, 0.1, 0.51]}>
                <sphereGeometry args={[0.08]} />
                <meshStandardMaterial color="black" /> 
            </mesh>
            <mesh position={[-0.25, 0.1, 0.51]}>
                <sphereGeometry args={[0.08]} />
                <meshStandardMaterial color="black" /> 
            </mesh>
        </group>

        {/* Legs */}
        {[
            { x: 0.5, z: 0.8 }, { x: -0.5, z: 0.8 },
            { x: 0.5, z: -0.8 }, { x: -0.5, z: -0.8 }
        ].map((pos, i) => (
            <mesh key={i} position={[pos.x, 0.4, pos.z]} castShadow>
                <boxGeometry args={[0.3, 0.8, 0.3]} />
                {skinMaterial}
            </mesh>
        ))}

        {/* Tail */}
        <group position={[0, 1.2, -1.1]} rotation={[0.5, 0, 0]}>
             <mesh position={[0, 0.3, 0]} castShadow>
                <boxGeometry args={[0.2, 0.8, 0.2]} />
                {skinMaterial}
             </mesh>
        </group>
      </group>
      
      {isScanning && (
        <mesh position={[0, 1.5, 0]}>
           <sphereGeometry args={[2, 32, 32]} />
           <meshBasicMaterial color="#4ade80" wireframe transparent opacity={0.1} />
        </mesh>
      )}
    </group>
  );
};

const GantryAndHead = ({ state, limits, isScanning }: SceneProps) => {
  // Map 0-100 to world coordinates
  const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  };

  const posY = mapRange(state.y, limits.y.min, limits.y.max, -4, 4);
  const posX = mapRange(state.x, limits.x.min, limits.x.max, -4, 4);
  
  // Z-Axis Mapping:
  // Adjusted for 1.3x Working Distance and 1.5x Dog Scale.
  // We need more clearance. 
  // Old Range: 11 -> 7.5
  // New Range: 15 (Max Height) -> 9 (Min Height)
  const headWorldY = mapRange(state.z, limits.z.min, limits.z.max, 15, 9);
  
  // Gantry Geometry Height must be taller
  const gantryHeight = 16; 

  // Rotation
  const rotA = THREE.MathUtils.degToRad(state.a);
  const rotB = THREE.MathUtils.degToRad(state.b);

  return (
    <group>
      {/* GANTRY (Moves on Y) */}
      <group position={[0, 0, posY]}>
        {/* Bridge Legs */}
        <mesh position={[6, gantryHeight/2, 0]} castShadow>
          <boxGeometry args={[0.8, gantryHeight, 1.5]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[-6, gantryHeight/2, 0]} castShadow>
          <boxGeometry args={[0.8, gantryHeight, 1.5]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        {/* Bridge Beam */}
        <mesh position={[0, gantryHeight, 0]} castShadow>
          <boxGeometry args={[14, 1, 1.5]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        
        {/* Axis Label */}
         <Html position={[-7, 1, 0]} className="pointer-events-none">
            <div className="text-xs font-bold text-slate-800 bg-white/90 px-2 py-0.5 rounded border border-slate-300 whitespace-nowrap shadow-md">
                Gantry Y
            </div>
        </Html>

        {/* CARRIAGE (Moves on X) */}
        <group position={[posX, gantryHeight - 0.5, 0.8]}>
           <mesh castShadow>
             <boxGeometry args={[1.8, 1.2, 0.5]} />
             <meshStandardMaterial color="#94a3b8" />
           </mesh>
           
            <Html position={[0, 1, 0]} className="pointer-events-none">
                <div className="text-xs font-bold text-slate-800 bg-white/90 px-2 py-0.5 rounded border border-slate-300 whitespace-nowrap shadow-md">
                    Carriage X
                </div>
            </Html>

           {/* Z-COLUMN (Fixed to carriage, guides the slide) */}
           <mesh position={[0, -2, 0.5]} castShadow>
             <boxGeometry args={[1, 6, 1]} />
             <meshStandardMaterial color="#64748b" />
           </mesh>

           {/* ACTIVE HEAD (Moves Vertically) */}
           <group position={[0, headWorldY - (gantryHeight - 0.5), 0.5]}>
              {/* Vertical Slide Body */}
              <mesh position={[0, 2, 0.5]} castShadow>
                <boxGeometry args={[0.8, 8, 0.8]} />
                <meshStandardMaterial color="#cbd5e1" />
              </mesh>
              
              <Html position={[1, 0, 0.5]} className="pointer-events-none">
                <div className="text-xs font-bold text-slate-800 bg-white/90 px-2 py-0.5 rounded border border-slate-300 whitespace-nowrap shadow-md">
                    Head Z
                </div>
              </Html>

              {/* END EFFECTOR (Rotations) */}
              <group position={[0, -1.8, 0.8]}>
                 {/* B-Axis (Rotation around Vertical) */}
                 <group rotation={[0, rotB, 0]}>
                    <mesh position={[0, 0.2, 0]}>
                       <cylinderGeometry args={[0.5, 0.5, 0.4, 32]} />
                       <meshStandardMaterial color="#475569" />
                    </mesh>
                    
                    {/* A-Axis (Tilt) */}
                    <group rotation={[rotA, 0, 0]}>
                         {/* NEEDLE LASER HEAD (Center) */}
                         <group position={[0, -1, 0]}>
                             {/* Base Holder */}
                             <mesh position={[0, 0.8, 0]} castShadow>
                                <boxGeometry args={[0.6, 0.8, 0.6]} />
                                <meshStandardMaterial color="#334155" />
                             </mesh>
                             
                             {/* Needle */}
                             <mesh position={[0, 0, 0]} castShadow>
                                <cylinderGeometry args={[0.08, 0.02, 1.8]} />
                                <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
                             </mesh>

                             {/* Laser Coordinate System Axis Gizmo */}
                             {/* Z points DOWN (Match camera) */}
                             <group position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                                 <AxisArrows scale={0.3} labelSuffix="L" />
                             </group>

                             {/* Laser Beam Emitter Visualization */}
                             {isScanning && (
                                <mesh position={[0, -2.5, 0]}>
                                     <cylinderGeometry args={[0.005, 0.005, 5]} />
                                     <meshBasicMaterial color="red" opacity={0.6} transparent />
                                </mesh>
                             )}
                         </group>

                         {/* SIDE MOUNTED CAMERA */}
                         {/* Now angled to match the needle direction perfectly */}
                         <group position={[0.4, -0.5, 0]}> 
                            {/* Mount Bracket */}
                            <mesh position={[-0.15, 0.5, 0]}>
                                <boxGeometry args={[0.3, 0.2, 0.2]} />
                                <meshStandardMaterial color="#475569" />
                            </mesh>
                            
                            {/* Camera Body */}
                            <mesh position={[0.1, 0.2, 0]} castShadow>
                                <boxGeometry args={[0.4, 0.6, 0.4]} />
                                <meshStandardMaterial color="#0f172a" />
                            </mesh>

                            {/* Lens (Pointing Down) */}
                            <mesh position={[0.1, -0.11, 0]} rotation={[0, 0, 0]}>
                                <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
                                <meshStandardMaterial color="#333" />
                            </mesh>
                            <mesh position={[0.1, -0.16, 0]} rotation={[0, 0, 0]}>
                                <cylinderGeometry args={[0.1, 0.1, 0.02, 32]} />
                                <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.8} />
                            </mesh>

                            {/* Camera Coordinate System Axis Gizmo */}
                            {/* Attached to lens, Z pointing down (scan dir) */}
                            {/* X-rotation 90 deg makes Z point to -Y (Down) */}
                            <group position={[0.1, -0.16, 0]} rotation={[Math.PI/2, 0, 0]}>
                                <AxisArrows scale={0.3} labelSuffix="C" />
                            </group>

                            {/* Camera Frustum */}
                            <mesh rotation={[0, 0, 0]} position={[0.1, -3, 0]}>
                                <coneGeometry args={[1.5, 5.5, 4, 1, true]} />
                                <meshBasicMaterial 
                                    color="#10b981" 
                                    transparent 
                                    opacity={isScanning ? 0.15 : 0.05} 
                                    side={THREE.DoubleSide} 
                                    depthWrite={false}
                                />
                            </mesh>
                         </group>
                    </group>
                 </group>
              </group>
           </group>
        </group>
      </group>
    </group>
  );
};

export const MachineScene = (props: SceneProps) => {
  return (
    <div className="w-full h-full bg-[#0f172a]">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[18, 18, 20]} fov={40} />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} target={[0, 3, 0]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.8} color="#ffffff" />
        <directionalLight 
          position={[10, 20, 5]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[2048, 2048]} 
          shadow-bias={-0.0001}
        />
        <pointLight position={[-10, 8, -10]} intensity={50} color="#e0f2fe" />
        <pointLight position={[0, 5, 5]} intensity={20} color="#fff" />

        {/* Environment */}
        <BasePlatform />
        <DogModel isScanning={props.isScanning} />
        <GantryAndHead {...props} />
        
        {/* Helpers */}
        <Grid 
          renderOrder={-1} 
          position={[0, -0.01, 0]} 
          infiniteGrid 
          cellSize={1} 
          sectionSize={5} 
          fadeDistance={40} 
          sectionColor="#475569" 
          cellColor="#1e293b" 
        />
        <ContactShadows opacity={0.4} scale={30} blur={2.5} far={4} resolution={256} color="#000000" />
      </Canvas>
    </div>
  );
};
