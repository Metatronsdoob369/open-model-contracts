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

const MODES = ['THERMAL', 'SHATTER', 'FORENSIC', 'VULN'] as const;
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
  },
  VULN: {
    title: 'VULN SNIPER TARGETING',
    desc: 'Identifying proximity to known threat clusters.',
    legend: [
      { color: '#FF0000', label: 'Red Glow: Exploit Proximity' },
      { color: '#00FF00', label: 'Green: Immune' },
    ]
  }
};

export default function SpectralRadar3072({ axis = 'X-AXIS' }: { axis?: string }) {
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
    if (!containerRef.current || loading) return;

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

    // 🏆 THE 3-AXIS SOVEREIGN GRID
    const grid = new THREE.GridHelper(20, 20, 0x333333, 0x111111);
    grid.rotation.x = Math.PI / 2;
    grid.position.z = -2;
    scene.add(grid);

    // 💎 THE CENTRAL PULSING CYAN ORB
    const orbGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const orbMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x00eeff) },
        uResonance: { value: 0.99 } // Linked to 3072-D Success
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uResonance;
        void main() {
          float intensity = pow(0.8 - dot(vNormal, vec3(0, 0, 1.0)), 3.0);
          float pulse = 0.7 + 0.3 * sin(uTime * 3.0 * uResonance);
          gl_FragColor = vec4(uColor, intensity * pulse * 0.8);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    const centralOrb = new THREE.Mesh(orbGeometry, orbMaterial);
    scene.add(centralOrb);

    // 🎯 THE VULN SNIPER DEAD ZONE
    const vulnZoneGroup = new THREE.Group();
    scene.add(vulnZoneGroup);
    if (mode === 'VULN') {
      const vulnGeo = new THREE.SphereGeometry(3, 32, 32);
      const vulnMat = new THREE.MeshBasicMaterial({ 
        color: 0xff0000, 
        transparent: true, 
        opacity: 0.1,
        blending: THREE.AdditiveBlending 
      });
      const vulnSphere = new THREE.Mesh(vulnGeo, vulnMat);
      vulnSphere.position.set(4, 4, 4);
      vulnZoneGroup.add(vulnSphere);

      // Add a core to the zone
      const coreGeo = new THREE.SphereGeometry(0.5, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.6 });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.set(4, 4, 4);
      vulnZoneGroup.add(core);
    }

    const updatePoints = () => {
      while (pointGroup.children.length > 0) {
        pointGroup.remove(pointGroup.children[0]);
      }

      // 1. DATA NODES (The Foundation)
      const allPoints: { pos: THREE.Vector3, sector: string, color: THREE.Color, distanceToVuln: number }[] = [];
      const vulnCentroid = new THREE.Vector3(4, 4, 4);
      
      data.forEach((point) => {
        const metric = mode === 'SHATTER' ? point.shatter : point.heat;
        const size = (mode === 'VULN' ? 0.08 : 0.04) + metric * 0.06;
        const pos = new THREE.Vector3(...point.position3d);
        const distanceToVuln = pos.distanceTo(vulnCentroid);

        let color = new THREE.Color(point.genre === 'PERSISTENCE' ? 0xff4040 : 0x00eeff);
        if (point.kind === 'canonical') color = new THREE.Color(0xd4af37);
        
        // VULN SNIPER OVERRIDE
        if (mode === 'VULN') {
          if (distanceToVuln < 3.5) {
            color = new THREE.Color(0xff2200); // Danger Red
          } else {
            color = new THREE.Color(0x00ff88); // Safe Green
          }
        }

        const geometry = new THREE.IcosahedronGeometry(size, 1);
        const material = new THREE.MeshBasicMaterial({ 
          color, 
          transparent: true, 
          opacity: mode === 'VULN' && distanceToVuln < 3.5 ? 1.0 : 0.8 
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(pos);
        
        if (mode === 'VULN' && distanceToVuln < 3.5) {
          // Add a targeting wireframe to hot nodes
          const wire = new THREE.Mesh(
            new THREE.IcosahedronGeometry(size * 1.5, 0),
            new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true, transparent: true, opacity: 0.4 })
          );
          sphere.add(wire);
        }

        pointGroup.add(sphere);
        allPoints.push({ pos, sector: point.genre, color, distanceToVuln });
      });

      // 2. THE TOPOLOGICAL TRUTH (KNN Mesh)
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: mode === 'VULN' ? 0x00ff88 : 0x444444, 
        transparent: true, 
        opacity: 0.15,
        blending: THREE.AdditiveBlending
      });

      for (let i = 0; i < allPoints.length; i++) {
        const p1 = allPoints[i];
        const neighbors = allPoints
          .map((p2, idx) => ({ dist: p1.pos.distanceTo(p2.pos), pos: p2.pos, idx }))
          .filter(n => n.idx !== i)
          .sort((a,b) => a.dist - b.dist)
          .slice(0, 3);

        neighbors.forEach(n => {
          const geometry = new THREE.BufferGeometry().setFromPoints([p1.pos, n.pos]);
          const isBridge = p1.sector !== allPoints[n.idx].sector;
          const isVulnPath = mode === 'VULN' && (p1.distanceToVuln < 3.5 || allPoints[n.idx].distanceToVuln < 3.5);
          
          const mat = isVulnPath 
            ? new THREE.LineBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending })
            : (isBridge 
              ? new THREE.LineBasicMaterial({ color: 0x00eeff, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending }) 
              : lineMaterial);
          
          pointGroup.add(new THREE.Line(geometry, mat));
        });
      }
    };

    updatePoints();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const animate = () => {
      const time = performance.now() / 1000;
      if (orbMaterial) orbMaterial.uniforms.uTime.value = time;
      
      // Smooth Camera Transition based on Axis
      const targetRotation = axis === 'Y-AXIS' ? Math.PI / 2 : (axis === 'Z-DEPTH' ? Math.PI : 0);
      const lerpFactor = 0.05;
      camera.position.x += (15 * Math.sin(targetRotation) - camera.position.x) * lerpFactor;
      camera.position.z += (15 * Math.cos(targetRotation) - camera.position.z) * lerpFactor;
      camera.lookAt(0, 0, 0);

      pointGroup.rotation.y += 0.005;
      centralOrb.rotation.y -= 0.002;
      
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameRef.current);
      if (rendererRef.current && container.contains(rendererRef.current.domElement)) {
        container.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
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
