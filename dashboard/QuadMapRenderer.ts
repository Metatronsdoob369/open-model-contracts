
import * as THREE from 'three';

export interface CanonicalNode4Ds {
  id: string;
  room: string;
  heat: number;
  spatialEmbedding: number[]; // 3D Projected
  temporalSignatures: { phase: string; shatterVelocity: number }[];
}

export class QuadMapRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  public onHoverNode: (node: CanonicalNode4Ds | { id: string } | null) => void = () => { };
  public onClickNode: (node: CanonicalNode4Ds | { id: string } | null) => void = () => { };
  private nodeMeshes = new Map<string, THREE.Mesh>();
  private rooms = new Map<string, THREE.Mesh>(); // Sovereignty Orbs
  private pulseRings: THREE.Mesh[] = [];
  private ribbons: THREE.Group;

  private glowTexture: THREE.Texture | null = null;
  private nodeHalos = new Map<string, THREE.Sprite>();
  private hoveredNodeId: string | null = null;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error(`Container ${containerId} not found`);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }); // Solid ground for additive halos
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x0a0a0c, 1);
    container.appendChild(this.renderer.domElement);
    console.log('[4D-ENGINE] Handshake Manifested on Container:', containerId);

    this.camera.position.set(0, 20, 35);
    this.camera.lookAt(0, 0, 0);

    // 💎 [REACTOR CORE INJECTION] 💎
    // Central Blue Point Light for Luminous Grounding
    const coreLight = new THREE.PointLight(0x7bd1fa, 50, 40);
    coreLight.position.set(0, 0, 0);
    this.scene.add(coreLight);

    // Central Glow Sprite (The Heart of the Fabric)
    const spriteMaterial = new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/glow.png'),
      color: 0x7bd1fa,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.6
    });
    const coreSprite = new THREE.Sprite(spriteMaterial);
    coreSprite.scale.set(15, 15, 1);
    this.scene.add(coreSprite);

    // Cinematic Lighting
    this.scene.add(new THREE.AmbientLight(0x444466, 0.5));
    const pointLight = new THREE.PointLight(0x00ffff, 2, 50);
    pointLight.position.set(10, 20, 10);
    this.scene.add(pointLight);

    this.ribbons = new THREE.Group();
    this.scene.add(this.ribbons);

    // 💎 [NEON ANCHOR] 💎
    const gridHelper = new THREE.GridHelper(60, 30, 0x00ffff, 0x004444);
    gridHelper.position.y = -12;
    const gridMats = Array.isArray(gridHelper.material) ? gridHelper.material : [gridHelper.material];
    (gridMats as THREE.LineBasicMaterial[]).forEach(m => { m.transparent = true; m.opacity = 0.4; m.blending = THREE.AdditiveBlending; });
    this.scene.add(gridHelper);

    // 💎 SEED THE SOVEREIGNTY (Cinematic Default) 💎
    this.glowTexture = this.createGlowTexture();

    // 💎 [SOVEREIGN BOUNDARY INJECTION] 💎
    this.createStaticAnchors();

    this.animate();

    // Interactivity Listeners
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.renderer.domElement.addEventListener('click', this.onMouseClick.bind(this));
  }

  private createStaticAnchors() {
    // 🛡️ [DIAMOND STABLE CENTROID] 🛡️
    const centroidGeo = new THREE.SphereGeometry(2, 32, 32);
    const centroidMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.05, wireframe: true });
    const centroid = new THREE.Mesh(centroidGeo, centroidMat);
    centroid.position.set(0, 0, 0);
    this.scene.add(centroid);

    // 🏮 [BREACH PERIMETER] 🏮
    // Red circle at the 0.95v boundary on the grid floor
    const breachGeo = new THREE.TorusGeometry(25, 0.1, 16, 100);
    const breachMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.2 });
    const breach = new THREE.Mesh(breachGeo, breachMat);
    breach.position.y = -11.9;
    breach.rotation.x = Math.PI / 2;
    this.scene.add(breach);
  }

  private onMouseMove(event: MouseEvent) {
    const container = this.renderer.domElement.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private onMouseClick(event: MouseEvent) {
    const container = this.renderer.domElement.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const clickMouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(clickMouse, this.camera);
    const intersects = this.raycaster.intersectObjects(Array.from(this.nodeMeshes.values()));
    if (intersects.length > 0) {
      const mesh = intersects[0].object as THREE.Mesh;
      const id = [...this.nodeMeshes.entries()].find(([, m]) => m === mesh)?.[0];
      if (id && this.onClickNode) this.onClickNode({ id });
    }
  }

  private cameraLerping = false;
  private cameraLerpTarget: THREE.Vector3 | null = null;
  private tChroneSpin = false;

  public setCameraView(axis: 'x' | 'y' | 'z' | 't') {
    const views: Record<string, THREE.Vector3> = {
      x: new THREE.Vector3(50, 5, 0),
      y: new THREE.Vector3(0, 55, 0.1),
      z: new THREE.Vector3(0, 5, 50),
    };
    this.tChroneSpin = false;
    if (axis === 't') {
      this.tChroneSpin = true;
      return;
    }
    this.cameraLerpTarget = views[axis];
    this.cameraLerping = true;
  }

  private seedSovereignty() {
    const mockNodes: CanonicalNode4Ds[] = [
      { id: 'seed-1', room: 'ROOM-01_WorldState', heat: 0.8, spatialEmbedding: [0.2, 0.5, 0.3], temporalSignatures: [{ phase: 'scriptLoad', shatterVelocity: 0.9 }] },
      { id: 'seed-2', room: 'ROOM-01_WorldState', heat: 0.4, spatialEmbedding: [0.3, 0.6, 0.4], temporalSignatures: [{ phase: 'scriptLoad', shatterVelocity: 0.2 }] },
      { id: 'seed-3', room: 'ROOM-02_Client_Visual', heat: 0.9, spatialEmbedding: [0.7, 0.2, 0.8], temporalSignatures: [{ phase: 'chaosEvent', shatterVelocity: 0.95 }] },
      { id: 'seed-4', room: 'ROOM-03_Threading', heat: 0.6, spatialEmbedding: [0.5, 0.8, 0.5], temporalSignatures: [{ phase: 'scriptLoad', shatterVelocity: 0.5 }] }
    ];
    this.updateNodes(mockNodes);
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    // Animate Pulse Rings (Expansion + Fade)
    for (let i = this.pulseRings.length - 1; i >= 0; i--) {
      const ring = this.pulseRings[i];
      ring.scale.addScalar(0.04);
      (ring.material as THREE.MeshBasicMaterial).opacity -= 0.015;
      if ((ring.material as THREE.MeshBasicMaterial).opacity <= 0) {
        this.scene.remove(ring);
        this.pulseRings.splice(i, 1);
      }
    }

    // Gentle Orb Oscillation
    this.rooms.forEach(orb => {
      orb.scale.setScalar(1 + Math.sin(Date.now() * 0.001) * 0.05);
    });

    // Axis camera lerp
    if (this.cameraLerping && this.cameraLerpTarget) {
      this.camera.position.lerp(this.cameraLerpTarget, 0.05);
      this.camera.lookAt(0, 0, 0);
      if (this.camera.position.distanceTo(this.cameraLerpTarget) < 0.1) {
        this.camera.position.copy(this.cameraLerpTarget);
        this.cameraLerping = false;
      }
    }

    // T-CHRONE slow continuous spin around Y axis
    if (this.tChroneSpin) {
      const t = Date.now() * 0.0003;
      const r = 45;
      this.camera.position.set(Math.sin(t) * r, 18, Math.cos(t) * r);
      this.camera.lookAt(0, 0, 0);
    }

    this.renderer.render(this.scene, this.camera);

    // 💎 [HOVER LOGIC] 💎
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(Array.from(this.nodeMeshes.values()));

    if (intersects.length > 0) {
      const mesh = intersects[0].object as THREE.Mesh;
      const id = Array.from(this.nodeMeshes.entries()).find(([k, v]) => v === mesh)?.[0];

      if (id && id !== this.hoveredNodeId) {
        this.hoveredNodeId = id;
        if (this.onHoverNode) {
          const nodeData = Array.from(this.nodeMeshes.keys()).find(k => k === id);
          // We'll pass the ID back, the orchestrator has the full data
          this.onHoverNode({ id });
        }
      }
    } else {
      if (this.hoveredNodeId !== null) {
        this.hoveredNodeId = null;
        if (this.onHoverNode) this.onHoverNode(null);
      }
    }
  };

  public updateNodes(nodes: CanonicalNode4Ds[]) {
    nodes.forEach(node => {
      let mesh = this.nodeMeshes.get(node.id);

      // Node Instantiation
      if (!mesh) {
        const geometry = new THREE.IcosahedronGeometry(0.5, 2);
        const material = new THREE.MeshPhongMaterial({
          color: this.getRoomColor(node.room),
          emissive: 0x000000,
          transparent: true,
          opacity: 0.9,
          shininess: 100
        });
        mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
        this.nodeMeshes.set(node.id, mesh);

        // 💎 [HALO INJECTION] 💎
        if (this.glowTexture) {
          const spriteMaterial = new THREE.SpriteMaterial({
            map: this.glowTexture,
            color: this.getRoomColor(node.room),
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.8
          });
          const sprite = new THREE.Sprite(spriteMaterial);
          sprite.scale.set(6, 6, 1);
          mesh.add(sprite);
          this.nodeHalos.set(node.id, sprite);
        }

        // Ensure Sovereignty Orb exists
        this.ensureRoomOrb(node.room, mesh.position);
      }

      const pos = this.projectTo3D(node.spatialEmbedding);
      mesh.position.lerp(new THREE.Vector3(pos.x, pos.y, pos.z), 0.1);

      const avgVelocity = node.temporalSignatures.reduce((sum, t) => sum + t.shatterVelocity, 0) / (node.temporalSignatures.length || 1);

      // 💎 [DETERMINISTIC SCALE] 💎
      // Base scale from velocity + 1.5x Hover Multiplier
      let targetScale = 1 + avgVelocity * 2;
      if (node.id === this.hoveredNodeId) {
        targetScale *= 1.5;
      }
      mesh.scale.setScalar(targetScale);

      // Heat Bloom + Hover Intent Glow
      const baseHeat = this.getHeatColor(node.heat);
      const glowColor = node.id === this.hoveredNodeId ? 0xffffff : baseHeat;
      (mesh.material as THREE.MeshPhongMaterial).emissive.setHex(glowColor);
      (mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = node.id === this.hoveredNodeId ? 1.0 : 0.5;

      // 💎 [DROP-LINE] 💎
      // Connect each node to the grid floor for spatial orientation
      this.createDropLine(mesh.position, node.id);

      // Trigger Pulse Rings on high velocity intervals
      if (avgVelocity > 0.7 && Math.random() > 0.95) {
        this.createPulseRing(mesh.position, node.room);
      }
    });

    this.updateRibbons(nodes);
  }

  private ensureRoomOrb(room: string, pos: THREE.Vector3) {
    if (!this.rooms.has(room)) {
      const geometry = new THREE.SphereGeometry(8, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: this.getRoomColor(room),
        transparent: true,
        opacity: 0.05,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
      });
      const orb = new THREE.Mesh(geometry, material);
      orb.position.copy(pos);
      this.scene.add(orb);
      this.rooms.set(room, orb);
    }
  }

  private createPulseRing(pos: THREE.Vector3, room: string) {
    const geometry = new THREE.TorusGeometry(0.5, 0.02, 16, 100);
    const material = new THREE.MeshBasicMaterial({
      color: this.getRoomColor(room),
      transparent: true,
      opacity: 0.8
    });
    const ring = new THREE.Mesh(geometry, material);
    ring.position.copy(pos);
    ring.rotation.x = Math.PI / 2;
    this.scene.add(ring);
    this.pulseRings.push(ring);
  }

  private dropLines = new Map<string, THREE.Line>();
  private createDropLine(pos: THREE.Vector3, id: string) {
    let line = this.dropLines.get(id);
    if (!line) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(pos.x, pos.y, pos.z),
        new THREE.Vector3(pos.x, -12, pos.z)
      ]);
      const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });
      line = new THREE.Line(geometry, material);
      this.scene.add(line);
      this.dropLines.set(id, line);
    }
    line.geometry.setFromPoints([
      new THREE.Vector3(pos.x, pos.y, pos.z),
      new THREE.Vector3(pos.x, -12, pos.z)
    ]);
  }

  private updateRibbons(nodes: CanonicalNode4Ds[]) {
    // Logic to draw glowing ribbons between high-shatter nodes
    this.ribbons.clear();
    const fractured = nodes.filter(n => n.temporalSignatures.some(t => t.shatterVelocity > 0.6));

    for (let i = 0; i < fractured.length; i++) {
      for (let j = i + 1; j < fractured.length; j++) {
        const start = this.projectTo3D(fractured[i].spatialEmbedding);
        const end = this.projectTo3D(fractured[j].spatialEmbedding);

        const coreGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(start.x, start.y, start.z),
          new THREE.Vector3(end.x, end.y, end.z)
        ]);
        const coreMaterial = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.4,
          blending: THREE.AdditiveBlending
        });
        const line = new THREE.Line(coreGeometry, coreMaterial);
        this.ribbons.add(line);
      }
    }
  }

  private projectTo3D(embedding: number[]): THREE.Vector3 {
    return new THREE.Vector3(
      (embedding[0] || 0) * 20 - 10,
      (embedding[1] || 0) * 15 - 7.5,
      (embedding[2] || 0) * 20 - 10
    );
  }

  private createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(0, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(0, 100, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  private getRoomColor(room: string): number {
    if (room.includes("WorldState")) return 0x00ffff; // Cyan
    if (room.includes("Client_Visual")) return 0xffffff; // White
    if (room.includes("Threading")) return 0x7bd1fa; // Light Blue
    return 0xffffff;
  }

  private getHeatColor(heat: number): number {
    // Shifting from Blood Red to "Charged Gold/White"
    const intensity = Math.floor(heat * 255);
    return (0xff << 16) | (Math.floor(intensity * 0.8) << 8) | intensity;
  }
}
