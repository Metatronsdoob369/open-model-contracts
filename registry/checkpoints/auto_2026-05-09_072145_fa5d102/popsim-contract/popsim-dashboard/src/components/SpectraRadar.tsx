'use client';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, OrbitControls, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

const ParticleField = ({ points }: { points: any[] }) => {
  const ref = useRef<any>();
  
  // Convert points to Float32Array for Three.js
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(points.length * 3);
    const cols = new Float32Array(points.length * 3);
    
    points.forEach((p, i) => {
      // Coords from spectra mapping (scaled for visibility)
      pos[i * 3] = p.coordinates[0] * 5;
      pos[i * 3 + 1] = p.coordinates[1] * 5;
      pos[i * 3 + 2] = p.coordinates[2] * 5;
      
      // Color based on Heat (Resonance)
      // High heat (magenta) -> Low heat (cyan)
      const color = new THREE.Color();
      color.setHSL(0.5 + p.heat * 0.2, 1, 0.5); // HSL shift based on heat
      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;
    });
    
    return [pos, cols];
  }, [points]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={ref}>
      <Points positions={positions} colors={colors}>
        <PointMaterial
          transparent
          vertexColors
          size={0.15}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      
      {/* Centroid Marker (Stability Core) */}
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

export const SpectraRadar = ({ report }: { report: any[] }) => {
  const MAX_POINTS = 5000;
  const [displayPoints, setDisplayPoints] = useState<any[]>([]);

  useEffect(() => {
    if (report && report.length > 0) {
      setDisplayPoints(report.slice(0, MAX_POINTS));
    } else {
      // Mock data for initial manifestation
      const mocks = Array.from({ length: 400 }).map((_, i) => ({
        coordinates: [(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2],
        heat: Math.random(),
        shatter: Math.random() * 0.5
      }));
      setDisplayPoints(mocks);
    }
  }, [report]);

  return (
    <div className="glass p-6 h-full flex flex-col gap-4 relative overflow-hidden group">
      <div className="flex items-center justify-between border-b border-white/5 pb-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#00e5ff] animate-ping" />
          <h2 className="text-xs font-bold tracking-widest text-[#00e5ff] uppercase">Spectra Radar // 3072-D</h2>
        </div>
        <span className="text-[10px] text-gray-500 font-mono tracking-taller">
          Shatter Resolution: {displayPoints.length} Chunks
        </span>
      </div>

      <div className="flex-1 min-h-[300px] relative rounded-lg overflow-hidden bg-black/20">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <color attach="background" args={['#000']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <ParticleField points={displayPoints} />
          </Float>
          
          <OrbitControls enableZoom={true} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
        
        {/* HUD Overlays */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-1 pointer-events-none">
          <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-magenta-500 rounded-sm" style={{backgroundColor: '#bf00ff'}} />
             <span className="text-[9px] uppercase text-gray-500 font-bold">High Resonance</span>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-cyan-500 rounded-sm" style={{backgroundColor: '#00e5ff'}} />
             <span className="text-[9px] uppercase text-gray-500 font-bold">Stable Centroid</span>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-5 group-hover:opacity-10 transition-opacity">
         <div className="text-[140px] font-black text-white select-none">3072</div>
      </div>
    </div>
  );
};
