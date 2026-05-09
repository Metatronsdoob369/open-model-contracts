# BLOXBOX PATENT FIGURES (DRAFTS)

## FIG. 1: System Architecture (Collaborator Stance Orchestration)

```mermaid
graph TD
    H[Human User] -- "Opening Ritual: 'Ready to build a game'" --> A[AI Agent]
    A -- "Postural State Triggered Logic (PSTLP)" --> L[RLFSP Governance Layer]
    L -- "Laws/Contracts" --> A
    A -- "Machine-Generated Code" --> P[3-Phase Integrity Pipeline]
    P -- "Validation/AAS Scoring" --> R[Local Repository]
    R -- "Deterministic Deployment" --> V[Virtual Environment / Engine]
```

## FIG. 2: The 3-Phase Integrity Pipeline (Automated Manifestation)

```mermaid
flowchart LR
    subgraph Phase1 [Phase 1: Sanitize]
    S1[Ingest Code] --> S2[Syntax Audit]
    S2 --> S3[Registry Verification]
    end
    
    subgraph Phase2 [Phase 2: Refactor]
    R1[Integrity Scoring] --> R2{AAS > 0.95?}
    R2 -- No --> R3[Refactor Loop]
    R3 --> R1
    end
    
    subgraph Phase3 [Phase 3: Deploy]
    D1[Authorized Manifest] --> D2[Existence Check]
    D2 --> D3[Final Deployment]
    end
    
    Phase1 --> Phase2
    Phase2 -- Yes --> Phase3
```

## FIG. 3: Filesystem Hierarchy (Sovereign Governance Boundary)

```mermaid
graph TD
    Root[/Project Root/] --> Laws[RLFSP Documents]
    Root --> Gears[Gears / Scripts]
    Root --> Canon[Canon / Source]
    
    Laws --> C[COLLABORATION.md]
    Laws --> P[PIPELINE.md]
    Laws --> R[REPOSITORY_CATALOG.md]
    
    Root --> Slop[Exclusion Zones]
    Slop --> G[generated/]
    Slop --> Rep[repaired/]
```
