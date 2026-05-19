/**
 * 💎 Forensic Attack Tree Domain
 * Repurposing Spectral Heat into Tactical Intelligence.
 * Based on the Bookify "DNA Extraction" Operating Concept.
 */

export enum NodeType {
    OR = "OR",
    AND = "AND",
    LEAF = "LEAF"
}

export interface AttackAttributes {
    difficulty: number; // 1-5
    cost: number;       // 1-5
    detectionRisk: number; // 1-5
    timeHours: number;
}

export interface AttackNode {
    id: string;
    name: string;
    description: string;
    type: NodeType;
    attributes: AttackAttributes;
    children: AttackNode[];
    mitigations: string[];
}

export class AttackTreeManifest {
    public root: AttackNode;

    constructor(name: string, description: string, rootGoal: string) {
        this.root = {
            id: 'ROOT',
            name: name,
            description: description,
            type: NodeType.OR,
            attributes: { difficulty: 3, cost: 3, detectionRisk: 3, timeHours: 24 },
            children: [],
            mitigations: []
        };
    }

    /**
     * Repurpose a SpectraReport into an Attack Tree Branch
     */
    public ingestFracture(id: string, hotspots: string[]) {
        const branch: AttackNode = {
            id: `BRANCH_${id}`,
            name: `Exploit Path: ${id}`,
            description: `Repurposed from Spectral Ingestion`,
            type: NodeType.AND,
            attributes: { difficulty: 2, cost: 1, detectionRisk: 4, timeHours: 8 },
            children: [],
            mitigations: []
        };

        hotspots.forEach((h, index) => {
            branch.children.push({
                id: `LEAF_${id}_${index}`,
                name: h.split('|')[0].trim(),
                description: h,
                type: NodeType.LEAF,
                attributes: { 
                    difficulty: h.includes('0.9') ? 4 : 2, 
                    cost: 1, 
                    detectionRisk: 3, 
                    timeHours: 2 
                },
                children: [],
                mitigations: ["OMC-Stabilized Patch", "Identity Gate"]
            });
        });

        this.root.children.push(branch);
    }

    public exportMermaid(): string {
        let mermaid = "flowchart TD\n";
        const traverse = (node: AttackNode, parentId?: string) => {
            const nodeId = node.id.replace(/[^a-zA-Z0-9]/g, '_');
            const shape = node.type === NodeType.OR ? `((${node.name}))` : `[${node.name}]`;
            mermaid += `    ${nodeId}${shape}\n`;
            if (parentId) {
                mermaid += `    ${parentId} --> ${nodeId}\n`;
            }
            node.children.forEach(c => traverse(c, nodeId));
        };
        traverse(this.root);
        return mermaid;
    }
}
