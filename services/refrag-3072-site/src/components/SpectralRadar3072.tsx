'use client';

import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';

type HeatmapData = {
  id: string;
  file: string;
  genre: 'MOVEMENT' | 'PERSISTENCE' | 'INTERACTION' | 'VISUALS';
  kind: 'canonical' | 'shattered';
  position3d: [number, number, number];
  heat: number;
  shatter: number;
  source: string;
  capabilityStrength: number;
};

const GENRE_ANCHORS: Record<HeatmapData['genre'], [number, number, number]> = {
  MOVEMENT: [-8, 0, 0],
  INTERACTION: [8, 0, 0],
  VISUALS: [0, 8, 0],
  PERSISTENCE: [0, -8, 0],
};

const MODES = ['THERMAL', 'SHATTER', 'FORENSIC'] as const;
type Mode = typeof MODES[number];

const MODE_INFO = {
  THERMAL: {
    title: 'THERMAL DISTANCE MAP',
    desc: 'Shows how far each file is from the canonical centroid.',
    legend: [
      { color: '#D4AF37', label: 'Gold: Near Canonical' },
      { color: '#00EEFF', label: 'Cyan: Active Drift' },
    ]
  },
  SHATTER: {
    title: 'SHATTER MAGNITUDE',
    desc: 'Measures structural fragmentation.',
    legend: [
      { color: '#FF4040', label: 'Red: Critical Shatter' },
      { color: '#00EEFF', label: 'Cyan: Intact' },
    ]
  },
  FORENSIC: {
    title: 'REPAIR PATHWAYS',
    desc: 'Predictive repair traces.',
    legend: [
      { color: '#00EEFF', label: 'Cyan Web: Neural Connectivity' },
    ]
  }
};

export default function SpectralRadar3072() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<HeatmapData[]>([]);
  const [mode, setMode] = useState<Mode>('THERMAL');
  const [loading, setLoading] = useState(true);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    async function fetchPoints() {
      try {
        const res = await fetch('/api/heatmap');
        const json = await res.json();
        if (json.status === 'ok') setData(json.points);
      } catch (e) {
        console.error("RADAR_FETCH_FAILURE:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchPoints();
  }, []);

  useEffect(() => {
    if (!containerRef.current || loading || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020202);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const pointGroup = new THREE.Group();
    scene.add(pointGroup);

    const updatePoints = () => {
      while (pointGroup.children.length > 0) {
        pointGroup.remove(pointGroup.children[0]);
      }

      // 1. DATA NODES (The Foundation)
      const allPoints: { pos: THREE.Vector3, sector: string, color: THREE.Color }[] = [];
      
      data.forEach((point) => {
        const metric = mode === 'SHATTER' ? point.shatter : point.heat;
        const size = 0.04 + metric * 0.06;
        const pos = new THREE.Vector3(...point.position3d);

        let color = new THREE.Color(point.genre === 'PERSISTENCE' ? 0xff4040 : 0x00eeff);
        if (point.kind === 'canonical') color = new THREE.Color(0xd4af37);

        const geometry = new THREE.IcosahedronGeometry(size, 1);
        const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(pos);
        pointGroup.add(sphere);

        allPoints.push({ pos, sector: point.genre, color });
      });

      // 2. THE TOPOLOGICAL TRUTH (KNN Mesh)
      // Connect every point up to its 3 nearest neighbors globally
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x444444, 
        transparent: true, 
        opacity: 0.2,
        blending: THREE.AdditiveBlending
      });

      for (let i = 0; i < allPoints.length; i++) {
        const p1 = allPoints[i];
        
        // Find nearest neighbors
        const neighbors = allPoints
          .map((p2, idx) => ({ dist: p1.pos.distanceTo(p2.pos), pos: p2.pos, idx }))
          .filter(n => n.idx !== i)
          .sort((a,b) => a.dist - b.dist)
          .slice(0, 3);

        neighbors.forEach(n => {
          const geometry = new THREE.BufferGeometry().setFromPoints([p1.pos, n.pos]);
          // If connection is inter-sector, highlight the bridge
          const isBridge = p1.sector !== allPoints[n.idx].sector;
          const mat = isBridge 
            ? new THREE.LineBasicMaterial({ color: 0x00eeff, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending }) 
            : lineMaterial;
          
          pointGroup.add(new THREE.Line(geometry, mat));
        });
      }
    };

    updatePoints();

    const animate = () => {
      pointGroup.rotation.y += 0.005;
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      if (rendererRef.current) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [data, mode, loading]);

  return (
    <div className="w-full h-full relative overflow-hidden group">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-4 right-4 flex gap-2">
        {MODES.map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`px-2 py-1 text-[8px] font-bold tracking-widest uppercase border transition-all ${mode === m ? 'border-gold text-gold bg-gold/10' : 'border-zinc-800 text-zinc-600 hover:text-zinc-400'}`}>
            {m}
          </button>
        ))}
      </div>
      <div className="absolute bottom-4 left-4 flex flex-col gap-1 pointer-events-none">
        <div className="text-[10px] text-gold tracking-widest font-bold uppercase opacity-60">XENON_SPECTRUM_ENGINE</div>
        <div className="text-[8px] text-zinc-600 font-mono uppercase tracking-widest">Structural_Law: {mode}</div>
      </div>
    </div>
  );
}
