import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { VCSContract, graduateContract } from './vcs-contract.js';

interface PackNode {
  id?: string;
  type: string;
  properties: Record<string, any>;
}

export interface RobloxPreviewOutput {
  status: "valid" | "partial" | "invalid";
  capabilitiesUsed: string[];
  blockedFeatures: string[];
  missingRequirements: string[];
  completenessScore: number;
  luauScripts: Record<string, string>;
  vcs?: any;
}

// ── Part E: Instance Adapter (The Engine Bridge) ───────────────────────────
const INSTANCE_ADAPTER: Record<string, { robloxClass: string, service: string }> = {
    ArenaRoot: { robloxClass: "Folder", service: "Workspace" },
    CircularPlatform: { robloxClass: "Part", service: "Workspace" },
    NeonRingBorder: { robloxClass: "Part", service: "Workspace" },
    SpawnPad: { robloxClass: "Model", service: "Workspace" },
    GameRoundController: { robloxClass: "Script", service: "ServerScriptService" },
    ScreenGuiRoot: { robloxClass: "ScreenGui", service: "StarterGui" },
    LightingConfig: { robloxClass: "Lighting", service: "Lighting" }
};

export class PackExporter {
  private pack: any;

  constructor(packPath: string) {
    this.pack = JSON.parse(fs.readFileSync(packPath, 'utf8'));
    graduateContract();
  }

  validate(nodes: PackNode[]): RobloxPreviewOutput {
    const root = nodes.find(n => n.type === 'ArenaRoot');
    if (!root) return { status: "invalid", capabilitiesUsed: [], blockedFeatures: [], missingRequirements: ["ArenaRoot missing"], completenessScore: 0, luauScripts: {} };

    const output: RobloxPreviewOutput = {
      status: "valid",
      capabilitiesUsed: [],
      blockedFeatures: [],
      missingRequirements: [],
      completenessScore: 100,
      luauScripts: {}
    };

    try {
        const intent = root.properties.name || "Neon Tag Arena";
        output.vcs = this.generateVCS(nodes, intent);
        VCSContract.parse(output.vcs);
    } catch (error: any) {
        output.status = "invalid";
    }

    return output;
  }

  public async generatePack(nodes: PackNode[], intent: string): Promise<any> {
      const vcs = this.generateVCS(nodes, intent);
      console.log(`📡 [FORGE] Executing 1-Shot Publish for: ${intent}`);
      
      const response = await fetch("http://127.0.0.1:8080/rehydrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(vcs)
      });

      return { vcs, response: await response.json() };
  }

  public injectDNA(nodeType: string, dnaPath: string): void {
      const dna = JSON.parse(fs.readFileSync(dnaPath, 'utf8'));
      INSTANCE_ADAPTER[nodeType] = { 
          robloxClass: dna.robloxClass, 
          service: dna.service || "Workspace",
          dnaChildren: dna.children || [] // Capture the full sub-hierarchy
      };
      console.log(`🧬 [FORGE-DNA] Injected Total Hierarchy for: ${nodeType}`);
  }

  private generateVCS(nodes: PackNode[], intent: string): any {
    nodes.forEach((n, i) => { if (!n.id) n.id = `node_${n.type.toLowerCase()}_${i}`; });

    // ── Structural Routing ──────────────────────────────────────────────────
    const services: Record<string, any> = {
        Workspace: { id: "workspace", name: "Workspace", type: "Workspace", children: [] },
        ServerScriptService: { id: "sss", name: "ServerScriptService", type: "ServerScriptService", children: [] },
        Lighting: { id: "lighting", name: "Lighting", type: "Lighting", children: [] },
        StarterGui: { id: "gui", name: "StarterGui", type: "StarterGui", children: [] }
    };

    const arenaCore = { id: "folder_arena_core", name: "Arena_Core", type: "Folder", properties: {}, children: [] as any[] };
    services.Workspace.children.push(arenaCore);

    nodes.forEach(n => {
        const adapter = INSTANCE_ADAPTER[n.type];
        if (!adapter) return;

        const vcsNode: any = {
            id: n.id!,
            name: n.properties.name || n.type,
            type: adapter.robloxClass,
            properties: n.properties,
            children: []
        };

        // Inject DNA Sub-Hierarchy if present
        if (adapter.dnaChildren) {
            vcsNode.children = JSON.parse(JSON.stringify(adapter.dnaChildren));
        }

        if (adapter.service === "Workspace") {
            if (n.type !== "ArenaRoot") {
                arenaCore.children.push(vcsNode);
            }
        } else if (services[adapter.service]) {
            services[adapter.service].children.push(vcsNode);
        }
    });

    const rootTree = {
        id: "data_model",
        name: "DataModel",
        type: "DataModel",
        children: Object.values(services)
    };

    // ── Focused Property Audit ─────────────────────────────────────────────
    const auditItems = nodes.map(n => {
        let path = "Material";
        let val = n.properties.material || "Neon";
        let feat = `${n.type} Texture`;

        if (n.type === "CircularPlatform") {
            path = "Color";
            val = n.properties.color || "#1A1A1A";
            feat = "Arena Base Floor";
        } else if (n.type === "LightingConfig") {
            path = "Technology";
            val = n.properties.technology || "Future";
            feat = "Global Atmosphere";
        } else if (n.type === "GameRoundController") {
            path = "Disabled";
            val = false;
            feat = "Logic Ignition";
        }

        return {
            id: `audit_${n.id}`,
            componentId: n.id!,
            propertyPath: path,
            expectedValue: val,
            reason: "High-fidelity visual match",
            visualFeature: feat
        };
    });

    const vcs = {
        metadata: {
            id: `vcs_${Date.now()}`,
            name: intent,
            version: "3.0.0",
            targetEngine: "Roblox",
            targetPlatforms: ["Desktop"],
            hash: ""
        },
        visualContract: {
            intent: intent,
            aesthetic: "Neon Cyberpunk",
            cameraView: "Perspective"
        },
        structuralSpec: {
            root: rootTree
        },
        propertyAudit: {
            items: auditItems
        },
        capabilityMapping: {
            mappings: [
                { feature: "Neon Atmosphere", enabledByComponentId: "folder_arena_core", requiredService: "Lighting" }
            ]
        },
        validationStatus: {
            status: "Buildable",
            errors: [],
            warnings: []
        }
    };

    // ── Integrity Seal (Hashing) ───────────────────────────────────────────
    const manifestBody = JSON.stringify(vcs.structuralSpec) + JSON.stringify(vcs.propertyAudit);
    vcs.metadata.hash = crypto.createHash('sha256').update(manifestBody).digest('hex');

    return vcs;
  }

  async publishVCS(vcs: any): Promise<boolean> {
    const BRIDGE_URL = 'http://localhost:8080/rehydrate';
    try {
        const response = await fetch(BRIDGE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vcs)
        });
        return response.ok;
    } catch (error) {
        return false;
    }
  }
}
