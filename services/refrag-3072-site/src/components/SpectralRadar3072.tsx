'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

function PointCloud() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPoints() {
      try {
        const res = await fetch('/api/memory');
        const json = await res.json();
        if (json.status === 'ok') {
          setData(json.points);
        }
      } catch (e) {
        console.error("RADAR_FETCH_FAILURE:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchPoints();
  }, []);

  const pointPositions = useMemo(() => {
    if (data.length === 0) return new Float32Array(0);
    const p = new Float32Array(data.length * 3);
    data.forEach((point, i) => {
      p[i * 3] = point.position[0];
      p[i * 3 + 1] = point.position[1];
      p[i * 3 + 2] = point.position[2];
    });
    return p;
  }, [data]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = time * 0.05;
  });

  if (loading) return null;

  return (
    <Points positions={pointPositions} ref={pointsRef}>
      <PointMaterial
        transparent
        color="#D4AF37"
        size={0.12}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export default function SpectralRadar3072() {
  return (
    <div className="w-full h-full glass-card relative overflow-hidden group">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <color attach="background" args={['#050505']} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <PointCloud />
        </Float>

        <ambientLight intensity={0.5} />
      </Canvas>

      {/* Overlays */}
      <div className="absolute top-6 left-6 flex flex-col gap-1 pointer-events-none">
        <div className="text-[10px] text-gold tracking-[0.2em] font-bold uppercase opacity-80">
          Neural_Resonance_Visualizer
        </div>
        <div className="text-[8px] text-zinc-500 font-mono tracking-widest uppercase">
          Mode: Live_3072D_Vault_Strike
        </div>
      </div>

      <div className="absolute bottom-6 right-6 flex items-center gap-3 pointer-events-none">
        <div className="flex flex-col items-end">
          <div className="text-[8px] text-zinc-600 uppercase tracking-widest">Spectral_Sync</div>
          <div className="text-[10px] text-cyan font-bold font-mono text-glow-cyan">SYNCHRONIZED</div>
        </div>
        <div className="w-1 h-8 bg-zinc-800 rounded-full overflow-hidden">
             <div className="w-full h-full bg-cyan animate-pulse"></div>
        </div>
      </div>

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20"></div>
    </div>
  );
}

